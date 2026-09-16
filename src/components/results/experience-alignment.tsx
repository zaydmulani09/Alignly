"use client";

interface ExperienceAlignmentProps {
  items: Array<{ requirement: string; status: "met" | "partial" | "not-evident" }>;
}

export function ExperienceAlignment({ items }: ExperienceAlignmentProps) {
  const statusIcon = { met: "✓", partial: "◐", "not-evident": "✕" };
  const statusColor = {
    met: "text-positive",
    partial: "text-caution",
    "not-evident": "text-negative",
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3 rounded-md bg-surface p-3 text-sm">
          <span className={`font-bold ${statusColor[item.status]}`}>{statusIcon[item.status]}</span>
          <div className="flex-1">
            <p className="text-sm">{item.requirement}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
