import { NextResponse } from "next/server";
import { getRequestSession } from "@/lib/auth/request";

export const runtime = "nodejs";

export async function GET() {
  const session = await getRequestSession();

  if (!session) {
    return NextResponse.json({ ok: false, message: "尚未登入" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: session.userId,
      email: session.email,
      name: session.name,
      roles: session.roles,
    },
  });
}
