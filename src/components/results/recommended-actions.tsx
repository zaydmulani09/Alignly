"use client";

interface ActionPlanItem {
  area: string;
  title: string;
  detail: string;
  priority: "high" | "medium" | "low";
}

interface RecommendedActionsProps {
  items: ActionPlanItem[];
}

export function RecommendedActions({ items }: RecommendedActionsProps) {
  const priorityColor = {
    high: "bg-negative/10 text-negative-foreground",
    medium: "bg-caution/10 text-caution-foreground",
    low: "bg-positive/10 text-positive-foreground",
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
              <p className="font-medium">{item.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
              <span className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium ${priorityColor[item.priority]}`}>
                {item.priority} priority
              </span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
