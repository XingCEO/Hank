"use client";

import { useEffect, useMemo, useState } from "react";
import { addMonths, format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { ArrowLeft, ArrowRight, CalendarRange, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OptionChip, FieldError } from "@/components/ultra/booking-primitives";
import { Reveal } from "@/components/ultra/reveal";
import { AccentDivider, SectionHeading, PremiumCard, SectionShell } from "@/components/ultra/section";
import {
  bookingSchema,
  createMonthMatrix,
  generateTimeSlots,
  getDateAvailability,
  getUnavailableSlots,
  parseDateKey,
  type BookingFormData,
  servicePackages,
} from "@/lib/booking";

const STORAGE_KEY = "ultra-booking-draft";

const defaultFormValues: BookingFormData = {
  fullName: "",
  email: "",
  phone: "",
  notes: "",
};

type BookingDraft = {
  serviceId?: string;
  dateKey?: string;
  slot?: string;
  details?: BookingFormData;
};

type EstimatorAddons = {
  shortFilm: boolean;
  expressRetouch: boolean;
  rushDelivery: boolean;
};

function readDraft(): BookingDraft {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};

  try {
    return JSON.parse(raw) as BookingDraft;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return {};
  }
}

function formatTwd(value: number): string {
  const rounded = Math.round(value);
  return `NT$ ${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export function BookingPageClient() {
  const [isMounted, setIsMounted] = useState(false);
  const [monthCursor, setMonthCursor] = useState(new Date());
  const [serviceId, setServiceId] = useState(servicePackages[0].id);
  const [dateKey, setDateKey] = useState("");
  const [slot, setSlot] = useState("");
  const [extraHours, setExtraHours] = useState(0);
  const [addons, setAddons] = useState<EstimatorAddons>({
    shortFilm: false,
    expressRetouch: false,
    rushDelivery: false,
  });
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: defaultFormValues,
  });

  const watchedDetails = useWatch({ control: form.control });

  useEffect(() => {
    // Hydration guard: render client-only calendar state after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);

    const draft = readDraft();
    if (draft.serviceId) setServiceId(draft.serviceId);
    if (draft.dateKey) {
      setDateKey(draft.dateKey);
      setMonthCursor(parseDateKey(draft.dateKey));
    }
    if (draft.slot) setSlot(draft.slot);
    if (draft.details) {
      form.reset({
        ...defaultFormValues,
        ...draft.details,
      });
    }
  }, [form]);

  useEffect(() => {
    if (!isMounted) return;
    const payload = JSON.stringify({ serviceId, dateKey, slot, details: watchedDetails });
    window.localStorage.setItem(STORAGE_KEY, payload);
  }, [dateKey, isMounted, serviceId, slot, watchedDetails]);

  const activeService = useMemo(
    () => servicePackages.find((item) => item.id === serviceId) ?? servicePackages[0],
    [serviceId],
  );

  const calendar = useMemo(() => {
    if (!isMounted) return [];
    return createMonthMatrix(monthCursor, 2);
  }, [isMounted, monthCursor]);

  const selectedDateAvailability = useMemo(() => {
    if (!dateKey) return "open";
    return getDateAvailability(dateKey);
  }, [dateKey]);

  const availabilityStats = useMemo(() => {
    return calendar.reduce(
      (acc, cell) => {
        if (!cell.inMonth || cell.disabled) return acc;
        const level = getDateAvailability(cell.key);
        if (level === "open") acc.open += 1;
        if (level === "limited") acc.limited += 1;
        if (level === "full") acc.full += 1;
        return acc;
      },
      { open: 0, limited: 0, full: 0 },
    );
  }, [calendar]);

  const availableSlots = useMemo(() => {
    if (!isMounted) return [];
    const raw = generateTimeSlots(activeService.duration);
    if (!dateKey) return raw;
    if (selectedDateAvailability === "full") return [];

    const blocked = new Set(getUnavailableSlots(dateKey, selectedDateAvailability));
    return raw.filter((item) => !blocked.has(item));
  }, [activeService.duration, dateKey, isMounted, selectedDateAvailability]);

  const estimator = useMemo(() => {
    const addOnPrices = {
      shortFilm: 9000,
      expressRetouch: 6500,
      rushDelivery: 12000,
    };

    const addOnTotal =
      (addons.shortFilm ? addOnPrices.shortFilm : 0) +
      (addons.expressRetouch ? addOnPrices.expressRetouch : 0) +
      (addons.rushDelivery ? addOnPrices.rushDelivery : 0);

    const hourlyRate = Math.round((activeService.basePrice / (activeService.duration / 60)) * 0.4);
    const extraHoursFee = extraHours * hourlyRate;
    const total = activeService.basePrice + addOnTotal + extraHoursFee;

    return {
      addOnTotal,
      extraHoursFee,
      hourlyRate,
      total,
    };
  }, [activeService.basePrice, activeService.duration, addons, extraHours]);

  const onSubmit = form.handleSubmit(async (details) => {
    if (!dateKey || !slot) {
      setStatus("error");
      return;
    }
    setStatus("saving");
    const response = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId, dateKey, slot, details }),
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    setStatus("success");
    window.localStorage.removeItem(STORAGE_KEY);
    form.reset(defaultFormValues);
    setDateKey("");
    setSlot("");
    setExtraHours(0);
    setAddons({
      shortFilm: false,
      expressRetouch: false,
      rushDelivery: false,
    });
  });

  return (
    <>
      <SectionShell className="pt-[var(--space-top-offset)]">
        <div className="container-ultra relative">
          <Reveal>
            <SectionHeading
              kicker="私人預約"
              title="以清楚、禮賓級流程預約您的拍攝時段"
              copy="選擇服務、鎖定日期並填寫專案需求。我們會於 4 個工作小時內回覆每筆申請。"
            />
          </Reveal>
          <div className="mt-8">
            <AccentDivider />
          </div>
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <div className="container-ultra grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <PremiumCard>
              <div className="mb-8 space-y-4">
                <p className="text-[0.7rem] font-medium tracking-[0.14em] text-foreground/50 uppercase">步驟 1 · 選擇日期</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="rounded-md border border-border/40 bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
                    可預約：<span className="text-foreground">{availabilityStats.open}</span> 天
                  </div>
                  <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
                    高需求：<span className="text-amber-900">{availabilityStats.limited}</span> 天
                  </div>
                  <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-red-700">
                    已滿檔：<span className="text-red-900">{availabilityStats.full}</span> 天
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border/80 bg-white/70 px-3 py-2">
                  <Button variant="ghost" size="icon" onClick={() => setMonthCursor((d) => addMonths(d, -1))}>
                    <ArrowLeft className="size-4" />
                  </Button>
                  <p className="text-sm tracking-[0.16em] uppercase">
                    {isMounted ? format(monthCursor, "yyyy 年 M 月") : "載入中"}
                  </p>
                  <Button variant="ghost" size="icon" onClick={() => setMonthCursor((d) => addMonths(d, 1))}>
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
                  {["一", "二", "三", "四", "五", "六", "日"].map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                  {!isMounted
                    ? Array.from({ length: 35 }, (_, index) => (
                        <span
                          key={`calendar-skeleton-${index}`}
                          className="h-10 rounded-md border border-border/30 bg-secondary/10"
                        />
                      ))
                    : calendar.map((cell) => {
                        const availability = getDateAvailability(cell.key);
                        const isFullyBooked = availability === "full";
                        const isDisabled = cell.disabled || isFullyBooked;

                        return (
                          <button
                            key={cell.key}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                              setDateKey(cell.key);
                              setSlot("");
                            }}
                            className={[
                              "focus-ring h-10 rounded-md border text-sm transition-colors",
                              cell.inMonth ? "border-border/40" : "border-transparent opacity-30",
                              isDisabled ? "cursor-not-allowed text-muted-foreground/50" : "hover:border-primary/80",
                              availability === "limited" ? "bg-amber-500/10 border-amber-500/40" : "",
                              isFullyBooked ? "bg-destructive/10 border-destructive/40" : "",
                              dateKey === cell.key ? "border-primary bg-primary text-primary-foreground" : "bg-secondary/30",
                            ].join(" ")}
                            title={availability === "full" ? "此日期已滿檔" : availability === "limited" ? "此日期剩餘名額較少" : "可預約"}
                          >
                            {cell.date.getDate()}
                          </button>
                        );
                      })}
                </div>
              </div>

              <div className="mb-8 space-y-4">
                <p className="text-[0.7rem] font-medium tracking-[0.14em] text-foreground/50 uppercase">步驟 2 · 選擇時段</p>
                <div className="flex flex-wrap gap-2">
                  {!isMounted ? (
                    <p className="text-sm text-muted-foreground">正在載入可用時段...</p>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-sm text-destructive">此日期目前無可預約時段，請改選其他日期。</p>
                  ) : (
                    availableSlots.map((time) => (
                      <OptionChip key={time} active={slot === time} onClick={() => setSlot(time)}>
                        {time}
                      </OptionChip>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[0.7rem] font-medium tracking-[0.14em] text-foreground/50 uppercase">步驟 3 · 選擇服務與需求</p>
                <div className="flex flex-wrap gap-3">
                  {servicePackages.map((item) => (
                    <OptionChip
                      key={item.id}
                      active={serviceId === item.id}
                      onClick={() => {
                        setServiceId(item.id);
                        setSlot("");
                      }}
                    >
                      {item.name}
                    </OptionChip>
                  ))}
                </div>
                <div>
                  <Label htmlFor="notes">專案備註</Label>
                  <Textarea
                    id="notes"
                    className="mt-2 min-h-32 focus-ring"
                    placeholder="請填寫目標、參考風格、上線日期與使用渠道。"
                    {...form.register("notes")}
                  />
                  <FieldError message={form.formState.errors.notes?.message} />
                </div>
              </div>
            </PremiumCard>
          </Reveal>

          <div className="space-y-5">
            <Reveal delay={0.06}>
              <PremiumCard>
                <p className="text-[0.7rem] font-medium tracking-[0.14em] text-foreground/50 uppercase">快速估價器</p>
                <h3 className="mt-3 text-xl font-semibold">即時試算預算範圍</h3>
                <p className="mt-2 text-sm text-muted-foreground">可先預估總預算，再進入正式預約。</p>

                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">加購項目</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <OptionChip
                        active={addons.shortFilm}
                        onClick={() => setAddons((prev) => ({ ...prev, shortFilm: !prev.shortFilm }))}
                      >
                        精華短片 +NT$ 9,000
                      </OptionChip>
                      <OptionChip
                        active={addons.expressRetouch}
                        onClick={() => setAddons((prev) => ({ ...prev, expressRetouch: !prev.expressRetouch }))}
                      >
                        快速修圖 +NT$ 6,500
                      </OptionChip>
                      <OptionChip
                        active={addons.rushDelivery}
                        onClick={() => setAddons((prev) => ({ ...prev, rushDelivery: !prev.rushDelivery }))}
                      >
                        急件交付 +NT$ 12,000
                      </OptionChip>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">延長拍攝時數：{extraHours} 小時</p>
                    <input
                      type="range"
                      min={0}
                      max={4}
                      step={1}
                      value={extraHours}
                      onChange={(event) => setExtraHours(Number(event.target.value))}
                      className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      每小時加價約 {formatTwd(estimator.hourlyRate)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-secondary/30 p-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">方案底價</span>
                      <span>{formatTwd(activeService.basePrice)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-muted-foreground">加購合計</span>
                      <span>{formatTwd(estimator.addOnTotal)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-muted-foreground">延長時數</span>
                      <span>{formatTwd(estimator.extraHoursFee)}</span>
                    </div>
                    <div className="mt-3 border-t border-border/40 pt-3">
                      <div className="flex items-center justify-between font-medium">
                        <span>預估總額</span>
                        <span className="font-semibold text-lg">{formatTwd(estimator.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </PremiumCard>
            </Reveal>

            <Reveal delay={0.12}>
              <PremiumCard className="h-full">
                <p className="mb-6 text-[0.7rem] font-medium tracking-[0.14em] text-foreground/50 uppercase">步驟 4 · 填寫聯絡資訊</p>
                <form className="space-y-4" onSubmit={onSubmit}>
                  <div>
                    <Label htmlFor="fullName">姓名</Label>
                    <Input id="fullName" className="mt-2 focus-ring" {...form.register("fullName")} />
                    <FieldError message={form.formState.errors.fullName?.message} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="email">電子郵件</Label>
                      <Input id="email" type="email" className="mt-2 focus-ring" {...form.register("email")} />
                      <FieldError message={form.formState.errors.email?.message} />
                    </div>
                    <div>
                      <Label htmlFor="phone">電話</Label>
                      <Input id="phone" className="mt-2 focus-ring" {...form.register("phone")} />
                      <FieldError message={form.formState.errors.phone?.message} />
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-secondary/30 p-4 text-sm">
                    <p className="font-medium">已選方案：{activeService.name}</p>
                    <p className="text-muted-foreground">{activeService.priceHint}</p>
                    <div className="mt-3 flex flex-wrap gap-4 text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CalendarRange className="size-4" />
                        {dateKey || "請選擇日期"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="size-4" />
                        {slot || "請選擇時段"}
                      </span>
                    </div>
                  </div>

                  <Button className="focus-ring w-full" type="submit" disabled={status === "saving"}>
                    {status === "saving" ? "送出中..." : "送出預約申請"}
                  </Button>

                  {status === "success" ? (
                    <p className="text-sm text-primary">已收到您的申請，我們將儘快與您聯繫。</p>
                  ) : null}
                  {status === "error" ? (
                    <p className="text-sm text-destructive">請完成日期與時段選擇，並確認表單內容。</p>
                  ) : null}
                </form>
              </PremiumCard>
            </Reveal>
          </div>
        </div>
      </SectionShell>
    </>
  );
}
