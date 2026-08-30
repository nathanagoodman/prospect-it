/**
 * Structured error reporting.
 *
 * This is deliberately dependency-free so it works today. Logs are emitted
 * as single-line JSON, which Vercel's log search can filter on (e.g.
 * `level:error route:/api/stripe/webhook`).
 *
 * To upgrade to Sentry later:
 *   1. npm install @sentry/nextjs
 *   2. npx @sentry/wizard@latest -i nextjs
 *   3. Add the Sentry capture call inside `reportError` below.
 * Nothing else in the app needs to change — every call site already routes
 * through this function.
 */

export interface ErrorContext {
  route?: string;
  userId?: string;
  operation?: string;
  [key: string]: unknown;
}

function serialize(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack?.split("\n").slice(0, 8).join("\n"),
    };
  }
  return { name: "UnknownError", message: String(error) };
}

/** Logs an error with structured context. Never throws. */
export function reportError(error: unknown, context: ErrorContext = {}): void {
  try {
    const payload = {
      level: "error",
      timestamp: new Date().toISOString(),
      ...context,
      error: serialize(error),
    };
    console.error(JSON.stringify(payload));

    // Sentry hook point:
    // Sentry.captureException(error, { extra: context });
  } catch {
    console.error("[errors] failed to report:", error);
  }
}

/** Logs a non-fatal warning with the same structure. */
export function reportWarning(message: string, context: ErrorContext = {}): void {
  try {
    console.warn(
      JSON.stringify({
        level: "warning",
        timestamp: new Date().toISOString(),
        message,
        ...context,
      })
    );
  } catch {
    console.warn("[errors]", message);
  }
}
