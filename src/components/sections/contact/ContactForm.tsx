import { useState, useEffect, useRef } from "preact/hooks";
import { z } from "zod";
import { config } from "../../../lib/config";

interface ContactFormProps {
  turnstileKey: string;
}

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message must be under 2000 characters"),
});

type FormData = z.infer<typeof contactSchema>;

const initialFormData: FormData = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

function CheckIcon() {
  return (
    <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22l-4-9-9-4 20-7z" />
    </svg>
  );
}

export default function ContactForm({ turnstileKey }: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissionState, setSubmissionState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileLoadedRef = useRef(false);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const resetTimerRef = useRef<number | undefined>(undefined);

  const setField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  // Inject Turnstile script
  useEffect(() => {
    if (turnstileLoadedRef.current || typeof window === "undefined") return;

    if ((window as any).turnstile) {
      turnstileLoadedRef.current = true;
      return;
    }
    if (document.getElementById("cf-turnstile-script")) {
      turnstileLoadedRef.current = true;
      return;
    }

    const script = document.createElement("script");
    script.id = "cf-turnstile-script";
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    turnstileLoadedRef.current = true;
  }, []);

  // Render Turnstile widget after script loads
  useEffect(() => {
    if (typeof window === "undefined" || !turnstileContainerRef.current) return;

    const checkTurnstile = () => {
      if ((window as any).turnstile) {
        (window as any).turnstile.render("#contact-turnstile-container", {
          sitekey: turnstileKey,
          theme: "light",
          callback: (token: string) => {
            setTurnstileToken(token);
          },
          "expired-callback": () => {
            setTurnstileToken(null);
          },
        });
      } else {
        setTimeout(checkTurnstile, 200);
      }
    };

    const timer = setTimeout(checkTurnstile, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [turnstileKey]);

  // Cleanup reset timer on unmount
  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== undefined) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    // Honeypot — if filled, silently succeed
    if (honeypotRef.current?.value) {
      setSubmissionState("success");
      return;
    }

    if (!validate()) return;

    if (!turnstileToken) {
      setErrors((prev) => ({ ...prev, turnstile: "Please complete the security check" }));
      return;
    }

    setSubmissionState("submitting");
    setServerError(null);

    try {
      const payload = {
        ...formData,
        turnstile: turnstileToken,
      };

      const res = await fetch(`${config.apiUrl}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 429) {
        throw new Error("Too many requests. Please wait a moment before trying again.");
      }

      if (res.status === 400) {
        const data = await res.json();
        if (data.details?.fieldErrors) {
          const serverFieldErrors: Record<string, string> = {};
          for (const [key, msgs] of Object.entries(data.details.fieldErrors)) {
            serverFieldErrors[key] = (msgs as string[])[0];
          }
          setErrors(serverFieldErrors);
          setSubmissionState("idle");
          return;
        }
        throw new Error(data.error || "Validation failed. Please check your input.");
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setSubmissionState("success");

      resetTimerRef.current = window.setTimeout(() => {
        setFormData(initialFormData);
        setErrors({});
        setSubmissionState("idle");
        setServerError(null);
        setTurnstileToken(null);
      }, 5000);
    } catch (err: any) {
      setServerError(err.message || "Network error. Please check your connection.");
      setSubmissionState("error");
    }
  };

  if (submissionState === "success") {
    return (
      <div class="rounded-[var(--radius-xl)] bg-ivory-silk p-8 md:p-10 text-center border border-champagne">
        <div class="w-16 h-16 rounded-full bg-gradient-to-br from-gold-leaf-light to-champagne mx-auto flex items-center justify-center mb-6 shadow-lg">
          <span class="text-espresso">
            <CheckIcon />
          </span>
        </div>
        <h3 class="font-display text-2xl font-semibold text-gold-leaf mb-2">Message Sent</h3>
        <p class="font-body text-sm text-warm-taupe max-w-md mx-auto">
          Thank you for reaching out. We've received your message and will get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      class="rounded-[var(--radius-xl)] bg-ivory-silk p-8 md:p-10 border border-champagne space-y-6"
      noValidate
    >
      <div>
        <h2 class="font-display text-2xl font-semibold text-espresso mb-1">Get in Touch</h2>
        <p class="font-body text-sm text-warm-taupe">We'd love to hear from you.</p>
      </div>

      {/* Honeypot — hidden from users, traps bots */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", opacity: 0 }}>
        <label for="website">Website</label>
        <input id="website" name="website" ref={honeypotRef} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {/* Name */}
      <div>
        <label for="contact-name" class="block font-body text-sm font-medium text-espresso mb-1.5">Full Name</label>
        <input
          id="contact-name"
          type="text"
          value={formData.name}
          onInput={(e) => setField("name", (e.target as HTMLInputElement).value)}
          class={`w-full h-12 px-4 rounded-full bg-ivory-silk border-2 transition-all duration-[var(--duration-fast)] font-body text-sm text-espresso placeholder:text-warm-taupe/50 focus:outline-none ${
            errors.name ? "border-red-400" : "border-champagne focus:border-gold-leaf"
          }`}
          placeholder="e.g., Grace Muthoni"
        />
        {errors.name && <p class="mt-1 font-body text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label for="contact-email" class="block font-body text-sm font-medium text-espresso mb-1.5">Email Address</label>
        <input
          id="contact-email"
          type="email"
          value={formData.email}
          onInput={(e) => setField("email", (e.target as HTMLInputElement).value)}
          class={`w-full h-12 px-4 rounded-full bg-ivory-silk border-2 transition-all duration-[var(--duration-fast)] font-body text-sm text-espresso placeholder:text-warm-taupe/50 focus:outline-none ${
            errors.email ? "border-red-400" : "border-champagne focus:border-gold-leaf"
          }`}
          placeholder="grace@example.com"
        />
        {errors.email && <p class="mt-1 font-body text-xs text-red-500">{errors.email}</p>}
      </div>

      {/* Phone */}
      <div>
        <label for="contact-phone" class="block font-body text-sm font-medium text-espresso mb-1.5">Phone Number <span class="text-warm-taupe font-normal">(optional)</span></label>
        <input
          id="contact-phone"
          type="tel"
          value={formData.phone}
          onInput={(e) => setField("phone", (e.target as HTMLInputElement).value)}
          class={`w-full h-12 px-4 rounded-full bg-ivory-silk border-2 transition-all duration-[var(--duration-fast)] font-body text-sm text-espresso placeholder:text-warm-taupe/50 focus:outline-none ${
            errors.phone ? "border-red-400" : "border-champagne focus:border-gold-leaf"
          }`}
          placeholder="+254 700 000 000"
        />
        {errors.phone && <p class="mt-1 font-body text-xs text-red-500">{errors.phone}</p>}
      </div>

      {/* Subject */}
      <div>
        <label for="contact-subject" class="block font-body text-sm font-medium text-espresso mb-1.5">Subject</label>
        <input
          id="contact-subject"
          type="text"
          value={formData.subject}
          onInput={(e) => setField("subject", (e.target as HTMLInputElement).value)}
          class={`w-full h-12 px-4 rounded-full bg-ivory-silk border-2 transition-all duration-[var(--duration-fast)] font-body text-sm text-espresso placeholder:text-warm-taupe/50 focus:outline-none ${
            errors.subject ? "border-red-400" : "border-champagne focus:border-gold-leaf"
          }`}
          placeholder="How can we help you?"
        />
        {errors.subject && <p class="mt-1 font-body text-xs text-red-500">{errors.subject}</p>}
      </div>

      {/* Message */}
      <div>
        <label for="contact-message" class="block font-body text-sm font-medium text-espresso mb-1.5">Message</label>
        <textarea
          id="contact-message"
          value={formData.message}
          onInput={(e) => setField("message", (e.target as HTMLTextAreaElement).value)}
          class={`w-full h-32 px-4 py-3 rounded-[var(--radius-lg)] bg-ivory-silk border-2 transition-all duration-[var(--duration-fast)] font-body text-sm text-espresso placeholder:text-warm-taupe/50 focus:outline-none resize-none ${
            errors.message ? "border-red-400" : "border-champagne focus:border-gold-leaf"
          }`}
          placeholder="Tell us about your inquiry..."
          maxLength={2000}
        />
        <div class="flex justify-between items-center mt-1">
          {errors.message ? (
            <p class="font-body text-xs text-red-500">{errors.message}</p>
          ) : (
            <span />
          )}
          <p class="font-body text-xs text-warm-taupe">{formData.message.length}/2000</p>
        </div>
      </div>

      {/* Turnstile */}
      <div>
        <div
          id="contact-turnstile-container"
          ref={turnstileContainerRef}
          class="flex justify-center"
        />
        {errors.turnstile && <p class="mt-1 font-body text-xs text-red-500 text-center">{errors.turnstile}</p>}
      </div>

      {/* Server error */}
      {serverError && (
        <div class="p-3 rounded-[var(--radius-lg)] bg-red-50 border border-red-200">
          <p class="font-body text-sm text-red-600">{serverError}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={submissionState === "submitting"}
        class="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gold-leaf text-espresso font-accent text-sm uppercase tracking-[0.1em] font-semibold transition-all duration-[var(--duration-normal)] hover:bg-espresso hover:text-ivory disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submissionState === "submitting" ? (
          <>
            <SpinnerIcon />
            Sending…
          </>
        ) : (
          <>
            <SendIcon />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}
