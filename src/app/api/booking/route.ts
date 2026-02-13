import { NextResponse } from "next/server";
import { bookingSchema, servicePackages } from "@/lib/booking";

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as {
      serviceId?: string;
      dateKey?: string;
      slot?: string;
      details?: unknown;
    };

    const serviceExists = servicePackages.some((item) => item.id === payload.serviceId);
    const detailsResult = bookingSchema.safeParse(payload.details);

    if (!serviceExists || !payload.dateKey || !payload.slot || !detailsResult.success) {
      return NextResponse.json({ ok: false, message: "預約資料格式不正確" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, reference: `BK-${Date.now()}` }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false, message: "系統暫時無法處理預約" }, { status: 500 });
  }
}
