"use client";

import { Disclosure } from "@/components/ui/disclosure";

interface InterviewPrepProps {
  topics: Array<{ topic: string; preparation: string }>;
}

export function InterviewPrep({ topics }: InterviewPrepProps) {
  return (
    <div className="space-y-3">
      {topics.map((t, i) => (
        <Disclosure key={i} title={t.topic} defaultOpen={i === 0}>
          <p className="text-sm text-muted-foreground">{t.preparation}</p>
        </Disclosure>
      ))}
    </div>
  );
}
