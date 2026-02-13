import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { createAuditLog } from "@/lib/audit";
import { getRequestIp, getRequestSession } from "@/lib/auth/request";

export const runtime = "nodejs";

export async function POST() {
  const session = await getRequestSession();

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
      ip: await getRequestIp(),
    });
  }

  return response;
}
