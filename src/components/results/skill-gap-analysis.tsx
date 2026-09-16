"use client";

interface SkillGapAnalysisProps {
  matched: number;
  missing: number;
  total: number;
}

export function SkillGapAnalysis({ matched, missing, total }: SkillGapAnalysisProps) {
  const coverage = total > 0 ? Math.round((matched / total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-positive/30 bg-positive-surface p-4">
          <p className="text-xs font-semibold text-positive-foreground/70 uppercase">Matched</p>
          <p className="mt-2 text-3xl font-bold text-positive">{matched}</p>
          <p className="mt-1 text-sm text-positive-foreground/80">{coverage}% coverage</p>
        </div>
        <div className="rounded-lg border border-negative/30 bg-negative/5 p-4">
          <p className="text-xs font-semibold text-negative/70 uppercase">Missing</p>
          <p className="mt-2 text-3xl font-bold text-negative">{missing}</p>
          <p className="mt-1 text-sm text-negative/80">{100 - coverage}% gap</p>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-positive" style={{ width: `${coverage}%` }} />
      </div>
      <p className="text-center text-xs text-muted-foreground">
        {matched} of {total} key skills evident in your resume
      </p>
    </div>
  );
}
