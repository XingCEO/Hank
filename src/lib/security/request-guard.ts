import { NextResponse } from "next/server";

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function normalizeOrigin(origin: string): string | null {
  try {
    return new URL(origin).origin;
  } catch {
    return null;
  }
}

function inferProtocol(host: string): string {
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1") || host.startsWith("[::1]")) {
    return "http";
  }
  return "https";
}

function getExpectedOrigin(headers: Headers): string | null {
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  if (!host) {
    return null;
  }

  const protocol = headers.get("x-forwarded-proto") ?? inferProtocol(host);
  return `${protocol}://${host}`;
}

export function guardSameOrigin(request: Request): NextResponse | null {
  if (!WRITE_METHODS.has(request.method.toUpperCase())) {
    return null;
  }

  const origin = request.headers.get("origin");
  if (!origin) {
    return NextResponse.json(
      { ok: false, message: "Missing Origin header." },
      { status: 403 },
    );
  }

  const normalizedOrigin = normalizeOrigin(origin);
  const expectedOrigin = getExpectedOrigin(request.headers);

  if (!normalizedOrigin || !expectedOrigin || normalizedOrigin !== expectedOrigin) {
    return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
  }

  return null;
}

export function getClientIpFromRequest(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim();
  }
  return request.headers.get("x-real-ip") ?? undefined;
}
