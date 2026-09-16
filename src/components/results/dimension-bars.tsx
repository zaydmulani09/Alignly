"use client";

interface Dimension {
  name: string;
  score: number;
}

interface DimensionBarsProps {
  dimensions: Dimension[];
}

export function DimensionBars({ dimensions }: DimensionBarsProps) {
  return (
    <div className="space-y-4">
      {dimensions.map((dim) => (
        <div key={dim.name}>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">{dim.name}</label>
            <span className="text-sm font-semibold">{dim.score}/100</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full transition-all duration-500 ${
                dim.score >= 75
                  ? "bg-positive"
                  : dim.score >= 50
                    ? "bg-caution"
                    : "bg-negative"
              }`}
              style={{ width: `${dim.score}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
