import type { MiddlewareHandler } from "hono";

type LogLevel = "info" | "warn" | "error" | "debug";

function timestamp(): string {
  return new Date().toISOString();
}

function stringify(obj: Record<string, unknown>): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return "[unstringifiable]";
  }
}

export const logger: MiddlewareHandler = async (c, next) => {
  const start = Date.now();
  const requestId = crypto.randomUUID().slice(0, 8);
  c.set("requestId", requestId);

  const method = c.req.method;
  const path = c.req.path;
  const ip = c.req.header("cf-connecting-ip") ?? "unknown";
  const userAgent = c.req.header("user-agent") ?? "unknown";

  log("info", { requestId, method, path, ip, userAgent }, "incoming request");

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  if (status >= 500) {
    log("error", { requestId, method, path, status, duration }, "request completed");
  } else if (status >= 400) {
    log("warn", { requestId, method, path, status, duration }, "request completed");
  } else {
    log("info", { requestId, method, path, status, duration }, "request completed");
  }
};

export function log(level: LogLevel, meta: Record<string, unknown>, message: string): void {
  const entry = { level, timestamp: timestamp(), message, ...meta };

  switch (level) {
    case "error":
      console.error(stringify(entry));
      break;
    case "warn":
      console.warn(stringify(entry));
      break;
    case "debug":
      console.debug(stringify(entry));
      break;
    default:
      console.log(stringify(entry));
  }
}

export const loggerMiddleware = logger;
