"use client";

import { Disclosure } from "@/components/ui/disclosure";

interface InterviewPrepProps {
  topics: Array<{ topic: string; why: string }>;
}

export function InterviewPrep({ topics }: InterviewPrepProps) {
  return (
    <div className="space-y-3">
      {topics.map((t, i) => (
        <Disclosure key={i} summary={t.topic} defaultOpen={i === 0}>
          <p className="text-sm text-muted-foreground">{t.why}</p>
        </Disclosure>
      ))}
    </div>
  );
}
