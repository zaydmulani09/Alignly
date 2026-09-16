"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { checkFileMetadata } from "@/lib/extract/file-type";
import { MAX_FILE_BYTES, formatBytes } from "@/lib/limits";
import { useSession } from "@/lib/session/session-context";
import { cn } from "@/lib/cn";
import {
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

type Phase = "idle" | "reading" | "extracting";

export function ResumeUpload() {
  const { resume, setResume, clearResume } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const busy = phase !== "idle";

  const upload = useCallback(
    async (file: File) => {
      setError(null);

      const metadata = checkFileMetadata({ name: file.name, size: file.size });
      if (!metadata.ok) {
        setError(metadata.reason);
        return;
      }

      setPhase("reading");
      setProgress(0);

      const body = new FormData();
      body.append("file", file);

      // XHR rather than fetch: it reports real upload progress, which matters
      // for a multi-megabyte PDF on a slow connection.
      const xhr = new XMLHttpRequest();
      const done = new Promise<{ status: number; text: string }>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (!event.lengthComputable) return;
          const pct = Math.round((event.loaded / event.total) * 100);
          setProgress(pct);
          if (pct >= 100) setPhase("extracting");
        });
        xhr.addEventListener("load", () =>
          resolve({ status: xhr.status, text: xhr.responseText }),
        );
        xhr.addEventListener("error", () => reject(new Error("network")));
        xhr.addEventListener("abort", () => reject(new Error("aborted")));
      });

      xhr.open("POST", "/api/extract");
      xhr.send(body);

      try {
        const { status, text } = await done;
        const payload = JSON.parse(text) as
          | { text: string; words: number; kind: "pdf" | "docx" }
          | { error: string };

        if (status !== 200 || "error" in payload) {
          setError(
            "error" in payload
              ? payload.error
              : "That file could not be read. Try another export.",
          );
          return;
        }

        setResume({
          name: file.name,
          size: file.size,
          kind: payload.kind,
          text: payload.text,
          words: payload.words,
        });
      } catch {
        setError("The upload did not complete. Check your connection and try again.");
      } finally {
        setPhase("idle");
        setProgress(0);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [setResume],
  );

  function onDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void upload(file);
  }

  if (resume) {
    return (
      <div className="space-y-3">
        <div className="flex flex-col gap-4 rounded-xl border border-positive/30 bg-positive-surface p-4 sm:flex-row sm:items-center">
          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-positive/15 text-positive">
            <FileText className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 truncate font-medium text-positive-foreground">
              <CheckCircle2 className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{resume.name}</span>
            </p>
            <p className="text-sm text-positive-foreground/80">
              {resume.kind.toUpperCase()} · {formatBytes(resume.size)} ·{" "}
              {resume.words.toLocaleString()} words extracted
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => inputRef.current?.click()}
            >
              <RefreshCw className="size-4" aria-hidden />
              Replace
            </Button>
            <Button size="sm" variant="ghost" onClick={clearResume}>
              <Trash2 className="size-4" aria-hidden />
              Remove
            </Button>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
        />
        {error ? <Alert tone="negative">{error}</Alert> : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* The whole zone is a button, so drag-and-drop is a shortcut rather than
          the only way in — keyboard and screen-reader users get the same path. */}
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors",
          dragging
            ? "border-secondary bg-secondary/5"
            : "border-border bg-surface hover:border-secondary/60 hover:bg-surface-sunken",
          busy && "pointer-events-none opacity-70",
        )}
      >
        {busy ? (
          <>
            <Loader2 className="size-8 animate-spin text-secondary" aria-hidden />
            <p className="font-medium">
              {phase === "reading" ? "Uploading…" : "Extracting text…"}
            </p>
            <div
              className="h-1.5 w-56 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={phase === "extracting" ? 100 : progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Upload progress"
            >
              <div
                className="h-full rounded-full bg-secondary transition-[width] duration-200"
                style={{ width: `${phase === "extracting" ? 100 : progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {phase === "extracting"
                ? "Reading the document on the server"
                : `${progress}%`}
            </p>
          </>
        ) : (
          <>
            <span className="grid size-12 place-items-center rounded-full bg-secondary/10 text-secondary">
              <UploadCloud className="size-6" aria-hidden />
            </span>
            <p className="font-display text-lg font-semibold">
              Drop your resume here
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              or click to choose a file. PDF or DOCX, up to{" "}
              {formatBytes(MAX_FILE_BYTES)}. Text-based documents only — a scanned
              image has no text to read.
            </p>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />

      {error ? (
        <Alert tone="negative" title="That did not work">
          {error}
        </Alert>
      ) : null}
    </div>
  );
}
