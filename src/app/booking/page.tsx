import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { BookingPageClient } from "@/components/booking/booking-page";

export const metadata: Metadata = {
  title: "Book A Session",
  description: "Plan your package, date, and time in one flow, then submit your booking request in minutes.",
};

export default function BookingPage() {
  return (
    <PageShell path="/booking">
      <BookingPageClient />
    </PageShell>
  );
}
