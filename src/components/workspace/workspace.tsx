"use client";

import { ResultsDashboard } from "@/components/results/results-dashboard";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AssistantPanel } from "@/components/workspace/assistant-panel";
import { DraftWorkshop } from "@/components/workspace/draft-workshop";
import { JobDescriptionInput } from "@/components/workspace/job-description-input";
import { ResumeUpload } from "@/components/workspace/resume-upload";
import type { Analysis } from "@/lib/ai/analysis-schema";
import { cn } from "@/lib/cn";
import { MIN_JOB_DESCRIPTION_CHARS } from "@/lib/limits";
import { isAnalysisStale, useSession } from "@/lib/session/session-context";
import {
  ArrowRight,
  FilePenLine,
  LayoutDashboard,
  Loader2,
  MessagesSquare,
  Settings2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Tab = "setup" | "results" | "assistant" | "draft";

const TABS: Array<{ id: Tab; label: string; Icon: typeof Settings2 }> = [
  { id: "setup", label: "Setup", Icon: Settings2 },
  { id: "results", label: "Results", Icon: LayoutDashboard },
  { id: "assistant", label: "Assistant", Icon: MessagesSquare },
  { id: "draft", label: "Draft", Icon: FilePenLine },
];

export function Workspace() {
  const session = useSession();
  const {
    resume,
    jobDescription,
    analysis,
    analyzedAt,
    hydrated,
    setAnalysis,
    clearEverything,
  } = session;

  // null means "not chosen yet", which lets the landing tab be derived from
  // the restored session instead of corrected by an effect after mount.
  const [chosenTab, setTab] = useState<Tab | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/status")
      .then((response) => response.json() as Promise<{ configured: boolean }>)
      .then((status) => {
        if (!cancelled) setAiConfigured(status.configured);
      })
      .catch(() => {
        if (!cancelled) setAiConfigured(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Land on the results if a previous analysis survived a refresh.
  const tab: Tab = chosenTab ?? (hydrated && analysis ? "results" : "setup");

  const stale = isAnalysisStale(session);
  const jdReady = jobDescription.trim().length >= MIN_JOB_DESCRIPTION_CHARS;
  const canAnalyze = Boolean(resume) && jdReady && aiConfigured !== false;

  const runAnalysis = useCallback(async () => {
    if (!resume || !jdReady) return;
    setRunning(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          resumeText: resume.text,
          jobDescription: jobDescription.trim(),
        }),
      });
      const payload = (await response.json()) as
        | { analysis: Analysis }
        | { error: string };

      if (!response.ok || "error" in payload) {
        setError("error" in payload ? payload.error : "The analysis failed.");
        return;
      }
      setAnalysis(payload.analysis);
      setTab("results");
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setRunning(false);
    }
  }, [resume, jobDescription, jdReady, setAnalysis]);

  if (!hydrated) {
    return (
      <div className="container-app max-w-5xl space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const tabAvailable: Record<Tab, boolean> = {
    setup: true,
    results: Boolean(analysis),
    assistant: Boolean(resume),
    draft: Boolean(analysis),
  };

  return (
    <div className="container-app max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-3xl font-bold">Your workspace</h1>
          <p className="text-sm text-muted-foreground">
            Everything here lives in this browser tab until you clear it.
          </p>
        </div>
        {(resume || jobDescription) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearEverything();
              setTab("setup");
              setError(null);
            }}
          >
            <Trash2 className="size-4" aria-hidden />
            Clear everything
          </Button>
        )}
      </div>

      {aiConfigured === false ? (
        <Alert tone="caution" title="AI analysis is not configured">
          <p>
            This deployment has no <code>GEMINI_API_KEY</code>, so analysis and the
            assistant are unavailable. Uploading a resume and extracting its text still
            work. See the README for the two-minute setup.
          </p>
        </Alert>
      ) : null}

      {/* Tabs */}
      <div role="tablist" aria-label="Workspace sections" className="flex gap-1 overflow-x-auto border-b border-border-subtle">
        {TABS.map(({ id, label, Icon }) => {
          const available = tabAvailable[id];
          return (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={tab === id}
              disabled={!available}
              onClick={() => setTab(id)}
              className={cn(
                "-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                tab === id
                  ? "border-secondary text-secondary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
                !available && "cursor-not-allowed opacity-40 hover:text-muted-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </button>
          );
        })}
      </div>

      {tab === "setup" ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="mr-2 text-muted-foreground">1.</span>Your resume
              </CardTitle>
              <CardDescription>
                PDF or DOCX. The text is extracted on our server and returned to this
                page; the file is not stored.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResumeUpload />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <span className="mr-2 text-muted-foreground">2.</span>The job
              </CardTitle>
              <CardDescription>
                Paste the posting you are applying for.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JobDescriptionInput />
            </CardContent>
          </Card>

          <Card className="border-secondary/30 bg-secondary/[0.03]">
            <CardContent className="space-y-4 p-6 pt-6">
              <div className="space-y-1">
                <h2 className="font-display text-lg font-semibold">
                  <span className="mr-2 text-muted-foreground">3.</span>Run the analysis
                </h2>
                <p className="text-sm text-muted-foreground">
                  Pressing this sends your resume text and the job description to
                  Google&apos;s Gemini API. Nothing leaves this page before you do.
                </p>
              </div>

              {error ? (
                <Alert tone="negative" title="The analysis did not run">
                  {error}
                </Alert>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg" onClick={runAnalysis} disabled={!canAnalyze || running}>
                  {running ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      Analyzing…
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" aria-hidden />
                      {analysis ? "Run it again" : "Analyze my resume"}
                    </>
                  )}
                </Button>
                {analysis && !running ? (
                  <Button variant="outline" size="lg" onClick={() => setTab("results")}>
                    View current results
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                ) : null}
              </div>

              {!canAnalyze && aiConfigured !== false ? (
                <p className="text-sm text-muted-foreground">
                  {!resume
                    ? "Add a resume to continue."
                    : `The job description needs at least ${MIN_JOB_DESCRIPTION_CHARS} characters.`}
                </p>
              ) : null}

              {running ? (
                <div className="space-y-2" aria-live="polite">
                  <p className="text-sm text-muted-foreground">
                    Reading both documents and scoring the overlap. This usually takes
                    15–30 seconds.
                  </p>
                  <Skeleton className="h-2 w-full" />
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {tab === "results" && analysis ? (
        <div className="space-y-4">
          {stale ? (
            <Alert tone="caution" title="The job description has changed">
              <p>
                These results were produced from the previous posting. Run the analysis
                again to update them.
              </p>
              <Button size="sm" variant="outline" className="mt-3" onClick={runAnalysis} disabled={running}>
                {running ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Sparkles className="size-4" aria-hidden />
                )}
                Re-run the analysis
              </Button>
            </Alert>
          ) : null}
          <ResultsDashboard
            analysis={analysis}
            generatedAt={analyzedAt}
            onAnalyzeAnother={() => setTab("setup")}
          />
        </div>
      ) : null}

      {tab === "assistant" && resume ? <AssistantPanel /> : null}

      {tab === "draft" && analysis ? <DraftWorkshop analysis={analysis} /> : null}
    </div>
  );
}
