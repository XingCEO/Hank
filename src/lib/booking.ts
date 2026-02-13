import { z } from "zod";

export type ServicePackage = {
  id: string;
  name: string;
  duration: number;
  priceHint: string;
  basePrice: number;
};

export const servicePackages: ServicePackage[] = [
  { id: "wedding-story", name: "婚禮敘事拍攝", duration: 120, priceHint: "NT$ 68,000 起", basePrice: 68000 },
  { id: "brand-editorial", name: "品牌形象拍攝", duration: 90, priceHint: "NT$ 52,000 起", basePrice: 52000 },
  { id: "portrait-signature", name: "肖像風格拍攝", duration: 60, priceHint: "NT$ 36,000 起", basePrice: 36000 },
];

export const bookingSchema = z.object({
  fullName: z.string().min(2, "請至少輸入 2 個字元。"),
  email: z.email("請輸入正確的電子郵件。"),
  phone: z.string().min(8, "請輸入正確的電話號碼。"),
  notes: z.string().max(500, "備註最多 500 字。").optional(),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

export type BookingState = {
  serviceId: string;
  dateKey: string;
  slot: string;
  details: BookingFormData;
};

export type CalendarCell = {
  date: Date;
  key: string;
  inMonth: boolean;
  disabled: boolean;
  isToday: boolean;
};

export type AvailabilityLevel = "open" | "limited" | "full";

export function toDateKey(input: Date): string {
  const year = input.getFullYear();
  const month = `${input.getMonth() + 1}`.padStart(2, "0");
  const day = `${input.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function createMonthMatrix(monthDate: Date, minLeadDays = 2): CalendarCell[] {
  const firstOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1, 12);
  const weekday = (firstOfMonth.getDay() + 6) % 7;
  const startDate = new Date(firstOfMonth);
  startDate.setDate(firstOfMonth.getDate() - weekday);

  const today = new Date();
  const todaySafe = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
  const minDate = new Date(todaySafe);
  minDate.setDate(minDate.getDate() + minLeadDays);

  return Array.from({ length: 42 }, (_, idx) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + idx);
    const isSunday = date.getDay() === 0;
    const inMonth = date.getMonth() === monthDate.getMonth();

    return {
      date,
      key: toDateKey(date),
      inMonth,
      isToday: toDateKey(date) === toDateKey(todaySafe),
      disabled: date < minDate || isSunday,
    };
  });
}

export function generateTimeSlots(serviceDuration = 60): string[] {
  const openHour = 10;
  const closeHour = 19;
  const step = 30;
  const latestStart = closeHour * 60 - serviceDuration;
  const slots: string[] = [];

  for (let minute = openHour * 60; minute <= latestStart; minute += step) {
    const h = `${Math.floor(minute / 60)}`.padStart(2, "0");
    const m = `${minute % 60}`.padStart(2, "0");
    slots.push(`${h}:${m}`);
  }

  return slots;
}

export function getDateAvailability(dateKey: string): AvailabilityLevel {
  const hash = dateKey
    .split("-")
    .join("")
    .split("")
    .reduce((acc, char) => acc + Number(char), 0);

  if (hash % 11 === 0) return "full";
  if (hash % 4 === 0) return "limited";
  return "open";
}

export function getUnavailableSlots(dateKey: string, availability: AvailabilityLevel = "open"): string[] {
  const date = parseDateKey(dateKey);
  const day = date.getDay();
  const base = day === 6 ? ["10:00", "10:30", "16:30", "17:00"] : day === 2 ? ["13:00", "13:30"] : ["12:00"];

  if (availability === "limited") {
    return Array.from(new Set([...base, "11:00", "14:30", "15:00", "15:30"]));
  }

  return base;
}
