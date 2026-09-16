"use client";

import type { Analysis } from "@/lib/ai/analysis-schema";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface ResumeFile {
  name: string;
  size: number;
  kind: "pdf" | "docx";
  text: string;
  words: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

/** A per-rewrite decision plus any hand edits made to the suggested text. */
export interface RewriteDecision {
  status: "pending" | "accepted" | "rejected";
  edited: string;
}

interface SessionState {
  resume: ResumeFile | null;
  jobDescription: string;
  analysis: Analysis | null;
  analyzedAt: string | null;
  /** The job description the current analysis was run against. */
  analyzedJobDescription: string | null;
  decisions: Record<string, RewriteDecision>;
  chat: ChatMessage[];
  shareContextWithAssistant: boolean;
}

const EMPTY: SessionState = {
  resume: null,
  jobDescription: "",
  analysis: null,
  analyzedAt: null,
  analyzedJobDescription: null,
  decisions: {},
  chat: [],
  shareContextWithAssistant: true,
};

interface SessionValue extends SessionState {
  hydrated: boolean;
  setResume: (resume: ResumeFile) => void;
  clearResume: () => void;
  setJobDescription: (value: string) => void;
  setAnalysis: (analysis: Analysis) => void;
  clearAnalysis: () => void;
  setDecision: (key: string, decision: Partial<RewriteDecision>) => void;
  appendChat: (message: ChatMessage) => void;
  clearChat: () => void;
  setShareContext: (value: boolean) => void;
  clearEverything: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

/**
 * sessionStorage, not localStorage: the resume survives a refresh or an
 * accidental navigation, and disappears when the tab does. Nothing is sent to
 * a server except when the user asks for an analysis or a chat reply.
 */
const STORAGE_KEY = "alignly-session-v1";

function readStored(): SessionState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SessionState>;
    return { ...EMPTY, ...parsed };
  } catch {
    // Corrupt or unavailable storage should not break the page.
    return null;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const skipWrite = useRef(true);

  useEffect(() => {
    // sessionStorage is an external system and cannot be read during render
    // without breaking hydration, so this one synchronous setState is the
    // point of the effect rather than a cascade.
    const stored = readStored();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setState(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipWrite.current) {
      skipWrite.current = false;
      return;
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Quota or private mode; the session still works in memory.
    }
  }, [state, hydrated]);

  const patch = useCallback((next: Partial<SessionState>) => {
    setState((current) => ({ ...current, ...next }));
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      ...state,
      hydrated,
      setResume: (resume) =>
        // A new resume invalidates the analysis it was based on.
        patch({
          resume,
          analysis: null,
          analyzedAt: null,
          analyzedJobDescription: null,
          decisions: {},
          chat: [],
        }),
      clearResume: () =>
        patch({
          resume: null,
          analysis: null,
          analyzedAt: null,
          analyzedJobDescription: null,
          decisions: {},
          chat: [],
        }),
      setJobDescription: (jobDescription) => patch({ jobDescription }),
      setAnalysis: (analysis) =>
        setState((current) => ({
          ...current,
          analysis,
          analyzedAt: new Date().toISOString(),
          analyzedJobDescription: current.jobDescription,
          decisions: {},
        })),
      clearAnalysis: () =>
        patch({ analysis: null, analyzedAt: null, analyzedJobDescription: null, decisions: {} }),
      setDecision: (key, decision) =>
        setState((current) => ({
          ...current,
          decisions: {
            ...current.decisions,
            [key]: {
              status: decision.status ?? current.decisions[key]?.status ?? "pending",
              edited: decision.edited ?? current.decisions[key]?.edited ?? "",
            },
          },
        })),
      appendChat: (message) =>
        setState((current) => ({ ...current, chat: [...current.chat, message] })),
      clearChat: () => patch({ chat: [] }),
      setShareContext: (shareContextWithAssistant) => patch({ shareContextWithAssistant }),
      clearEverything: () => {
        try {
          sessionStorage.removeItem(STORAGE_KEY);
        } catch {
          // Nothing to clean up if storage was never available.
        }
        setState(EMPTY);
      },
    }),
    [state, hydrated, patch],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used inside a SessionProvider");
  }
  return context;
}

/** True when the job description has changed since the analysis was produced. */
export function isAnalysisStale(state: {
  analysis: Analysis | null;
  jobDescription: string;
  analyzedJobDescription: string | null;
}): boolean {
  if (!state.analysis) return false;
  return state.jobDescription.trim() !== (state.analyzedJobDescription ?? "").trim();
}
