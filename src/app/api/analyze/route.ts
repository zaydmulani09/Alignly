import { analysisSchema, geminiAnalysisSchema } from "@/lib/ai/analysis-schema";
import { getRateLimitPerMinute, isAiConfigured } from "@/lib/ai/config";
import {
  FAILURE_MESSAGES,
  FAILURE_STATUS,
  GeminiError,
  generate,
} from "@/lib/ai/gemini";
import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisPrompt } from "@/lib/ai/prompts";
import {
  MAX_JOB_DESCRIPTION_CHARS,
  MAX_RESUME_CHARS,
  MIN_JOB_DESCRIPTION_CHARS,
  MIN_RESUME_CHARS,
} from "@/lib/limits";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const requestSchema = z.object({
  resumeText: z.string().min(MIN_RESUME_CHARS).max(MAX_RESUME_CHARS),
  jobDescription: z
    .string()
    .min(MIN_JOB_DESCRIPTION_CHARS)
    .max(MAX_JOB_DESCRIPTION_CHARS),
});

function fail(code: GeminiError["code"], retryAfter?: number) {
  return NextResponse.json(
    { error: FAILURE_MESSAGES[code], code },
    {
      status: FAILURE_STATUS[code],
      headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined,
    },
  );
}

export async function POST(request: Request) {
  if (!isAiConfigured()) {
    return fail("not-configured");
  }

  const limit = rateLimit(clientKey(request, "analyze"), getRateLimitPerMinute());
  if (!limit.allowed) {
    return fail("rate-limited", limit.retryAfter);
  }

  let parsed: z.infer<typeof requestSchema>;
  try {
    parsed = requestSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      {
        error:
          "The resume or job description was missing, too short, or too long to analyse.",
        code: "invalid-request",
      },
      { status: 400 },
    );
  }

  let raw: string;
  try {
    raw = await generate({
      system: ANALYSIS_SYSTEM_PROMPT,
      contents: [
        {
          role: "user",
          parts: [
            { text: buildAnalysisPrompt(parsed.resumeText, parsed.jobDescription) },
          ],
        },
      ],
      responseSchema: geminiAnalysisSchema,
      temperature: 0.25,
      timeoutMs: 55_000,
    });
  } catch (error) {
    if (error instanceof GeminiError) return fail(error.code);
    return fail("unavailable");
  }

  // Structured output is reliable but not guaranteed, so the response is
  // validated against the same contract before the UI ever sees it.
  let analysis;
  try {
    analysis = analysisSchema.parse(JSON.parse(raw));
  } catch {
    return fail("bad-response");
  }

  return NextResponse.json(
    { analysis, generatedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
