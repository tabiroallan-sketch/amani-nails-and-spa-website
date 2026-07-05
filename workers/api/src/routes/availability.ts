import { Hono } from "hono";
import { z } from "zod";
import { rateLimit } from "../middleware/rateLimit";
import type { Bindings, Variables } from "../types";

const availability = new Hono<{ Bindings: Bindings; Variables: Variables }>();

availability.get("/", rateLimit(30, 60), async (c) => {
  const date = c.req.query("date");

  if (!date) {
    return c.json({ error: "date query parameter is required (YYYY-MM-DD)" }, 400);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return c.json({ error: "Invalid date format. Use YYYY-MM-DD." }, 400);
  }

  // Validate the date is not in the past (Nairobi timezone, UTC+3)
  const nairobiNow = new Date(new Date().getTime() + 3 * 60 * 60 * 1000);
  const today = nairobiNow.toISOString().slice(0, 10);
  if (date < today) {
    return c.json({ error: "Date must be today or in the future" }, 400);
  }

  const staff = await c.env.DB.prepare(
    "SELECT id, name FROM staff WHERE available = 1"
  ).all<{ id: string; name: string }>();

  const slots: {
    time: string;
    available: boolean;
    staffId?: string;
    staffName?: string;
  }[] = [];

  // Nairobi business hours 08:00-19:00 EAT (UTC+3)
  const base = new Date(`${date}T05:00:00Z`);
  const end = new Date(`${date}T16:00:00Z`);

  // Batch query all bookings for this date
  const { results: allBookings } = await c.env.DB.prepare(
    "SELECT staff_id, time FROM bookings WHERE date = ? AND status != 'cancelled'"
  )
    .bind(date)
    .all<{ staff_id: string; time: string }>();

  const bookedMap = new Map<string, Set<string>>();
  for (const b of allBookings) {
    const set = bookedMap.get(b.time) ?? new Set();
    set.add(b.staff_id);
    bookedMap.set(b.time, set);
  }

  while (base < end) {
    const h = base.getHours().toString().padStart(2, "0");
    const m = base.getMinutes().toString().padStart(2, "0");
    const timeStr = `${h}:${m}`;

    const bookedAtTime = bookedMap.get(timeStr) ?? new Set();

    for (const s of staff.results) {
      slots.push({
        time: timeStr,
        available: !bookedAtTime.has(s.id),
        staffId: s.id,
        staffName: s.name,
      });
    }

    base.setMinutes(base.getMinutes() + 30);
  }

  c.header("Cache-Control", "private, max-age=30");

  return c.json({ data: slots });
});

export default availability;
