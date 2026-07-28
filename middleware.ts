import { NextRequest, NextResponse } from "next/server";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;
const MAX_JSON_BYTES = 128 * 1024;
const MAX_MULTIPART_BYTES = 16 * 1024 * 1024;
const MAX_BUCKETS = 5000;

const buckets = new Map<string, { count: number; resetAt: number }>();

const PUBLIC_API_PATHS = new Set([
  "/api/validar-captcha",
  "/api/validar-documento",
]);

function clientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

function hasAllowedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const configuredOrigins = [
    process.env.APP_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    request.nextUrl.origin,
  ]
    .filter(Boolean)
    .map((value) => {
      try {
        return new URL(value as string).origin;
      } catch {
        return "";
      }
    });

  return configuredOrigins.includes(origin);
}

function isRateLimited(key: string) {
  const now = Date.now();

  for (const [bucketKey, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(bucketKey);
    }
  }

  if (buckets.size >= MAX_BUCKETS && !buckets.has(key)) {
    return true;
  }

  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
}

async function hasValidCaptchaProof(request: NextRequest) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const value = request.cookies.get("captcha_proof")?.value;
  if (!secret || !value) return false;

  const [expiryText, signature] = value.split(".");
  const expiry = Number(expiryText);
  if (!expiry || expiry < Math.floor(Date.now() / 1000) || !signature) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  try {
    const decoded = Uint8Array.from(
      atob(signature.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0),
    );
    return crypto.subtle.verify(
      "HMAC",
      key,
      decoded,
      new TextEncoder().encode(`${expiry}`),
    );
  } catch {
    return false;
  }
}

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { ok: false, message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function middleware(request: NextRequest) {
  if (request.method === "POST") {
    if (!hasAllowedOrigin(request)) {
      return jsonError("Origen de solicitud no permitido.", 403);
    }

    const key = `${clientIp(request)}:${request.nextUrl.pathname}`;
    if (isRateLimited(key)) {
      return jsonError(
        "Demasiadas solicitudes. Intente nuevamente más tarde.",
        429,
      );
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    const isMultipart = request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("multipart/form-data");
    const maxBytes = isMultipart ? MAX_MULTIPART_BYTES : MAX_JSON_BYTES;

    if (contentLength > maxBytes) {
      return jsonError("La solicitud excede el tamaño permitido.", 413);
    }

    if (
      !PUBLIC_API_PATHS.has(request.nextUrl.pathname) &&
      !(await hasValidCaptchaProof(request))
    ) {
      return jsonError(
        "La validación de seguridad expiró. Por favor actualiza la página y valida nuevamente el captcha.",
        403,
      );
    }
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
