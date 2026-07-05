import { useState, useMemo, useEffect, useRef } from "preact/hooks";
import type { BookingStep, ServiceItem, StaffMember, TimeSlot } from "../../lib/booking";
import { CATEGORIES, STEP_LABELS, STAFF_GRADIENTS, STAFF_INITIALS } from "../../lib/booking";
import { config } from "../../lib/config";

interface BookingWidgetProps {
  services: ServiceItem[];
  staff: StaffMember[];
}

const ALL_SERVICES: ServiceItem[] = [];

function generateTimeSlots(date: string, duration: number): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const base = new Date(`${date}T08:00:00`);
  const end = new Date(`${date}T19:00:00`);
  while (base < end) {
    const h = base.getHours().toString().padStart(2, "0");
    const m = base.getMinutes().toString().padStart(2, "0");
    slots.push({ time: `${h}:${m}`, available: true });
    base.setMinutes(base.getMinutes() + 30);
  }
  return slots;
}

function getMonday(d: Date): Date {
  const dt = new Date(d);
  const day = dt.getDay();
  const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
  dt.setDate(diff);
  return dt;
}

function CalendarGrid({ selectedDate, onSelect, errors }: { selectedDate: string; onSelect: (d: string) => void; errors?: Record<string, string> }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const monday = getMonday(new Date());
  monday.setDate(monday.getDate() + weekOffset * 7);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div>
      <div class="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setWeekOffset((w) => w - 1)}
          disabled={weekOffset === 0}
          class="p-2 rounded-full hover:bg-champagne disabled:opacity-30 transition-colors"
          aria-label="Previous week"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <p class="font-display text-base font-semibold text-espresso">
          {days[0].toLocaleDateString("en-KE", { month: "long", day: "numeric" })} – {days[6].toLocaleDateString("en-KE", { month: "long", day: "numeric", year: "numeric" })}
        </p>
        <button
          type="button"
          onClick={() => setWeekOffset((w) => w + 1)}
          class="p-2 rounded-full hover:bg-champagne transition-colors"
          aria-label="Next week"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
      <div class="grid grid-cols-7 gap-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <span key={day} class="text-center font-body text-xs text-warm-taupe uppercase tracking-wider py-1">{day}</span>
        ))}
        {days.map((d) => {
          const dateStr = d.toISOString().split("T")[0];
          const isPast = d < today;
          const isSelected = dateStr === selectedDate;
          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => !isPast && onSelect(dateStr)}
              disabled={isPast}
              class={`aspect-square rounded-full flex flex-col items-center justify-center transition-all text-sm ${
                isSelected
                  ? "bg-gold-leaf text-espresso font-semibold"
                  : isPast
                    ? "text-warm-taupe/30 cursor-not-allowed"
                    : "text-espresso hover:bg-champagne"
              }`}
            >
              <span class="font-body text-sm leading-none">{d.getDate()}</span>
            </button>
          );
        })}
      </div>
      {errors?.date && <p class="mt-2 font-body text-xs text-red-500">{errors.date}</p>}
    </div>
  );
}

function StepIndicator({ current, steps }: { current: BookingStep; steps: BookingStep[] }) {
  const idx = steps.indexOf(current);

  return (
    <div class="flex items-center justify-center gap-1 mb-10" aria-label="Booking progress">
      {steps.filter((s) => s !== "confirmed").map((s, i) => (
        <div class="flex items-center" key={s}>
          <div
            class={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-[var(--duration-normal)] ${
              i <= idx ? "bg-gold-leaf text-espresso" : "bg-champagne text-warm-taupe"
            }`}
          >
            <span class="font-accent text-xs font-semibold">{i + 1}</span>
          </div>
          {i < steps.filter((s) => s !== "confirmed").length - 1 && (
            <div class={`w-6 md:w-10 h-px mx-1 transition-all duration-[var(--duration-normal)] ${i < idx ? "bg-gold-leaf" : "bg-champagne"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function BookingWidget({ services: propServices, staff: propStaff }: BookingWidgetProps) {
  const services = propServices.length > 0 ? propServices : ALL_SERVICES;

  const STEPS: BookingStep[] = ["services", "staff", "datetime", "details", "review", "confirmed"];

  const [step, setStep] = useState<BookingStep>("services");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [category, setCategory] = useState("nails");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const turnstileLoaded = useRef(false);

  const filteredServices = useMemo(
    () => services.filter((s) => s.category === category),
    [category, services]
  );

  const selectedServiceObjects = useMemo(
    () => services.filter((s) => selectedServices.includes(s.id)),
    [selectedServices, services]
  );

  const totalDuration = useMemo(
    () => selectedServiceObjects.reduce((sum, s) => sum + s.duration, 0),
    [selectedServiceObjects]
  );

  const totalPrice = useMemo(
    () => selectedServiceObjects.reduce((sum, s) => sum + s.price, 0),
    [selectedServiceObjects]
  );

  const selectedStaffMember = useMemo(
    () => propStaff.find((s) => s.id === selectedStaff),
    [selectedStaff, propStaff]
  );

  // Fetch available time slots from API
  useEffect(() => {
    if (!date) return;
    setLoadingSlots(true);
    setTime("");
    setTimeSlots([]);

    const params = new URLSearchParams({ date });
    if (selectedStaff) params.set("staffId", selectedStaff);

    fetch(`${config.apiUrl}/api/availability?${params}`)
      .then((r) => r.json())
      .then((res) => {
        const slots: TimeSlot[] = res.data || [];
        setTimeSlots(slots);
      })
      .catch(() => {
        setTimeSlots(generateTimeSlots(date, totalDuration));
      })
      .finally(() => setLoadingSlots(false));
  }, [date, selectedStaff]);

  // Load Turnstile script
  useEffect(() => {
    if (turnstileLoaded.current || typeof window === "undefined") return;
    if (!document.getElementById("cf-turnstile-script") && (window as any).turnstile) {
      turnstileLoaded.current = true;
      return;
    }
    if (document.getElementById("cf-turnstile-script")) {
      turnstileLoaded.current = true;
      return;
    }
    const script = document.createElement("script");
    script.id = "cf-turnstile-script";
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    turnstileLoaded.current = true;
  }, []);

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
    setErrors({});
  };

  const goTo = (next: BookingStep) => {
    const errs: Record<string, string> = {};

    if (next === "staff" && selectedServices.length === 0) {
      errs.services = "Please select at least one service";
    }
    if (next === "datetime" && !selectedStaff) {
      errs.staff = "Please select a preferred staff member";
    }
    if (next === "details" && (!date || !time)) {
      if (!date) errs.date = "Please select a date";
      if (!time) errs.time = "Please select a time";
    }
    if (next === "review") {
      if (!name || name.length < 2) errs.name = "Name is required (min 2 characters)";
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Valid email is required";
      if (!phone || !/^\+?254\d{9}$/.test(phone)) errs.phone = "Valid Kenyan phone (e.g., +254700000000)";
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setStep(next);
  };

  const handleSubmit = async () => {
    if (honeypotRef.current?.value) return;

    setSubmitting(true);
    setSubmitError("");

    // Get Turnstile token
    let turnstileToken = "";
    try {
      turnstileToken = (window as any).turnstile?.getResponse() || "";
    } catch {}

    try {
      const payload = {
        services: selectedServices,
        staffId: selectedStaff || undefined,
        date,
        time,
        name,
        email,
        phone,
        notes: notes || undefined,
        turnstile: turnstileToken || undefined,
      };

      const res = await fetch(`${config.apiUrl}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setStep("confirmed");
    } catch (err: any) {
      setSubmitError(err.message || "Network error. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep("services");
    setSelectedServices([]);
    setSelectedStaff("");
    setDate("");
    setTime("");
    setName("");
    setEmail("");
    setPhone("");
    setNotes("");
    setErrors({});
    setCategory("nails");
    setSubmitError("");
    setTimeSlots([]);
  };

  const stepIdx = STEPS.indexOf(step);

  return (
    <div class="rounded-[var(--radius-xl)] bg-warm-white p-6 lg:p-10 shadow-elevated border border-champagne">
      {step !== "confirmed" && <StepIndicator current={step} steps={STEPS} />}

      {/* STEP 1: Services */}
      {step === "services" && (
        <div class="animate-fadeIn">
          <h2 class="font-display text-2xl font-semibold text-espresso mb-1">Choose Your Services</h2>
          <p class="font-body text-sm text-warm-taupe mb-6">Select one or more services.</p>

          <div class="flex flex-wrap gap-2 mb-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                class={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-accent text-xs uppercase tracking-[0.1em] font-semibold transition-all duration-[var(--duration-fast)] ${
                  category === cat.id
                    ? "bg-gold-leaf text-espresso"
                    : "bg-champagne/50 text-warm-taupe hover:bg-champagne"
                }`}
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d={cat.icon} />
                </svg>
                {cat.label}
              </button>
            ))}
          </div>

          <div class="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
            {filteredServices.map((s) => {
              const selected = selectedServices.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleService(s.id)}
                  class={`w-full flex items-center justify-between p-4 rounded-[var(--radius-lg)] border-2 text-left transition-all duration-[var(--duration-fast)] ${
                    selected
                      ? "border-gold-leaf bg-champagne/30"
                      : "border-transparent bg-ivory-silk hover:border-champagne"
                  }`}
                >
                  <div class="flex-1 min-w-0">
                    <p class="font-display text-base font-semibold text-espresso">{s.title}</p>
                    <p class="font-body text-xs text-warm-taupe mt-0.5 line-clamp-1">{s.description}</p>
                  </div>
                  <div class="flex items-center gap-3 ml-3 shrink-0">
                    <div class="text-right">
                      <p class="font-accent text-sm font-semibold text-gold-leaf">KES {s.price.toLocaleString()}</p>
                      <p class="font-body text-[11px] text-warm-taupe">{s.duration} min</p>
                    </div>
                    <div class={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                      selected ? "border-gold-leaf bg-gold-leaf" : "border-warm-taupe"
                    }`}>
                      {selected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                          <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {errors.services && <p class="mt-3 font-body text-sm text-red-500">{errors.services}</p>}

          {selectedServices.length > 0 && (
            <div class="mt-6 p-4 rounded-[var(--radius-lg)] bg-champagne/50 border border-champagne">
              <div class="flex justify-between items-center">
                <div>
                  <p class="font-body text-xs text-warm-taupe">{selectedServices.length} service(s)</p>
                  <p class="font-accent text-sm text-espresso font-semibold mt-0.5">KES {totalPrice.toLocaleString()}</p>
                </div>
                <p class="font-body text-xs text-warm-taupe">{totalDuration} min total</p>
              </div>
            </div>
          )}

          <div class="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => goTo("staff")}
              class="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gold-leaf text-espresso font-accent text-sm uppercase tracking-[0.1em] font-semibold transition-all duration-[var(--duration-normal)] hover:bg-espresso hover:text-ivory"
            >
              Continue — Choose Staff
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Staff Selection */}
      {step === "staff" && (
        <div class="animate-fadeIn">
          <h2 class="font-display text-2xl font-semibold text-espresso mb-1">Choose Your Specialist</h2>
          <p class="font-body text-sm text-warm-taupe mb-6">Select a preferred team member or choose "No preference".</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* No preference */}
            <button
              type="button"
              onClick={() => { setSelectedStaff(""); setErrors({}); }}
              class={`relative p-5 rounded-[var(--radius-lg)] border-2 text-left transition-all duration-[var(--duration-normal)] ${
                !selectedStaff
                  ? "border-gold-leaf bg-champagne/30"
                  : "border-transparent bg-ivory-silk hover:border-champagne"
              }`}
            >
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-champagne flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5 text-warm-taupe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <div>
                  <p class="font-display text-base font-semibold text-espresso">No Preference</p>
                  <p class="font-body text-xs text-warm-taupe mt-0.5">Assign the next available specialist</p>
                </div>
              </div>
            </button>

            {propStaff.map((member) => {
              const selected = selectedStaff === member.id;
              const gradient = STAFF_GRADIENTS[member.id] || "from-champagne via-soft-beige to-champagne/20";
              const initials = STAFF_INITIALS[member.id] || member.name.slice(0, 2).toUpperCase();
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => { setSelectedStaff(member.id); setErrors({}); }}
                  class={`relative p-5 rounded-[var(--radius-lg)] border-2 text-left transition-all duration-[var(--duration-normal)] ${
                    selected
                      ? "border-gold-leaf bg-champagne/30"
                      : "border-transparent bg-ivory-silk hover:border-champagne"
                  }`}
                >
                  {selected && (
                    <div class="absolute top-3 right-3 w-5 h-5 rounded-full bg-gold-leaf flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                        <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                  )}
                  <div class="flex items-center gap-4">
                    <div class={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
                      <span class="font-display text-sm font-semibold text-espresso">{initials}</span>
                    </div>
                    <div>
                      <p class="font-display text-base font-semibold text-espresso">{member.name}</p>
                      <p class="font-body text-xs text-warm-taupe mt-0.5">{member.title}</p>
                      <div class="flex flex-wrap gap-1 mt-1.5">
                        {member.specialties.map((spec) => (
                          <span key={spec} class="px-2 py-0.5 rounded-full bg-champagne/50 font-accent text-[9px] uppercase tracking-[0.08em] text-warm-taupe">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {errors.staff && <p class="mt-3 font-body text-sm text-red-500">{errors.staff}</p>}

          <div class="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => setStep("services")}
              class="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gold-leaf text-gold-leaf font-accent text-sm uppercase tracking-[0.1em] font-semibold transition-all duration-[var(--duration-normal)] hover:bg-gold-leaf hover:text-espresso"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
              Back
            </button>
            <button
              type="button"
              onClick={() => goTo("datetime")}
              class="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gold-leaf text-espresso font-accent text-sm uppercase tracking-[0.1em] font-semibold transition-all duration-[var(--duration-normal)] hover:bg-espresso hover:text-ivory"
            >
              Continue — Date & Time
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Date & Time */}
      {step === "datetime" && (
        <div class="animate-fadeIn">
          <h2 class="font-display text-2xl font-semibold text-espresso mb-1">Select Date & Time</h2>
          <p class="font-body text-sm text-warm-taupe mb-6">Choose when to visit us.</p>

          {selectedStaffMember && (
            <div class="mb-6 p-3 rounded-[var(--radius-lg)] bg-champagne/30 border border-champagne flex items-center gap-3">
              <div class={`w-8 h-8 rounded-full bg-gradient-to-br ${STAFF_GRADIENTS[selectedStaffMember.id] || "from-champagne via-soft-beige to-champagne/20"} flex items-center justify-center`}>
                <span class="font-display text-xs font-semibold text-espresso">{STAFF_INITIALS[selectedStaffMember.id]}</span>
              </div>
              <p class="font-body text-sm text-espresso">
                Booking with <strong>{selectedStaffMember.name}</strong>
              </p>
            </div>
          )}

          <CalendarGrid selectedDate={date} onSelect={setDate} errors={errors} />

          {date && (
            <div class="mt-6">
              <p class="font-display text-sm font-semibold text-espresso mb-3">
                Available Times
                <span class="font-body text-xs text-warm-taupe font-normal ml-2">
                  {new Date(date).toLocaleDateString("en-KE", { weekday: "long", month: "long", day: "numeric" })}
                </span>
              </p>

              {loadingSlots ? (
                <div class="flex items-center gap-2 py-4">
                  <div class="w-4 h-4 rounded-full border-2 border-gold-leaf border-t-transparent animate-spin" />
                  <span class="font-body text-sm text-warm-taupe">Loading available times…</span>
                </div>
              ) : timeSlots.length === 0 ? (
                <p class="font-body text-sm text-warm-taupe italic">No slots available for this date. Try another day.</p>
              ) : (
                <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={`${slot.time}-${slot.staffId || "any"}`}
                      type="button"
                      onClick={() => slot.available && setTime(slot.time)}
                      disabled={!slot.available}
                      class={`py-2.5 px-3 rounded-full font-accent text-sm transition-all duration-[var(--duration-fast)] ${
                        time === slot.time
                          ? "bg-gold-leaf text-espresso font-semibold"
                          : slot.available
                            ? "bg-champagne/50 text-espresso hover:bg-champagne"
                            : "bg-champagne/30 text-warm-taupe/40 cursor-not-allowed line-through"
                      }`}
                    >
                      {slot.time}
                      {slot.staffName && slot.available && (
                        <span class="block text-[9px] uppercase tracking-[0.05em] opacity-60">{slot.staffName.split(" ")[0]}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {errors.time && <p class="mt-2 font-body text-xs text-red-500">{errors.time}</p>}

          <div class="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => setStep("staff")}
              class="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gold-leaf text-gold-leaf font-accent text-sm uppercase tracking-[0.1em] font-semibold transition-all duration-[var(--duration-normal)] hover:bg-gold-leaf hover:text-espresso"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
              Back
            </button>
            <button
              type="button"
              onClick={() => goTo("details")}
              class="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gold-leaf text-espresso font-accent text-sm uppercase tracking-[0.1em] font-semibold transition-all duration-[var(--duration-normal)] hover:bg-espresso hover:text-ivory"
            >
              Continue — Details
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Your Details */}
      {step === "details" && (
        <div class="animate-fadeIn">
          <h2 class="font-display text-2xl font-semibold text-espresso mb-1">Your Details</h2>
          <p class="font-body text-sm text-warm-taupe mb-6">We'll send your confirmation here.</p>

          {/* Honeypot — hidden from users, traps bots */}
          <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", opacity: 0 }}>
            <label for="honeypot">Leave this empty</label>
            <input id="honeypot" ref={honeypotRef} type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <div class="space-y-5">
            <div>
              <label for="booking-name" class="block font-body text-sm font-medium text-espresso mb-1.5">Full Name</label>
              <input
                id="booking-name"
                type="text"
                value={name}
                onInput={(e) => setName((e.target as HTMLInputElement).value)}
                class={`w-full h-12 px-4 rounded-full bg-champagne/50 border-2 transition-colors font-body text-sm text-espresso placeholder:text-warm-taupe/50 focus:outline-none ${
                  errors.name ? "border-red-400" : "border-transparent focus:border-gold-leaf"
                }`}
                placeholder="e.g., Grace Muthoni"
              />
              {errors.name && <p class="mt-1 font-body text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label for="booking-email" class="block font-body text-sm font-medium text-espresso mb-1.5">Email Address</label>
              <input
                id="booking-email"
                type="email"
                value={email}
                onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
                class={`w-full h-12 px-4 rounded-full bg-champagne/50 border-2 transition-colors font-body text-sm text-espresso placeholder:text-warm-taupe/50 focus:outline-none ${
                  errors.email ? "border-red-400" : "border-transparent focus:border-gold-leaf"
                }`}
                placeholder="grace@example.com"
              />
              {errors.email && <p class="mt-1 font-body text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label for="booking-phone" class="block font-body text-sm font-medium text-espresso mb-1.5">Phone Number</label>
              <input
                id="booking-phone"
                type="tel"
                value={phone}
                onInput={(e) => setPhone((e.target as HTMLInputElement).value)}
                class={`w-full h-12 px-4 rounded-full bg-champagne/50 border-2 transition-colors font-body text-sm text-espresso placeholder:text-warm-taupe/50 focus:outline-none ${
                  errors.phone ? "border-red-400" : "border-transparent focus:border-gold-leaf"
                }`}
                placeholder="+254 700 000 000"
              />
              {errors.phone && <p class="mt-1 font-body text-xs text-red-500">{errors.phone}</p>}
            </div>

            <div>
              <label for="booking-notes" class="block font-body text-sm font-medium text-espresso mb-1.5">Special Requests <span class="text-warm-taupe font-normal">(optional)</span></label>
              <textarea
                id="booking-notes"
                value={notes}
                onInput={(e) => setNotes((e.target as HTMLTextAreaElement).value)}
                class="w-full h-24 px-4 py-3 rounded-[var(--radius-lg)] bg-champagne/50 border-2 border-transparent focus:border-gold-leaf focus:outline-none transition-colors font-body text-sm text-espresso placeholder:text-warm-taupe/50 resize-none"
                placeholder="Allergies, preferences, celebrations…"
                maxLength={500}
              />
              <p class="mt-1 font-body text-xs text-warm-taupe text-right">{notes.length}/500</p>
            </div>

            {/* Turnstile widget */}
            <div class="flex justify-center">
              <div class="cf-turnstile" data-sitekey={config.turnstileKey} data-theme="light" />
            </div>
          </div>

          <div class="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => setStep("datetime")}
              class="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gold-leaf text-gold-leaf font-accent text-sm uppercase tracking-[0.1em] font-semibold transition-all duration-[var(--duration-normal)] hover:bg-gold-leaf hover:text-espresso"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
              Back
            </button>
            <button
              type="button"
              onClick={() => goTo("review")}
              class="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gold-leaf text-espresso font-accent text-sm uppercase tracking-[0.1em] font-semibold transition-all duration-[var(--duration-normal)] hover:bg-espresso hover:text-ivory"
            >
              Review Booking
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Review */}
      {step === "review" && (
        <div class="animate-fadeIn">
          <h2 class="font-display text-2xl font-semibold text-espresso mb-1">Review Your Booking</h2>
          <p class="font-body text-sm text-warm-taupe mb-6">Please confirm everything looks correct.</p>

          <div class="space-y-4">
            {/* Services summary */}
            <div class="p-5 rounded-[var(--radius-lg)] bg-champagne/30 border border-champagne">
              <p class="font-accent text-xs uppercase tracking-[0.12em] text-gold-leaf-dark font-semibold mb-3">Services</p>
              {selectedServiceObjects.map((s) => (
                <div class="flex justify-between py-1" key={s.id}>
                  <span class="font-body text-sm text-espresso">{s.title}</span>
                  <span class="font-body text-sm text-espresso font-medium">KES {s.price.toLocaleString()}</span>
                </div>
              ))}
              <div class="flex justify-between pt-3 mt-3 border-t border-champagne">
                <span class="font-body text-sm font-semibold text-espresso">Total</span>
                <span class="font-body text-sm font-semibold text-gold-leaf">KES {totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Staff summary */}
            <div class="p-5 rounded-[var(--radius-lg)] bg-champagne/30 border border-champagne">
              <p class="font-accent text-xs uppercase tracking-[0.12em] text-gold-leaf-dark font-semibold mb-2">Specialist</p>
              {selectedStaffMember ? (
                <div class="flex items-center gap-3">
                  <div class={`w-8 h-8 rounded-full bg-gradient-to-br ${STAFF_GRADIENTS[selectedStaffMember.id] || "from-champagne via-soft-beige to-champagne/20"} flex items-center justify-center`}>
                    <span class="font-display text-xs font-semibold text-espresso">{STAFF_INITIALS[selectedStaffMember.id]}</span>
                  </div>
                  <div>
                    <p class="font-body text-sm text-espresso">{selectedStaffMember.name}</p>
                    <p class="font-body text-xs text-warm-taupe">{selectedStaffMember.title}</p>
                  </div>
                </div>
              ) : (
                <p class="font-body text-sm text-warm-taupe italic">No preference — we'll assign the best available specialist</p>
              )}
            </div>

            {/* Date/Time summary */}
            <div class="p-5 rounded-[var(--radius-lg)] bg-champagne/30 border border-champagne">
              <p class="font-accent text-xs uppercase tracking-[0.12em] text-gold-leaf-dark font-semibold mb-2">Date & Time</p>
              <p class="font-body text-sm text-espresso">
                {date && new Date(date).toLocaleDateString("en-KE", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                {time && <> at <strong>{time}</strong></>}
              </p>
              {totalDuration > 0 && <p class="font-body text-xs text-warm-taupe mt-1">Duration: ~{totalDuration} minutes</p>}
            </div>

            {/* Contact summary */}
            <div class="p-5 rounded-[var(--radius-lg)] bg-champagne/30 border border-champagne">
              <p class="font-accent text-xs uppercase tracking-[0.12em] text-gold-leaf-dark font-semibold mb-2">Your Details</p>
              <p class="font-body text-sm text-espresso">{name}</p>
              <p class="font-body text-sm text-espresso">{email}</p>
              <p class="font-body text-sm text-espresso">{phone}</p>
              {notes && <p class="font-body text-sm text-warm-taupe mt-2 italic">"{notes}"</p>}
            </div>

            <p class="font-body text-xs text-warm-taupe text-center leading-relaxed">
              By confirming, you agree to our cancellation policy. Appointments may be rescheduled up to 4 hours before the start time.
            </p>
          </div>

          {submitError && (
            <div class="mt-4 p-3 rounded-[var(--radius-lg)] bg-red-50 border border-red-200">
              <p class="font-body text-sm text-red-600">{submitError}</p>
            </div>
          )}

          <div class="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => setStep("details")}
              class="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gold-leaf text-gold-leaf font-accent text-sm uppercase tracking-[0.1em] font-semibold transition-all duration-[var(--duration-normal)] hover:bg-gold-leaf hover:text-espresso"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
              Edit Details
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              class="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gold-leaf text-espresso font-accent text-sm uppercase tracking-[0.1em] font-semibold transition-all duration-[var(--duration-normal)] hover:bg-espresso hover:text-ivory disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div class="w-4 h-4 rounded-full border-2 border-espresso border-t-transparent animate-spin" />
                  Confirming…
                </>
              ) : (
                <>
                  Confirm Booking
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Confirmed */}
      {step === "confirmed" && (
        <div class="animate-fadeIn text-center py-8">
          <div class="w-16 h-16 rounded-full bg-gradient-to-br from-gold-leaf-light to-champagne mx-auto flex items-center justify-center mb-6 shadow-lg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2C1810" stroke-width="2.5">
              <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <h2 class="font-display text-2xl font-semibold text-espresso mb-2">Your Booking Is Confirmed</h2>
          <p class="font-body text-sm text-warm-taupe mb-6">
            We've sent a confirmation to <strong class="text-espresso">{email}</strong>
            {phone && <> and a WhatsApp message to <strong class="text-espresso">{phone}</strong></>}.
          </p>

          <div class="max-w-sm mx-auto p-5 rounded-[var(--radius-lg)] bg-champagne/30 border border-champagne text-left mb-6">
            <p class="font-accent text-[11px] uppercase tracking-[0.12em] text-warm-taupe mb-1">Reference</p>
            <p class="font-display text-lg font-semibold text-gold-leaf mb-4">AMN-{Date.now().toString(36).toUpperCase().slice(-6)}</p>

            {selectedServiceObjects.map((s) => (
              <div class="flex justify-between text-sm py-0.5" key={s.id}>
                <span class="font-body text-espresso">{s.title}</span>
                <span class="font-body text-espresso">KES {s.price.toLocaleString()}</span>
              </div>
            ))}
            <div class="flex justify-between pt-2 mt-2 border-t border-champagne">
              <span class="font-body text-sm font-semibold text-espresso">Total</span>
              <span class="font-body text-sm font-semibold text-gold-leaf">KES {totalPrice.toLocaleString()}</span>
            </div>

            <div class="mt-3 pt-3 border-t border-champagne space-y-1">
              <p class="font-body text-sm text-espresso">
                {date && new Date(date).toLocaleDateString("en-KE", { weekday: "short", month: "short", day: "numeric" })}
                {time && <> at {time}</>}
              </p>
              {selectedStaffMember && (
                <p class="font-body text-xs text-warm-taupe">with {selectedStaffMember.name}</p>
              )}
            </div>
          </div>

          <p class="font-body text-xs text-warm-taupe mb-6">A reminder will be sent 24 hours before your appointment.</p>

          <button
            type="button"
            onClick={reset}
            class="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gold-leaf text-espresso font-accent text-sm uppercase tracking-[0.1em] font-semibold transition-all duration-[var(--duration-normal)] hover:bg-espresso hover:text-ivory"
          >
            Book Another Appointment
          </button>

          <div class="mt-6 flex justify-center gap-6">
            <a href="/services" class="font-body text-xs text-warm-taupe hover:text-gold-leaf transition-colors">Explore More Services</a>
            <a href="/contact" class="font-body text-xs text-warm-taupe hover:text-gold-leaf transition-colors">Contact Us</a>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s var(--ease-out-expo); }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: var(--color-champagne); border-radius: 4px; }
      `}</style>
    </div>
  );
}
