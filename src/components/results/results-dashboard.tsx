"use client";

import { ScoreArc, ScoreBar } from "@/components/results/score-arc";
import { Alert } from "@/components/ui/alert";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Disclosure } from "@/components/ui/disclosure";
import type { Analysis } from "@/lib/ai/analysis-schema";
import { cn } from "@/lib/cn";
import {
  CircleDashed,
  CircleDot,
  CircleSlash,
  Info,
  Quote,
  RotateCcw,
} from "lucide-react";

const importanceTone: Record<string, BadgeTone> = {
  critical: "negative",
  important: "caution",
  "nice-to-have": "neutral",
};

const priorityTone: Record<string, BadgeTone> = {
  high: "negative",
  medium: "caution",
  low: "neutral",
};

const effortLabel: Record<string, string> = {
  quick: "Under 10 minutes",
  moderate: "An hour or so",
  substantial: "Ongoing work",
};

const statusMeta = {
  met: { tone: "positive" as BadgeTone, label: "Met", Icon: CircleDot },
  partial: { tone: "caution" as BadgeTone, label: "Partial", Icon: CircleDashed },
  "not-evident": {
    tone: "negative" as BadgeTone,
    label: "Not evident",
    Icon: CircleSlash,
  },
};

export function ResultsDashboard({
  analysis,
  generatedAt,
  onAnalyzeAnother,
}: {
  analysis: Analysis;
  generatedAt: string | null;
  onAnalyzeAnother: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Score */}
      <Card>
        <CardContent className="grid gap-8 p-6 pt-6 sm:grid-cols-[auto_1fr] sm:items-center">
          <ScoreArc score={analysis.overallScore} label={analysis.scoreLabel} />
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Estimated alignment with</p>
              <h2 className="font-display text-xl font-bold">{analysis.roleTitle}</h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {analysis.scoreRationale}
            </p>
            <div className="flex items-start gap-2 rounded-lg bg-surface-sunken p-3 text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <p>
                This score is one model&apos;s estimate of how well your resume
                <em> evidences </em> this posting&apos;s stated requirements. It is not
                a probability of being hired, and no employer sees it. Run the same
                resume against two postings and the difference between the scores is
                more meaningful than either number alone.
              </p>
            </div>
            {generatedAt ? (
              <p className="text-xs text-muted-foreground">
                Generated {new Date(generatedAt).toLocaleString()}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Dimensions */}
      {analysis.dimensions.length ? (
        <Card>
          <CardHeader>
            <CardTitle>What went into the score</CardTitle>
            <CardDescription>
              Each dimension scored separately, so you can see which one is dragging.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            {analysis.dimensions.map((dimension) => (
              <div key={dimension.name} className="space-y-2">
                <ScoreBar name={dimension.name} score={dimension.score} />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {dimension.summary}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {/* Skills, two columns */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Evidenced in your resume</CardTitle>
            <CardDescription>
              Requirements your document actually supports. Open one to see the line
              it was read from.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysis.matchedSkills.length ? (
              <div className="-mt-2">
                {analysis.matchedSkills.map((skill) => (
                  <Disclosure
                    key={skill.skill}
                    summary={
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{skill.skill}</span>
                        <Badge tone={skill.strength === "strong" ? "positive" : "caution"}>
                          {skill.strength === "strong" ? "Demonstrated" : "Mentioned"}
                        </Badge>
                      </span>
                    }
                  >
                    <div className="flex gap-2 rounded-lg bg-surface-sunken p-3">
                      <Quote className="mt-0.5 size-3.5 shrink-0 opacity-60" aria-hidden />
                      <p className="italic">{skill.evidence}</p>
                    </div>
                  </Disclosure>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                The model found nothing in your resume that clearly evidences this
                posting&apos;s requirements. That usually means the wrong file was
                uploaded, or the posting is for a different field.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asked for, not evident</CardTitle>
            <CardDescription>
              Gaps to develop or to evidence better — not things to claim.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysis.missingSkills.length ? (
              <div className="-mt-2">
                {analysis.missingSkills.map((skill) => (
                  <Disclosure
                    key={skill.skill}
                    summary={
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{skill.skill}</span>
                        <Badge tone={importanceTone[skill.importance]}>
                          {skill.importance}
                        </Badge>
                      </span>
                    }
                  >
                    <div className="space-y-2">
                      <p>{skill.note}</p>
                      <p className="rounded-lg bg-surface-sunken p-3">
                        <span className="font-medium text-foreground">
                          Closest thing on your resume:{" "}
                        </span>
                        {skill.closestExperience}
                      </p>
                    </div>
                  </Disclosure>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nothing in the posting was flagged as missing. Read the alignment
                section below for the finer-grained view.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Experience alignment */}
      {analysis.experienceAlignment.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Requirement by requirement</CardTitle>
            <CardDescription>
              How each stated requirement reads against your experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.experienceAlignment.map((item) => {
              const meta = statusMeta[item.status];
              return (
                <div
                  key={item.requirement}
                  className="flex gap-3 rounded-lg border border-border-subtle p-4"
                >
                  <meta.Icon
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      item.status === "met" && "text-positive",
                      item.status === "partial" && "text-caution",
                      item.status === "not-evident" && "text-negative",
                    )}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{item.requirement}</p>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      {/* Action plan */}
      {analysis.actionPlan.length ? (
        <Card className="border-secondary/30">
          <CardHeader>
            <CardTitle>Do these first</CardTitle>
            <CardDescription>
              Ordered by how much each one would change how this application reads.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {analysis.actionPlan.map((item, index) => (
                <li
                  key={item.step}
                  className="flex gap-3 rounded-lg bg-surface-sunken p-4"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-sm font-semibold text-on-secondary">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-medium">{item.step}</p>
                    <p className="text-sm text-muted-foreground">{item.why}</p>
                    <Badge tone="info">{effortLabel[item.effort] ?? item.effort}</Badge>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      ) : null}

      {/* Resume suggestions */}
      {analysis.resumeSuggestions.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Changes to the document</CardTitle>
            <CardDescription>
              Structure, emphasis and clarity. Bullet-level rewrites live in the Draft
              tab.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="-mt-2">
              {analysis.resumeSuggestions.map((suggestion) => (
                <Disclosure
                  key={suggestion.title}
                  summary={
                    <span className="flex flex-wrap items-center gap-2">
                      <Badge tone={priorityTone[suggestion.priority]}>
                        {suggestion.priority}
                      </Badge>
                      <span className="font-medium">{suggestion.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {suggestion.area}
                      </span>
                    </span>
                  }
                >
                  {suggestion.detail}
                </Disclosure>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Keywords + interview */}
      <div className="grid gap-6 lg:grid-cols-2">
        {analysis.keywords.length ? (
          <Card>
            <CardHeader>
              <CardTitle>Language from the posting</CardTitle>
              <CardDescription>
                Terms worth using — only where they are true of your work.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.map((keyword) => (
                  <Badge
                    key={keyword.keyword}
                    tone={keyword.presentInResume ? "positive" : "neutral"}
                    title={keyword.guidance}
                  >
                    {keyword.keyword}
                  </Badge>
                ))}
              </div>
              <div className="-mt-2">
                {analysis.keywords
                  .filter((keyword) => !keyword.presentInResume)
                  .map((keyword) => (
                    <Disclosure
                      key={keyword.keyword}
                      summary={
                        <span className="text-sm">
                          Where could <strong>{keyword.keyword}</strong> go?
                        </span>
                      }
                    >
                      {keyword.guidance}
                    </Disclosure>
                  ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Green means the term is already in your resume. Adding a term you
                cannot back up in an interview costs more than it gains.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {analysis.interviewTopics.length ? (
          <Card>
            <CardHeader>
              <CardTitle>Prepare for these</CardTitle>
              <CardDescription>
                Drawn from where your experience and the posting meet — and where they
                do not.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="-mt-2">
                {analysis.interviewTopics.map((topic) => (
                  <Disclosure
                    key={topic.topic}
                    summary={<span className="font-medium">{topic.topic}</span>}
                  >
                    <div className="space-y-2">
                      <p>{topic.why}</p>
                      {topic.questions.length ? (
                        <ul className="list-disc space-y-1 pl-5">
                          {topic.questions.map((question) => (
                            <li key={question}>{question}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </Disclosure>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Alert tone="info" title="Trying a different role?">
        <p>
          Paste another job description and run it again. Your resume stays loaded, so
          you can compare how the same document reads against several postings.
        </p>
        <Button size="sm" variant="outline" className="mt-3" onClick={onAnalyzeAnother}>
          <RotateCcw className="size-4" aria-hidden />
          Analyze another job description
        </Button>
      </Alert>
    </div>
  );
}
