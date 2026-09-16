"use client";

import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";

/**
 * A single number deserves a single mark. The arc exists to make the score
 * readable at a glance and to carry the same evidence colours used elsewhere;
 * it is not decoration, and the number is always present as text.
 */
export function ScoreArc({
  score,
  label,
  size = 180,
}: {
  score: number;
  label: string;
  size?: number;
}) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    // One frame of delay so the stroke animates from empty on mount.
    const frame = requestAnimationFrame(() => setShown(score));
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = Math.PI * radius; // semicircle
  const offset = circumference * (1 - Math.min(Math.max(shown, 0), 100) / 100);

  const tone =
    score >= 75 ? "text-positive" : score >= 50 ? "text-caution" : "text-negative";

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size / 2 + 8}
        viewBox={`0 0 ${size} ${size / 2 + 8}`}
        role="img"
        aria-label={`Estimated match score: ${score} out of 100. ${label}.`}
      >
        <path
          d={`M ${stroke / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - stroke / 2} ${size / 2}`}
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          d={`M ${stroke / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - stroke / 2} ${size / 2}`}
          fill="none"
          stroke="currentColor"
          className={cn(tone, "transition-[stroke-dashoffset] duration-700 ease-out")}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="-mt-10 flex flex-col items-center">
        <span className="font-display text-4xl font-extrabold tabular-nums">
          {score}
          <span className="text-lg font-semibold text-muted-foreground">/100</span>
        </span>
        <span className={cn("font-display text-sm font-semibold", tone)}>{label}</span>
      </div>
    </div>
  );
}

/** Horizontal bar for the per-dimension breakdown. */
export function ScoreBar({ score, name }: { score: number; name: string }) {
  const tone =
    score >= 75 ? "bg-positive" : score >= 50 ? "bg-caution" : "bg-negative";
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium">{name}</span>
        <span className="tabular-nums text-muted-foreground">{score}</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`${name}: ${score} out of 100`}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-700", tone)}
          style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}
