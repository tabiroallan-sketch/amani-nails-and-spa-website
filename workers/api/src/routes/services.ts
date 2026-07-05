import { Hono } from "hono";
import type { Bindings, Variables } from "../types";

const services = new Hono<{ Bindings: Bindings; Variables: Variables }>();

services.get("/", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM services WHERE available = 1 ORDER BY order_index ASC"
  ).all();

  c.header("Cache-Control", "public, max-age=300, stale-while-revalidate=60");

  return c.json({ data: results });
});

services.get("/:slug", async (c) => {
  const { slug } = c.req.param();

  const row = await c.env.DB.prepare(
    "SELECT * FROM services WHERE slug = ? AND available = 1"
  )
    .bind(slug)
    .first();

  if (!row) {
    return c.json({ error: "Service not found" }, 404);
  }

  c.header("Cache-Control", "public, max-age=300, stale-while-revalidate=60");

  return c.json({ data: row });
});

export default services;
