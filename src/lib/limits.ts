/**
 * Shared limits. These are enforced twice on purpose: once in the browser so
 * people get an instant, specific message, and once on the server because the
 * browser check is a convenience, not a control.
 */

export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

export const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const ACCEPTED_EXTENSIONS = [".pdf", ".docx"] as const;

/** Below this, the upload almost certainly failed to extract anything useful. */
export const MIN_RESUME_CHARS = 200;
export const MAX_RESUME_CHARS = 30_000;

export const MIN_JOB_DESCRIPTION_CHARS = 120;
export const MAX_JOB_DESCRIPTION_CHARS = 20_000;

export const MAX_CHAT_MESSAGE_CHARS = 2_000;
export const MAX_CHAT_HISTORY_MESSAGES = 20;

/** Requests per IP per minute against the AI routes. */
export const DEFAULT_AI_RATE_LIMIT = 10;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
