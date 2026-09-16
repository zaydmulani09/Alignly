import { getRateLimitPerMinute, isAiConfigured } from "@/lib/ai/config";
import {
  FAILURE_MESSAGES,
  FAILURE_STATUS,
  GeminiError,
  generate,
  type GeminiContent,
} from "@/lib/ai/gemini";
import { CHAT_SYSTEM_PROMPT, buildChatContext } from "@/lib/ai/prompts";
import {
  MAX_CHAT_HISTORY_MESSAGES,
  MAX_CHAT_MESSAGE_CHARS,
  MAX_JOB_DESCRIPTION_CHARS,
  MAX_RESUME_CHARS,
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
  jobDescription: z.string().max(MAX_JOB_DESCRIPTION_CHARS).nullable(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(MAX_CHAT_MESSAGE_CHARS),
      }),
    )
    .min(1)
    .max(MAX_CHAT_HISTORY_MESSAGES),
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

  const limit = rateLimit(clientKey(request, "chat"), getRateLimitPerMinute());
  if (!limit.allowed) {
    return fail("rate-limited", limit.retryAfter);
  }

  let parsed: z.infer<typeof requestSchema>;
  try {
    parsed = requestSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: "That message could not be sent. Check the length and try again.", code: "invalid-request" },
      { status: 400 },
    );
  }

  const last = parsed.messages.at(-1);
  if (!last || last.role !== "user") {
    return NextResponse.json(
      { error: "The last message must come from you.", code: "invalid-request" },
      { status: 400 },
    );
  }

  // The documents ride in as the opening exchange rather than in the system
  // prompt, so the model treats them as material to work from, not as rules.
  const contents: GeminiContent[] = [
    {
      role: "user",
      parts: [{ text: buildChatContext(parsed.resumeText, parsed.jobDescription) }],
    },
    {
      role: "model",
      parts: [
        {
          text: "I have read the resume and the posting. Ask me anything about this application.",
        },
      ],
    },
    ...parsed.messages.map<GeminiContent>((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    })),
  ];

  let reply: string;
  try {
    reply = await generate({
      system: CHAT_SYSTEM_PROMPT,
      contents,
      temperature: 0.4,
      maxOutputTokens: 2048,
      timeoutMs: 45_000,
    });
  } catch (error) {
    if (error instanceof GeminiError) return fail(error.code);
    return fail("unavailable");
  }

  return NextResponse.json(
    { reply },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
