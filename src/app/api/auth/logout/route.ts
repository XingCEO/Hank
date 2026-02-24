import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/audit";
import { getRequestSession } from "@/lib/auth/request";
import { getSessionCookieOptions } from "@/lib/auth/session";
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
    ...getSessionCookieOptions(),
    value: "",
    maxAge: 0,
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
