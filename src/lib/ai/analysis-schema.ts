import { z } from "zod";

/**
 * The shape of an analysis. This file is the single source of truth: the Zod
 * schema validates whatever the model returns, and `geminiAnalysisSchema` below
 * is the same contract expressed in the OpenAPI subset Gemini accepts for
 * structured output. If you change one, change the other.
 */

export const evidenceStrength = z.enum(["strong", "moderate"]);
export const importance = z.enum(["critical", "important", "nice-to-have"]);
export const requirementStatus = z.enum(["met", "partial", "not-evident"]);
export const priority = z.enum(["high", "medium", "low"]);
export const effort = z.enum(["quick", "moderate", "substantial"]);

export const analysisSchema = z.object({
  roleTitle: z.string().max(160),
  overallScore: z.number().min(0).max(100),
  scoreLabel: z.string().max(60),
  scoreRationale: z.string().max(1200),

  dimensions: z
    .array(
      z.object({
        name: z.string().max(60),
        score: z.number().min(0).max(100),
        summary: z.string().max(600),
      }),
    )
    .max(6),

  matchedSkills: z
    .array(
      z.object({
        skill: z.string().max(80),
        strength: evidenceStrength,
        // Must be traceable to the resume: this is quoted back in the UI.
        evidence: z.string().max(600),
      }),
    )
    .max(20),

  missingSkills: z
    .array(
      z.object({
        skill: z.string().max(80),
        importance,
        note: z.string().max(600),
        closestExperience: z.string().max(400),
      }),
    )
    .max(20),

  experienceAlignment: z
    .array(
      z.object({
        requirement: z.string().max(300),
        status: requirementStatus,
        explanation: z.string().max(800),
      }),
    )
    .max(15),

  resumeSuggestions: z
    .array(
      z.object({
        area: z.string().max(80),
        title: z.string().max(160),
        detail: z.string().max(900),
        priority,
      }),
    )
    .max(12),

  bulletRewrites: z
    .array(
      z.object({
        section: z.string().max(120),
        original: z.string().max(600),
        suggested: z.string().max(600),
        rationale: z.string().max(600),
      }),
    )
    .max(10),

  keywords: z
    .array(
      z.object({
        keyword: z.string().max(60),
        presentInResume: z.boolean(),
        guidance: z.string().max(400),
      }),
    )
    .max(25),

  interviewTopics: z
    .array(
      z.object({
        topic: z.string().max(120),
        why: z.string().max(500),
        questions: z.array(z.string().max(300)).max(4),
      }),
    )
    .max(8),

  actionPlan: z
    .array(
      z.object({
        step: z.string().max(240),
        why: z.string().max(500),
        effort,
      }),
    )
    .max(8),
});

export type Analysis = z.infer<typeof analysisSchema>;
export type MatchedSkill = Analysis["matchedSkills"][number];
export type MissingSkill = Analysis["missingSkills"][number];
export type BulletRewrite = Analysis["bulletRewrites"][number];

const str = (description: string) => ({ type: "STRING", description });
const enumOf = (values: readonly string[], description: string) => ({
  type: "STRING",
  enum: [...values],
  description,
});

/** Gemini `responseSchema` — OpenAPI 3.0 subset, so no $schema and no unions. */
export const geminiAnalysisSchema = {
  type: "OBJECT",
  properties: {
    roleTitle: str("The job title from the posting, verbatim if stated."),
    overallScore: {
      type: "INTEGER",
      description:
        "0-100 estimate of how well the resume evidences this posting's requirements. Not a hiring probability.",
    },
    scoreLabel: str(
      "Two or three words characterising the score, e.g. 'Strong alignment'.",
    ),
    scoreRationale: str(
      "Two to four sentences explaining what the score measures and what drove it.",
    ),
    dimensions: {
      type: "ARRAY",
      description:
        "Exactly four entries, named: Skills, Experience, Education & credentials, Keywords.",
      items: {
        type: "OBJECT",
        properties: {
          name: str("Dimension name."),
          score: { type: "INTEGER", description: "0-100 for this dimension." },
          summary: str("One or two sentences on this dimension."),
        },
        required: ["name", "score", "summary"],
      },
    },
    matchedSkills: {
      type: "ARRAY",
      description: "Requirements the resume genuinely evidences.",
      items: {
        type: "OBJECT",
        properties: {
          skill: str("The skill or requirement."),
          strength: enumOf(
            ["strong", "moderate"],
            "strong when the resume shows it applied in context; moderate when it is only listed or implied.",
          ),
          evidence: str(
            "Quote or closely paraphrase the resume line that supports this. Never invent evidence.",
          ),
        },
        required: ["skill", "strength", "evidence"],
      },
    },
    missingSkills: {
      type: "ARRAY",
      description:
        "Requirements in the posting with no clear support in the resume. These are gaps to develop or evidence, never things to claim.",
      items: {
        type: "OBJECT",
        properties: {
          skill: str("The requirement that is not evidenced."),
          importance: enumOf(
            ["critical", "important", "nice-to-have"],
            "How central the posting makes this requirement.",
          ),
          note: str("Why it matters for this role and what would count as evidence."),
          closestExperience: str(
            "The nearest genuinely related thing on the resume, or the exact string 'No related experience found' when there is none. Do not stretch.",
          ),
        },
        required: ["skill", "importance", "note", "closestExperience"],
      },
    },
    experienceAlignment: {
      type: "ARRAY",
      description: "Per-requirement read on experience, seniority and qualifications.",
      items: {
        type: "OBJECT",
        properties: {
          requirement: str("The stated requirement, e.g. '5+ years backend'."),
          status: enumOf(
            ["met", "partial", "not-evident"],
            "met, partial, or not-evident based only on what the resume shows.",
          ),
          explanation: str("What in the resume supports this judgement."),
        },
        required: ["requirement", "status", "explanation"],
      },
    },
    resumeSuggestions: {
      type: "ARRAY",
      description: "Changes to the document itself: structure, emphasis, clarity.",
      items: {
        type: "OBJECT",
        properties: {
          area: str("Which part of the resume, e.g. 'Summary', 'Projects'."),
          title: str("The suggestion in one line."),
          detail: str("How to carry it out, referring to their actual content."),
          priority: enumOf(["high", "medium", "low"], "Impact on this application."),
        },
        required: ["area", "title", "detail", "priority"],
      },
    },
    bulletRewrites: {
      type: "ARRAY",
      description:
        "Rewrites of existing bullet points. `original` MUST be copied verbatim from the resume. The rewrite may only reorganise, sharpen or surface what is already there.",
      items: {
        type: "OBJECT",
        properties: {
          section: str("Where this bullet lives, e.g. 'Experience - Acme Corp'."),
          original: str("The bullet exactly as it appears in the resume."),
          suggested: str(
            "The rewrite. No invented metrics, tools, scope or outcomes. If the original lacks a number, do not add one; ask for it in the rationale instead.",
          ),
          rationale: str("Why this reads better for this posting."),
        },
        required: ["section", "original", "suggested", "rationale"],
      },
    },
    keywords: {
      type: "ARRAY",
      description:
        "Terms from the posting worth using, each flagged by whether the resume already contains it.",
      items: {
        type: "OBJECT",
        properties: {
          keyword: str("The term."),
          presentInResume: {
            type: "BOOLEAN",
            description: "True only if the resume already uses it.",
          },
          guidance: str(
            "Where it could truthfully go, or 'Only use if you have done this' when it is not supported.",
          ),
        },
        required: ["keyword", "presentInResume", "guidance"],
      },
    },
    interviewTopics: {
      type: "ARRAY",
      description: "What to prepare, drawn from the overlap and the gaps.",
      items: {
        type: "OBJECT",
        properties: {
          topic: str("The topic."),
          why: str("Why this is likely to come up for this pairing."),
          questions: {
            type: "ARRAY",
            description: "Up to four questions they should be ready for.",
            items: { type: "STRING" },
          },
        },
        required: ["topic", "why", "questions"],
      },
    },
    actionPlan: {
      type: "ARRAY",
      description:
        "Three to six steps, ordered by how much they would change this application.",
      items: {
        type: "OBJECT",
        properties: {
          step: str("What to do, concretely."),
          why: str("The difference it makes."),
          effort: enumOf(
            ["quick", "moderate", "substantial"],
            "quick is under ten minutes; substantial means learning or building something new.",
          ),
        },
        required: ["step", "why", "effort"],
      },
    },
  },
  required: [
    "roleTitle",
    "overallScore",
    "scoreLabel",
    "scoreRationale",
    "dimensions",
    "matchedSkills",
    "missingSkills",
    "experienceAlignment",
    "resumeSuggestions",
    "bulletRewrites",
    "keywords",
    "interviewTopics",
    "actionPlan",
  ],
} as const;
