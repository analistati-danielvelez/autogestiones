import { NextResponse } from "next/server";
import crypto from "crypto";

const CAPTCHA_TTL_SECONDS = 15 * 60;


export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token de captcha requerido" },
        { status: 400 },
      );
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { success: false, message: "Secret key no configurada" },
        { status: 500 },
      );
    }

    const params = new URLSearchParams();
    params.append("secret", secretKey);
    params.append("response", token);

    const googleResponse = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      },
    );

    const data = await googleResponse.json();

    if (!data.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Captcha inválido",
          errors: data["error-codes"] || [],
        },
        { status: 400 },
      );
    }

    const expiresAt = Math.floor(Date.now() / 1000) + CAPTCHA_TTL_SECONDS;

    const proof = crypto
      .createHmac("sha256", secretKey)
      .update(`${expiresAt}`)
      .digest("base64url");

    const response = NextResponse.json({
      success: true,
      message: "Captcha validado correctamente",
    });

    // La prueba firmada impide que se invoquen directamente los endpoints que
    // procesan datos personales sin haber superado el captcha en este cliente.
    response.cookies.set("captcha_proof", `${expiresAt}.${proof}`, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: CAPTCHA_TTL_SECONDS,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error validando captcha" },
      { status: 500 },
    );
  }
}
