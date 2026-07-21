import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token de captcha requerido" },
        { status: 400 }
      );
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { success: false, message: "Secret key no configurada" },
        { status: 500 }
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
      }
    );

    const data = await googleResponse.json();

    if (!data.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Captcha inválido",
          errors: data["error-codes"] || [],
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Captcha validado correctamente",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error validando captcha" },
      { status: 500 }
    );
  }
}