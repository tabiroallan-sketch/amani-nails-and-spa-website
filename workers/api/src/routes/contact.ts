import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "../middleware/zValidator";
import { rateLimit } from "../middleware/rateLimit";
import { contactAutoReplyHtml, contactNotificationHtml } from "../emails/contactAutoReply";
import type { Bindings, Variables } from "../types";

const contact = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(255),
  phone: z
    .string()
    .regex(/^\+?254\d{9}$/, "Valid Kenyan phone (e.g., +254700000000)")
    .optional()
    .or(z.literal("")),
  subject: z.string().min(2, "Subject is required").max(200),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must not exceed 2,000 characters"),
  turnstile: z.string().min(1, "Security check is required").optional(),
});

async function verifyTurnstile(
  token: string,
  secret: string
): Promise<boolean> {
  try {
    const resp = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: `secret=${secret}&response=${token}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    if (!resp.ok) return false;
    const result = await resp.json<{ success: boolean }>();
    return result.success;
  } catch {
    return false;
  }
}

async function sendEmail(
  apiKey: string,
  payload: {
    from: string;
    to: string;
    subject: string;
    html: string;
    replyTo?: string;
  }
): Promise<void> {
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

contact.post("/", rateLimit(5, 300), zValidator(contactSchema), async (c) => {
  const { name, email, phone, subject, message, turnstile } =
    c.get("validated") as z.infer<typeof contactSchema>;

  // Verify Turnstile
  if (turnstile && c.env.TURNSTILE_SECRET) {
    const valid = await verifyTurnstile(turnstile, c.env.TURNSTILE_SECRET);
    if (!valid) {
      return c.json({ error: "Security check failed. Please try again." }, 400);
    }
  }

  // Store in D1
  const id = crypto.randomUUID();
  try {
    await c.env.DB.prepare(
      `INSERT INTO contacts (id, name, email, phone, subject, message, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
    )
      .bind(id, name, email, phone ?? null, subject, message)
      .run();
  } catch (err) {
    console.error("D1 insert failed:", err);
  }

  // Fire-and-forget notifications
  if (c.env.RESEND_API_KEY) {
    const promises: Promise<void>[] = [];

    // Internal notification
    promises.push(
      sendEmail(c.env.RESEND_API_KEY, {
        from: "Amani Nails & Spa <contact@amanispanairobi.com>",
        to: "hello@amanispanairobi.com",
        subject: `Contact Form: ${subject}`,
        html: contactNotificationHtml({ name, email, phone, subject, message }),
        replyTo: email,
      }).catch((err) => console.error("Notification email failed:", err))
    );

    // Auto-reply to sender
    promises.push(
      sendEmail(c.env.RESEND_API_KEY, {
        from: "Amani Nails & Spa <contact@amanispanairobi.com>",
        to: email,
        subject: "Thank you for contacting Amani Nails & Spa",
        html: contactAutoReplyHtml({ name, subject }),
      }).catch((err) => console.error("Auto-reply email failed:", err))
    );

    await Promise.allSettled(promises);
  }

  return c.json(
    {
      success: true,
      message:
        "Thank you for reaching out! We've received your message and will respond within 24 hours.",
    },
    201
  );
});

export default contact;
