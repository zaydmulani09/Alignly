"use client";

import { useMemo } from "react";

interface LikelihoodGaugeProps {
  score: number;
}

export function LikelihoodGauge({ score }: LikelihoodGaugeProps) {
  const likelihood = useMemo(() => {
    if (score >= 80) return { percent: 85, label: "Very Strong", tone: "positive" as const };
    if (score >= 70) return { percent: 70, label: "Strong", tone: "positive" as const };
    if (score >= 60) return { percent: 55, label: "Moderate", tone: "caution" as const };
    if (score >= 50) return { percent: 40, label: "Possible", tone: "caution" as const };
    return { percent: 20, label: "Long Shot", tone: "negative" as const };
  }, [score]);

  const colors = {
    positive: "#16A34A",
    caution: "#D97706",
    negative: "#DC2626",
  };

  return (
    <div className="rounded-lg border border-border-subtle p-6">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Estimated Likelihood
      </p>
      <h3 className="mt-2 text-2xl font-bold">{likelihood.label}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Based on alignment score and keyword coverage
      </p>

      <div className="mt-4 space-y-2">
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${likelihood.percent}%`, backgroundColor: colors[likelihood.tone] }}
          />
        </div>
        <p className="text-right text-sm font-semibold">{likelihood.percent}%</p>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        This is one model&rsquo;s estimate based on the resume and job posting provided. It is not a
        hiring probability.
      </p>
    </div>
  );
}
