import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "../middleware/zValidator";
import { rateLimit } from "../middleware/rateLimit";
import { bookingConfirmationHtml, bookingNotificationHtml } from "../emails/bookingConfirmation";
import type { Bindings, Variables } from "../types";

const bookings = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const createBookingSchema = z.object({
  services: z.array(z.string()).min(1, "Select at least one service"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  staffId: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(255),
  phone: z
    .string()
    .regex(/^\+?254\d{9}$/, "Valid Kenyan phone (e.g., +254700000000)"),
  notes: z.string().max(500).optional(),
  turnstile: z.string().optional(),
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

async function sendWhatsAppNotification(
  apiKey: string,
  to: string,
  data: { name: string; date: string; time: string; token: string }
): Promise<void> {
  const message = `Hi ${data.name}! Your appointment at Amani Nails & Spa is confirmed for ${data.date} at ${data.time}. Reference: ${data.token}. See you soon!`;
  await fetch("https://api.africastalking.com/version1/messaging", {
    method: "POST",
    headers: {
      apiKey,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      username: "amani-spa",
      to,
      message,
      from: "AMANI-SPA",
    }),
  });
}

// Create booking
bookings.post("/", rateLimit(10, 60), zValidator(createBookingSchema), async (c) => {
  const data = c.get("validated") as z.infer<typeof createBookingSchema>;

  // Verify Turnstile
  if (data.turnstile && c.env.TURNSTILE_SECRET) {
    const valid = await verifyTurnstile(data.turnstile, c.env.TURNSTILE_SECRET);
    if (!valid) {
      return c.json({ error: "Security check failed. Please refresh and try again." }, 400);
    }
  }

  const customerId = crypto.randomUUID();
  const bookingId = crypto.randomUUID();
  const confirmationToken = crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();

  // Check for double booking
  if (data.staffId) {
    const existing = await c.env.DB.prepare(
      `SELECT id FROM bookings
       WHERE date = ? AND time = ? AND staff_id = ? AND status != 'cancelled'`
    )
      .bind(data.date, data.time, data.staffId)
      .first();
    if (existing) {
      return c.json(
        { error: "This time slot is no longer available. Please choose another." },
        409
      );
    }
  }

  // Create or update customer
  await c.env.DB.prepare(
    `INSERT INTO customers (id, name, email, phone, notes, created_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(email) DO UPDATE SET name = excluded.name, phone = excluded.phone`
  )
    .bind(customerId, data.name, data.email, data.phone, data.notes ?? null)
    .run();

  // Create booking
  await c.env.DB.prepare(
    `INSERT INTO bookings (id, customer_id, service_ids, date, time, staff_id, status, confirmation_token, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'confirmed', ?, datetime('now'))`
  )
    .bind(
      bookingId,
      customerId,
      JSON.stringify(data.services),
      data.date,
      data.time,
      data.staffId ?? null,
      confirmationToken
    )
    .run();

  // Fire-and-forget notifications
  if (c.env.RESEND_API_KEY) {
    const promises: Promise<void>[] = [];

    // Customer confirmation
    promises.push(
      sendEmail(c.env.RESEND_API_KEY, {
        from: "Amani Nails & Spa <bookings@amanispanairobi.com>",
        to: data.email,
        subject: "Your Booking is Confirmed — Amani Nails & Spa",
        html: bookingConfirmationHtml({
          name: data.name,
          date: data.date,
          time: data.time,
          services: data.services,
          token: confirmationToken,
        }),
      }).catch(console.error)
    );

    // Internal notification
    promises.push(
      sendEmail(c.env.RESEND_API_KEY, {
        from: "Amani Nails & Spa <bookings@amanispanairobi.com>",
        to: "hello@amanispanairobi.com",
        subject: `New Booking: ${data.name} — ${data.date} ${data.time}`,
        html: bookingNotificationHtml({
          name: data.name,
          email: data.email,
          phone: data.phone,
          date: data.date,
          time: data.time,
          services: data.services,
          token: confirmationToken,
        }),
      }).catch(console.error)
    );

    await Promise.allSettled(promises);
  }

  if (c.env.AFRICASTALKING_API_KEY && data.phone) {
    sendWhatsAppNotification(c.env.AFRICASTALKING_API_KEY, data.phone, {
      name: data.name,
      date: data.date,
      time: data.time,
      token: confirmationToken,
    }).catch(console.error);
  }

  return c.json(
    {
      data: {
        id: bookingId,
        confirmationToken,
        date: data.date,
        time: data.time,
      },
    },
    201
  );
});

// Get booking by token
bookings.get("/:token", async (c) => {
  const { token } = c.req.param();

  const booking = await c.env.DB.prepare(
    `SELECT b.*, c.name, c.email, c.phone
     FROM bookings b JOIN customers c ON b.customer_id = c.id
     WHERE b.confirmation_token = ?`
  )
    .bind(token)
    .first();

  if (!booking) {
    return c.json({ error: "Booking not found" }, 404);
  }

  return c.json({ data: booking });
});

// Cancel booking
bookings.delete("/:token", rateLimit(10, 60), async (c) => {
  const { token } = c.req.param();

  const result = await c.env.DB.prepare(
    `UPDATE bookings SET status = 'cancelled'
     WHERE confirmation_token = ? AND status = 'confirmed'`
  )
    .bind(token)
    .run();

  if (result.meta.changes === 0) {
    return c.json({ error: "Booking not found or already cancelled" }, 404);
  }

  return c.json({ success: true, message: "Booking cancelled successfully" });
});

export default bookings;
