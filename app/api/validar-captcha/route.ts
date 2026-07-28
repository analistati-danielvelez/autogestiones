import { NextResponse } from "next/server";
import crypto from "crypto";

const CAPTCHA_TTL_SECONDS = 15 * 60;
const CLIENT_ID_TTL_SECONDS = 24 * 60 * 60;

function crearFirmaCaptcha(datos: {
  secretKey: string;
  expiresAt: number;
  clientId: string;
}) {
  return crypto
    .createHmac("sha256", datos.secretKey)
    .update(`${datos.expiresAt}:${datos.clientId}`)
    .digest("base64url");
}

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

    const cookieHeader = request.headers.get("cookie") || "";
    const clientIdExistente = cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith("captcha_client_id="))
      ?.split("=")[1];

    const clientId = clientIdExistente || crypto.randomUUID();
    const expiresAt = Math.floor(Date.now() / 1000) + CAPTCHA_TTL_SECONDS;

    const proof = crearFirmaCaptcha({
      secretKey,
      expiresAt,
      clientId,
    });

    const response = NextResponse.json({
      success: true,
      message: "Captcha validado correctamente",
    });

    response.cookies.set("captcha_client_id", clientId, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: CLIENT_ID_TTL_SECONDS,
      path: "/",
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