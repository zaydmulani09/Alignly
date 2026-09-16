import { checkFileContents } from "@/lib/extract/file-type";
import { countWords, normalizeExtractedText } from "@/lib/extract/normalize";
import { MAX_FILE_BYTES, MIN_RESUME_CHARS } from "@/lib/limits";
import { NextResponse } from "next/server";

// pdf and docx parsing both need Node APIs, so this route cannot run on edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export type ExtractSuccess = {
  text: string;
  words: number;
  characters: number;
  kind: "pdf" | "docx";
};

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function extractPdf(bytes: Uint8Array): Promise<string> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const document = await getDocumentProxy(bytes);
  const { text } = await extractText(document, { mergePages: true });
  return Array.isArray(text) ? text.join("\n") : text;
}

async function extractDocx(bytes: Uint8Array): Promise<string> {
  const mammoth = await import("mammoth");
  const { value } = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
  return value;
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("Could not read the upload. Try again.", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return fail("No file was included in the request.", 400);
  }
  if (file.size > MAX_FILE_BYTES) {
    return fail("That file is larger than the 5 MB limit.", 413);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const check = checkFileContents(bytes, bytes.byteLength);
  if (!check.ok) {
    return fail(check.reason, 415);
  }

  let raw: string;
  try {
    raw = check.kind === "pdf" ? await extractPdf(bytes) : await extractDocx(bytes);
  } catch {
    // The underlying error can echo document content, so it is deliberately
    // not logged or returned.
    return fail(
      check.kind === "pdf"
        ? "That PDF could not be read. It may be encrypted or password-protected."
        : "That DOCX could not be read. Try re-saving it from your word processor.",
      422,
    );
  }

  const text = normalizeExtractedText(raw);
  const words = countWords(text);

  if (text.length < MIN_RESUME_CHARS || words < 40) {
    return fail(
      "Almost no text came out of that file. If it is a scan or an image-only PDF, export a text-based version and try again.",
      422,
    );
  }

  const body: ExtractSuccess = {
    text,
    words,
    characters: text.length,
    kind: check.kind,
  };

  // Nothing here is cacheable and none of it should linger in an intermediary.
  return NextResponse.json(body, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
