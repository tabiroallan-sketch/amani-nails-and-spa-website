import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { log } from "./logger";

export const errorHandler: ErrorHandler = (err, c) => {
  const requestId = c.get("requestId") ?? "unknown";

  if (err instanceof HTTPException) {
    log("warn", { requestId, status: err.status, message: err.message }, "HTTP exception");
    return c.json({
      error: err.message,
      status: err.status,
      requestId,
    }, err.status);
  }

  if (err instanceof SyntaxError) {
    log("warn", { requestId, message: "Invalid JSON body" }, "Syntax error");
    return c.json({
      error: "Invalid request body",
      status: 400,
      requestId,
    }, 400);
  }

  log("error", { requestId, error: err.message, stack: err.stack }, "Unhandled error");

  return c.json({
    error: "Internal server error",
    status: 500,
    requestId,
  }, 500);
};
