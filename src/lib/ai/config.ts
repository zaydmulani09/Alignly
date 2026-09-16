/**
 * Server-only AI configuration. Nothing here may be imported from a client
 * component: the key must never reach the bundle.
 */
import "server-only";

export const DEFAULT_MODEL = "gemini-3.8-flash";

/** Free-tier models known to support structured JSON output, best first. */
export const SUPPORTED_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
] as const;

export function getApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  return key ? key : null;
}

export function getModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
}

/** Whether the AI features can run at all. Surfaced to the UI via /api/status. */
export function isAiConfigured(): boolean {
  return getApiKey() !== null;
}

export function getRateLimitPerMinute(): number {
  const raw = Number(process.env.AI_RATE_LIMIT_PER_MINUTE);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 10;
}
