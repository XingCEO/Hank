import { NextResponse } from "next/server";
import { z } from "zod";
import { bookingSchema, servicePackages } from "@/lib/booking";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { getClientIpFromRequest, guardSameOrigin } from "@/lib/security/request-guard";

const bookingRequestSchema = z.object({
  serviceId: z.string().min(1),
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slot: z.string().regex(/^\d{2}:\d{2}$/),
  details: bookingSchema,
});

export async function POST(req: Request) {
  const blockedByOrigin = guardSameOrigin(req);
  if (blockedByOrigin) {
    return blockedByOrigin;
  }

  const clientIp = getClientIpFromRequest(req) ?? "unknown";
  const rateLimit = consumeRateLimit({
    key: `booking:create:${clientIp}`,
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json({ ok: false, message: "Too many booking attempts. Please try again later." }, { status: 429 });
  }

  try {
    const payload = bookingRequestSchema.parse(await req.json());
    const serviceExists = servicePackages.some((item) => item.id === payload.serviceId);

    if (!serviceExists) {
      return NextResponse.json({ ok: false, message: "Service not found." }, { status: 400 });
    }

    return NextResponse.json({ ok: true, reference: `BK-${Date.now()}` }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, message: error.issues[0]?.message ?? "Invalid booking request." }, { status: 400 });
    }
    return NextResponse.json({ ok: false, message: "Failed to create booking." }, { status: 500 });
  }
}
