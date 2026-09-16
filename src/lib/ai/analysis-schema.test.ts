import { describe, expect, it } from "vitest";
import { analysisSchema, geminiAnalysisSchema } from "./analysis-schema";

/** A minimal object that satisfies the contract, used as a base for mutation. */
const valid = {
  roleTitle: "Backend Engineer",
  overallScore: 72,
  scoreLabel: "Strong alignment",
  scoreRationale: "Most core requirements are evidenced.",
  dimensions: [{ name: "Skills", score: 80, summary: "Go and TypeScript are shown." }],
  matchedSkills: [{ skill: "Go", strength: "strong", evidence: "Built a service in Go" }],
  missingSkills: [
    {
      skill: "Kubernetes",
      importance: "critical",
      note: "Named as the deployment target.",
      closestExperience: "No related experience found",
    },
  ],
  experienceAlignment: [
    { requirement: "5+ years", status: "partial", explanation: "About four years." },
  ],
  resumeSuggestions: [
    { area: "Summary", title: "Lead with payments", detail: "Move it up.", priority: "high" },
  ],
  bulletRewrites: [
    { section: "Experience", original: "Did a thing", suggested: "Did the thing", rationale: "Clearer." },
  ],
  keywords: [{ keyword: "Go", presentInResume: true, guidance: "Already used." }],
  interviewTopics: [{ topic: "Reconciliation", why: "Closest match.", questions: ["How?"] }],
  actionPlan: [{ step: "Rewrite the summary", why: "Biggest gain.", effort: "quick" }],
};

describe("analysisSchema", () => {
  it("accepts a well-formed analysis", () => {
    expect(analysisSchema.parse(valid).overallScore).toBe(72);
  });

  it("rejects a score outside 0-100", () => {
    expect(() => analysisSchema.parse({ ...valid, overallScore: 140 })).toThrow();
  });

  it("rejects an unknown evidence strength", () => {
    const bad = { ...valid, matchedSkills: [{ ...valid.matchedSkills[0], strength: "definite" }] };
    expect(() => analysisSchema.parse(bad)).toThrow();
  });

  it("rejects an unknown requirement status", () => {
    const bad = {
      ...valid,
      experienceAlignment: [{ ...valid.experienceAlignment[0], status: "maybe" }],
    };
    expect(() => analysisSchema.parse(bad)).toThrow();
  });

  it("requires every top-level section, even when empty", () => {
    const withoutPlan: Record<string, unknown> = { ...valid };
    delete withoutPlan.actionPlan;
    expect(() => analysisSchema.parse(withoutPlan)).toThrow();
  });

  it("accepts empty arrays, since a section can legitimately have no findings", () => {
    const empty = { ...valid, bulletRewrites: [], missingSkills: [] };
    expect(analysisSchema.parse(empty).bulletRewrites).toEqual([]);
  });

  it("rejects a keyword flag that is not a boolean", () => {
    const bad = { ...valid, keywords: [{ ...valid.keywords[0], presentInResume: "yes" }] };
    expect(() => analysisSchema.parse(bad)).toThrow();
  });
});

describe("geminiAnalysisSchema", () => {
  it("declares every field the Zod schema requires", () => {
    const zodKeys = Object.keys(analysisSchema.shape).sort();
    expect([...geminiAnalysisSchema.required].sort()).toEqual(zodKeys);
    expect(Object.keys(geminiAnalysisSchema.properties).sort()).toEqual(zodKeys);
  });

  it("uses only the OpenAPI subset Gemini accepts", () => {
    // Unions, $schema and additionalProperties are all rejected by the API.
    const serialised = JSON.stringify(geminiAnalysisSchema);
    expect(serialised).not.toContain("$schema");
    expect(serialised).not.toContain("additionalProperties");
    expect(serialised).not.toContain("anyOf");
    expect(serialised).not.toContain("oneOf");
  });
});
