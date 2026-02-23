"use client";

import { useEffect, useMemo, useState } from "react";
import { addMonths, format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { ArrowLeft, ArrowRight, CalendarRange, Clock3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OptionChip, FieldError } from "@/components/ultra/booking-primitives";
import { Reveal } from "@/components/ultra/reveal";
import { GoldDivider, LuxuryHeading, PremiumCard, SectionShell } from "@/components/ultra/section";
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
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

type BookingApiResponse = {
  ok?: boolean;
  message?: string;
  reference?: string;
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

function getAvailabilityLabel(level: "open" | "limited" | "full"): string {
  if (level === "full") return "Full";
  if (level === "limited") return "Limited";
  return "Open";
}

function getAvailabilityClass(level: "open" | "limited" | "full"): string {
  if (level === "full") return "border-destructive/30 bg-destructive/10 text-destructive";
  if (level === "limited") return "border-primary/35 bg-primary/10 text-primary";
  return "border-emerald-500/35 bg-emerald-500/10 text-emerald-700";
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
  const [statusMessage, setStatusMessage] = useState("");

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: defaultFormValues,
  });

  const watchedDetails = useWatch({ control: form.control });

  useEffect(() => {
    // Hydration guard for client-only calendar state.
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

  const currentMonthStart = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);

  const canGoPrevMonth = useMemo(() => {
    const previousMonth = addMonths(new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1), -1);
    return previousMonth.getTime() >= currentMonthStart.getTime();
  }, [currentMonthStart, monthCursor]);

  const onSubmit = form.handleSubmit(async (details) => {
    if (!dateKey || !slot) {
      setStatus("error");
      setStatusMessage("Please choose both a date and a time slot.");
      return;
    }

    setStatus("saving");
    setStatusMessage("");

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, dateKey, slot, details }),
      });

      const data = (await response.json().catch(() => ({}))) as BookingApiResponse;

      if (!response.ok || !data.ok) {
        setStatus("error");
        setStatusMessage(data.message ?? "Unable to submit booking. Please try again.");
        return;
      }

      setStatus("success");
      setStatusMessage(data.reference ? `Submitted successfully. Ref: ${data.reference}` : "Submitted successfully.");
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
    } catch {
      setStatus("error");
      setStatusMessage("Network error. Please check your connection and try again.");
    }
  });

  return (
    <>
      <SectionShell className="pt-[var(--space-top-offset)]">
        <div className="container-ultra relative">
          <Reveal>
            <LuxuryHeading
              kicker="BOOKING STUDIO"
              title="Design Your Shoot Flow In Four Steps"
              copy="Select your package, lock a date and time, estimate add-ons, then submit your contact details. Everything stays in draft locally until you send."
            />
          </Reveal>
          <div className="mt-8">
            <GoldDivider />
          </div>
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <div className="container-ultra grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal>
            <PremiumCard className="overflow-hidden">
              <div className="mb-7 flex flex-wrap gap-2">
                {["1. Package", "2. Date", "3. Time"].map((step) => (
                  <span key={step} className="rounded-full border border-border/70 bg-secondary/35 px-3 py-1 text-xs tracking-[0.14em] uppercase">
                    {step}
                  </span>
                ))}
              </div>

              <div className="space-y-8">
                <section className="space-y-3">
                  <p className="text-xs tracking-[0.26em] text-primary uppercase">Step 1</p>
                  <h3 className="text-2xl">Choose Package</h3>
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
                </section>

                <section className="space-y-4">
                  <p className="text-xs tracking-[0.26em] text-primary uppercase">Step 2</p>
                  <h3 className="text-2xl">Pick Date</h3>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="rounded-md border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700">
                      Open <span className="font-semibold text-emerald-900">{availabilityStats.open}</span>
                    </div>
                    <div className="rounded-md border border-primary/35 bg-primary/10 px-3 py-2 text-xs text-primary">
                      Limited <span className="font-semibold text-foreground">{availabilityStats.limited}</span>
                    </div>
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                      Full <span className="font-semibold text-destructive">{availabilityStats.full}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card/35 px-3 py-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={!canGoPrevMonth}
                      onClick={() => setMonthCursor((d) => addMonths(d, -1))}
                    >
                      <ArrowLeft className="size-4" />
                    </Button>
                    <p className="text-sm tracking-[0.14em] uppercase">{isMounted ? format(monthCursor, "MMMM yyyy") : "Loading"}</p>
                    <Button variant="ghost" size="icon" onClick={() => setMonthCursor((d) => addMonths(d, 1))}>
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
                    {DAY_LABELS.map((day) => (
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
                                "focus-luxury h-10 rounded-md border text-sm transition-colors",
                                cell.inMonth ? "border-border/70" : "border-transparent opacity-30",
                                isDisabled ? "cursor-not-allowed text-muted-foreground/50" : "hover:border-primary/80",
                                availability === "limited" ? "bg-primary/10 border-primary/35" : "",
                                isFullyBooked ? "bg-destructive/10 border-destructive/30" : "",
                                dateKey === cell.key ? "border-primary bg-primary text-primary-foreground" : "bg-secondary/22",
                              ].join(" ")}
                              title={getAvailabilityLabel(availability)}
                            >
                              {cell.date.getDate()}
                            </button>
                          );
                        })}
                  </div>
                </section>

                <section className="space-y-3">
                  <p className="text-xs tracking-[0.26em] text-primary uppercase">Step 3</p>
                  <h3 className="text-2xl">Choose Time</h3>
                  <div className="flex flex-wrap gap-2">
                    {!isMounted ? (
                      <p className="text-sm text-muted-foreground">Loading available times...</p>
                    ) : availableSlots.length === 0 ? (
                      <p className="text-sm text-destructive">No slots available for this day. Please select another date.</p>
                    ) : (
                      availableSlots.map((time) => (
                        <OptionChip key={time} active={slot === time} onClick={() => setSlot(time)}>
                          {time}
                        </OptionChip>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </PremiumCard>
          </Reveal>

          <div className="space-y-5">
            <Reveal delay={0.06}>
              <PremiumCard>
                <p className="text-xs tracking-[0.26em] text-primary uppercase">Live Estimate</p>
                <h3 className="mt-3 text-2xl">Shape The Budget Before Checkout</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add production extras and overtime to preview pricing in real time.
                </p>

                <div className="mt-6 space-y-5">
                  <div>
                    <p className="text-sm text-muted-foreground">Optional Add-ons</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <OptionChip
                        active={addons.shortFilm}
                        onClick={() => setAddons((prev) => ({ ...prev, shortFilm: !prev.shortFilm }))}
                      >
                        Short film +NT$ 9,000
                      </OptionChip>
                      <OptionChip
                        active={addons.expressRetouch}
                        onClick={() => setAddons((prev) => ({ ...prev, expressRetouch: !prev.expressRetouch }))}
                      >
                        Express retouch +NT$ 6,500
                      </OptionChip>
                      <OptionChip
                        active={addons.rushDelivery}
                        onClick={() => setAddons((prev) => ({ ...prev, rushDelivery: !prev.rushDelivery }))}
                      >
                        Rush delivery +NT$ 12,000
                      </OptionChip>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Overtime hours: {extraHours}h</p>
                    <input
                      type="range"
                      min={0}
                      max={4}
                      step={1}
                      value={extraHours}
                      onChange={(event) => setExtraHours(Number(event.target.value))}
                      className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">Hourly estimate: {formatTwd(estimator.hourlyRate)}</p>
                  </div>

                  <div className="rounded-xl border border-border/80 bg-secondary/20 p-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Base package</span>
                      <span>{formatTwd(activeService.basePrice)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-muted-foreground">Add-ons</span>
                      <span>{formatTwd(estimator.addOnTotal)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-muted-foreground">Overtime</span>
                      <span>{formatTwd(estimator.extraHoursFee)}</span>
                    </div>
                    <div className="mt-3 border-t border-border/70 pt-3">
                      <div className="flex items-center justify-between font-medium">
                        <span>Estimated total</span>
                        <span className="gold-text text-lg">{formatTwd(estimator.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </PremiumCard>
            </Reveal>

            <Reveal delay={0.12}>
              <PremiumCard className="h-full">
                <p className="mb-6 text-xs tracking-[0.26em] text-primary uppercase">Step 4. Contact Details</p>
                <form className="space-y-4" onSubmit={onSubmit}>
                  <div>
                    <Label htmlFor="fullName">Full name</Label>
                    <Input id="fullName" className="mt-2 focus-luxury" {...form.register("fullName")} />
                    <FieldError message={form.formState.errors.fullName?.message} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" className="mt-2 focus-luxury" {...form.register("email")} />
                      <FieldError message={form.formState.errors.email?.message} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" className="mt-2 focus-luxury" {...form.register("phone")} />
                      <FieldError message={form.formState.errors.phone?.message} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Project notes</Label>
                    <Textarea
                      id="notes"
                      className="mt-2 min-h-32 focus-luxury"
                      placeholder="Share location, mood, references, and any production requests."
                      {...form.register("notes")}
                    />
                    <FieldError message={form.formState.errors.notes?.message} />
                  </div>

                  <div className="rounded-xl border border-border/80 bg-secondary/20 p-4 text-sm">
                    <p className="font-medium">{activeService.name}</p>
                    <p className="text-muted-foreground">{activeService.priceHint}</p>
                    <div className="mt-3 flex flex-wrap gap-4 text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CalendarRange className="size-4" />
                        {dateKey || "No date selected"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="size-4" />
                        {slot || "No time selected"}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${getAvailabilityClass(selectedDateAvailability)}`}>
                        <Sparkles className="size-3" />
                        {getAvailabilityLabel(selectedDateAvailability)}
                      </span>
                    </div>
                  </div>

                  <Button className="focus-luxury w-full" type="submit" disabled={status === "saving"}>
                    {status === "saving" ? "Submitting..." : "Submit booking request"}
                  </Button>

                  {status !== "idle" && statusMessage ? (
                    <p className={`text-sm ${status === "success" ? "text-primary" : "text-destructive"}`}>{statusMessage}</p>
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
