import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { BookingPageClient } from "@/components/booking/booking-page";

export const metadata: Metadata = {
  title: "預約",
  description: "使用禮賓級流程預約高端攝影服務，快速完成時段與需求提交。",
};

export default function BookingPage() {
  return (
    <PageShell path="/booking">
      <BookingPageClient />
    </PageShell>
  );
}
