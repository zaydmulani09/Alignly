"use client";

interface ScoreBreakdownProps {
  score: number;
}

export function ScoreBreakdown({ score }: ScoreBreakdownProps) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-sunken p-4">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-muted-foreground">Your score</p>
          <p className="mt-1 text-2xl font-bold text-secondary">{score}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Benchmark</p>
          <p className="mt-1 text-2xl font-bold text-muted-foreground">60</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Ideal</p>
          <p className="mt-1 text-2xl font-bold text-positive">85+</p>
        </div>
      </div>
    </div>
  );
}
