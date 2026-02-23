import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { createAuditLog } from "@/lib/audit";
import { getRequestSession } from "@/lib/auth/request";
import { getClientIpFromRequest, guardSameOrigin } from "@/lib/security/request-guard";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const blockedByOrigin = guardSameOrigin(req);
  if (blockedByOrigin) {
    return blockedByOrigin;
  }

  const session = await getRequestSession();
  const clientIp = getClientIpFromRequest(req);

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/",
    httpOnly: true,
  });

  if (session) {
    await createAuditLog({
      actorUserId: session.userId,
      action: "auth.logout",
      resourceType: "user",
      resourceId: session.userId,
      ip: clientIp,
    });
  }

  return response;
}
