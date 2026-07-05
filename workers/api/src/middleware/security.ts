import type { MiddlewareHandler } from "hono";

export const securityHeaders: MiddlewareHandler = async (c, next) => {
  await next();

  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("X-XSS-Protection", "0");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  c.header(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  c.header(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; img-src 'self' data:; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.resend.com"
  );
};
