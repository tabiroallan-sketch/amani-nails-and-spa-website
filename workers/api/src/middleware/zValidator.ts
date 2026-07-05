import type { MiddlewareHandler } from "hono";
import type { ZodSchema } from "zod";

export const zValidator = (schema: ZodSchema): MiddlewareHandler => {
  return async (c, next) => {
    const contentType = c.req.header("content-type") ?? "";

    let body: unknown;

    if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      body = await c.req.parseBody();
    } else {
      body = await c.req.json();
    }

    const result = schema.safeParse(body);

    if (!result.success) {
      return c.json({
        error: "Validation failed",
        details: result.error.flatten(),
      }, 400);
    }

    c.set("validated", result.data);
    await next();
  };
};
