import type { MiddlewareHandler } from "hono";

export const rateLimit = (limit = 10, window = 60): MiddlewareHandler => {
  return async (c, next) => {
    const ip = c.req.header("cf-connecting-ip") ?? "unknown";
    const key = `ratelimit:${ip}:${c.req.path}`;

    const count = await c.env.KV?.get(key);

    if (count && parseInt(count) >= limit) {
      return c.json({ error: "Too many requests. Please try again later." }, 429);
    }

    const newCount = count ? parseInt(count) + 1 : 1;
    await c.env.KV?.put(key, String(newCount), { expirationTtl: window });

    c.header("X-RateLimit-Remaining", String(limit - newCount));
    await next();
  };
};
