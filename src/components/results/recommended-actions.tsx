"use client";

import type { ActionPlanItem } from "@/lib/ai/analysis-schema";

interface RecommendedActionsProps {
  items: ActionPlanItem[];
}

export function RecommendedActions({ items }: RecommendedActionsProps) {
  const effortColor = {
    quick: "bg-positive/10 text-positive-foreground",
    moderate: "bg-caution/10 text-caution-foreground",
    substantial: "bg-negative/10 text-negative-foreground",
  };

  return (
    <ol className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="rounded-lg border border-border-subtle p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary/10 font-semibold text-secondary">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium">{item.step}</p>
              <span className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium ${effortColor[item.effort]}`}>
                {item.effort}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
