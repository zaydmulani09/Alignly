/**
 * Local stand-in for the Gemini API, so the analyze and chat routes can be
 * exercised end to end without a key, a quota or a network round trip.
 *
 *   node scripts/gemini-stub.mjs [ok|quota|badkey|garbage]
 *
 * Then point the app at it:
 *   GEMINI_API_KEY=stub
 *   GEMINI_BASE_URL=http://localhost:4010/models
 *
 * The non-"ok" modes reproduce the provider failures the routes have to map to
 * user-facing messages: exhausted free-tier quota, a rejected key, and a reply
 * that is not the JSON the schema promised. The sample analysis below is
 * fixture data for that purpose only -- it is never served by the app.
 */
import { createServer } from "node:http";
const analysis = {
  roleTitle: "Backend Engineer, Payments", overallScore: 74, scoreLabel: "Strong alignment",
  scoreRationale: "Core backend requirements are evidenced; infrastructure tooling is not.",
  dimensions: [{ name: "Skills", score: 80, summary: "Go is shown in real work." }],
  matchedSkills: [{ skill: "Go", strength: "strong", evidence: "Built a payments reconciliation service in Go" }],
  missingSkills: [{ skill: "Kubernetes", importance: "critical", note: "Named as the deployment target.", closestExperience: "Docker appears in the skills list." }],
  experienceAlignment: [{ requirement: "5+ years", status: "partial", explanation: "About four years shown." }],
  resumeSuggestions: [{ area: "Summary", title: "Lead with reconciliation", detail: "Move it up.", priority: "high" }],
  bulletRewrites: [{ section: "Experience", original: "Migrated the billing API from REST to gRPC and cut p99 latency", suggested: "Migrated the billing API from REST to gRPC, reducing p99 latency", rationale: "Tighter. Add the real figure if you have it." }],
  keywords: [{ keyword: "Go", presentInResume: true, guidance: "Already used." }],
  interviewTopics: [{ topic: "Reconciliation", why: "Strongest overlap.", questions: ["How did you handle duplicates?"] }],
  actionPlan: [{ step: "Rewrite the summary", why: "Biggest gain.", effort: "quick" }],
};
const mode = process.argv[2] ?? "ok";
createServer((req, res) => {
  let body = ""; req.on("data", (c) => (body += c));
  req.on("end", () => {
    const parsed = JSON.parse(body || "{}");
    const structured = Boolean(parsed.generationConfig?.responseSchema);
    console.log(`[stub] ${req.url} structured=${structured} contents=${parsed.contents?.length}`);
    const send = (status, payload) => { res.writeHead(status, {"content-type":"application/json"}); res.end(JSON.stringify(payload)); };
    if (mode === "quota") return send(429, { error: { message: "Quota exceeded for quota metric PerDay" } });
    if (mode === "badkey") return send(400, { error: { message: "API key not valid. Please pass a valid API key." } });
    if (mode === "garbage") return send(200, { candidates: [{ content: { parts: [{ text: "not json at all" }] } }] });
    const text = structured ? JSON.stringify(analysis) : "Lead with the reconciliation service: it is the closest thing you have to what they are asking for.";
    send(200, { candidates: [{ content: { parts: [{ text }] }, finishReason: "STOP" }] });
  });
}).listen(4010, () => console.log("[stub] listening on 4010"));
