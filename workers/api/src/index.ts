import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { logger as loggerMiddleware } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import { securityHeaders } from "./middleware/security";
import { rateLimit } from "./middleware/rateLimit";
import bookings from "./routes/bookings";
import services from "./routes/services";
import availability from "./routes/availability";
import contact from "./routes/contact";
import type { Bindings, Variables } from "./types";

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ── Global Middleware ──────────────────────────────────────────────────────
app.use("*", loggerMiddleware);
app.use("*", cors({
  origin: ["https://amanispanairobi.com", "https://www.amanispanairobi.com"],
  allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400,
}));
app.use("*", securityHeaders);
app.onError(errorHandler);

// ── Health ─────────────────────────────────────────────────────────────────
app.get("/health", (c) => c.json({
  status: "ok",
  timestamp: Date.now(),
  version: "1.0.0",
}));

// ── Routes ─────────────────────────────────────────────────────────────────
app.route("/api/bookings", bookings);
app.route("/api/services", services);
app.route("/api/availability", availability);
app.route("/api/contact", contact);

// ── Turnstile Verification ─────────────────────────────────────────────────
app.post("/api/verify-turnstile", rateLimit(20, 60), async (c) => {
  const { token } = await c.req.json<{ token: string }>();

  if (!token) {
    return c.json({ error: "Token is required" }, 400);
  }

  const resp = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: `secret=${c.env.TURNSTILE_SECRET}&response=${token}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  if (!resp.ok) {
    return c.json({ error: "Verification service unavailable" }, 502);
  }

  const result = await resp.json<{ success: boolean }>();
  return c.json(result);
});

// ── Rate-limited route group ───────────────────────────────────────────────
app.get("/api/limited", rateLimit(30, 60), (c) => {
  return c.json({ ok: true });
});

export default app;
