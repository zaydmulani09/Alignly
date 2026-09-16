import "server-only";
import { getApiKey, getBaseUrl, getModel } from "@/lib/ai/config";

export type GeminiPart = { text: string };
export type GeminiContent = { role: "user" | "model"; parts: GeminiPart[] };

export type GeminiFailure = {
  /** Stable code the route maps to an HTTP status and a user-facing message. */
  code:
    | "not-configured"
    | "invalid-key"
    | "rate-limited"
    | "quota-exhausted"
    | "timeout"
    | "blocked"
    | "unavailable"
    | "bad-response";
  message: string;
};

export class GeminiError extends Error implements GeminiFailure {
  code: GeminiFailure["code"];
  constructor(code: GeminiFailure["code"], message: string) {
    super(message);
    this.name = "GeminiError";
    this.code = code;
  }
}

/** Human-readable text for each failure, safe to show in the UI. */
export const FAILURE_MESSAGES: Record<GeminiFailure["code"], string> = {
  "not-configured":
    "AI analysis is not configured on this deployment. A GEMINI_API_KEY environment variable is required.",
  "invalid-key":
    "The configured Gemini API key was rejected. Check GEMINI_API_KEY in your environment.",
  "rate-limited":
    "Too many requests in a short window. Wait a minute and try again.",
  "quota-exhausted":
    "The Gemini free-tier quota for this key is used up. It resets daily, or you can add billing in Google AI Studio.",
  timeout: "The model took too long to respond. Try again.",
  blocked:
    "The model declined to answer for this content. Try rephrasing, or check the document for unexpected text.",
  unavailable: "Gemini is temporarily unavailable. Try again in a moment.",
  "bad-response":
    "The model returned something we could not read. Try running the analysis again.",
};

export const FAILURE_STATUS: Record<GeminiFailure["code"], number> = {
  "not-configured": 503,
  "invalid-key": 500,
  "rate-limited": 429,
  "quota-exhausted": 429,
  timeout: 504,
  blocked: 422,
  unavailable: 503,
  "bad-response": 502,
};

interface GenerateOptions {
  system: string;
  contents: GeminiContent[];
  /** Present for analysis, absent for chat. */
  responseSchema?: unknown;
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
}

function mapHttpError(status: number, body: string): GeminiError {
  if (status === 400 && /API key not valid|API_KEY_INVALID/i.test(body)) {
    return new GeminiError("invalid-key", FAILURE_MESSAGES["invalid-key"]);
  }
  if (status === 401 || status === 403) {
    return new GeminiError("invalid-key", FAILURE_MESSAGES["invalid-key"]);
  }
  if (status === 429) {
    const exhausted = /quota|exhausted|PerDay/i.test(body);
    const code = exhausted ? "quota-exhausted" : "rate-limited";
    return new GeminiError(code, FAILURE_MESSAGES[code]);
  }
  if (status === 503 || status === 500 || status === 502) {
    return new GeminiError("unavailable", FAILURE_MESSAGES.unavailable);
  }
  return new GeminiError("bad-response", FAILURE_MESSAGES["bad-response"]);
}

/**
 * Single call into Gemini. Returns the model's text; the caller decides whether
 * that text is JSON. Errors are normalised so route handlers never have to
 * parse Google's error envelope, and the request body is never logged.
 */
export async function generate({
  system,
  contents,
  responseSchema,
  temperature = 0.3,
  maxOutputTokens = 8192,
  timeoutMs = 60_000,
  signal,
}: GenerateOptions): Promise<string> {
  const key = getApiKey();
  if (!key) {
    throw new GeminiError("not-configured", FAILURE_MESSAGES["not-configured"]);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  signal?.addEventListener("abort", () => controller.abort(), { once: true });

  let response: Response;
  try {
    response = await fetch(`${getBaseUrl()}/${getModel()}:generateContent`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": key,
      },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        generationConfig: {
          temperature,
          maxOutputTokens,
          ...(responseSchema
            ? { responseMimeType: "application/json", responseSchema }
            : {}),
        },
      }),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new GeminiError("timeout", FAILURE_MESSAGES.timeout);
    }
    throw new GeminiError("unavailable", FAILURE_MESSAGES.unavailable);
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    // Read the body for classification only. It is never logged or returned:
    // error envelopes can echo the prompt, which contains the resume.
    const body = await response.text().catch(() => "");
    throw mapHttpError(response.status, body);
  }

  const payload = (await response.json().catch(() => null)) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      finishReason?: string;
    }>;
    promptFeedback?: { blockReason?: string };
  } | null;

  if (!payload) {
    throw new GeminiError("bad-response", FAILURE_MESSAGES["bad-response"]);
  }
  if (payload.promptFeedback?.blockReason) {
    throw new GeminiError("blocked", FAILURE_MESSAGES.blocked);
  }

  const candidate = payload.candidates?.[0];
  const text = candidate?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

  if (candidate?.finishReason === "SAFETY" || candidate?.finishReason === "PROHIBITED_CONTENT") {
    throw new GeminiError("blocked", FAILURE_MESSAGES.blocked);
  }
  if (candidate?.finishReason === "MAX_TOKENS" && !text) {
    throw new GeminiError("bad-response", FAILURE_MESSAGES["bad-response"]);
  }
  if (!text.trim()) {
    throw new GeminiError("bad-response", FAILURE_MESSAGES["bad-response"]);
  }

  return text;
}
