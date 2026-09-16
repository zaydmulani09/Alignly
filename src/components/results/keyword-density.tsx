"use client";

interface KeywordDensityProps {
  keywords: Array<{ keyword: string; presentInResume: boolean }>;
}

export function KeywordDensity({ keywords }: KeywordDensityProps) {
  const present = keywords.filter((k) => k.presentInResume).length;
  const total = keywords.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Keywords found</p>
        <p className="text-lg font-bold">
          {present}/{total}
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-secondary transition-all"
          style={{ width: `${total > 0 ? (present / total) * 100 : 0}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {keywords.map((k) => (
          <span
            key={k.keyword}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              k.presentInResume
                ? "bg-positive/20 text-positive-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {k.keyword}
          </span>
        ))}
      </div>
    </div>
  );
}
