import { Logo } from "@/components/layout/logo";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border-subtle bg-surface">
      <div className="container-app flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-md space-y-3">
          <Logo />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your resume is held in your browser for the length of your session. It is
            sent to Google&apos;s Gemini API only at the moment you ask for an analysis
            or message the assistant, and it is never written to a database or a log.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
            How your data is handled
          </Link>
          <Link href="/analyze" className="text-muted-foreground hover:text-foreground">
            Analyze a resume
          </Link>
          <p className="pt-2 text-xs text-muted-foreground">
            Scores are AI estimates, not hiring predictions.
          </p>
        </div>
      </div>
    </footer>
  );
}
