# Alignly — resume-to-job matcher

Upload a resume, paste a job description, and get a specific read on how the two line
up: what the resume evidences, what the posting asks for that it doesn't show, which
bullets to rewrite, and what to prepare for an interview. Everything the model says is
tied back to text that is actually in the document — it rewrites, it never invents.

- **Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Vitest
- **AI provider:** Google Gemini (free tier), called server-side with structured JSON output
- **Deploys to:** Vercel, with no database and no authentication

---

## Quick start

```bash
npm install
cp .env.example .env.local   # then paste your key into GEMINI_API_KEY
npm run dev
```

Open <http://localhost:3000>.

The app runs **without** an API key: upload, text extraction, the draft editor and both
exports all work, and the AI features report themselves as unconfigured rather than
failing at the point of use.

### Getting a Gemini key

1. Go to <https://aistudio.google.com/apikey> and create a key (free, no billing needed).
2. Put it in `.env.local` as `GEMINI_API_KEY=...`.
3. Restart `npm run dev`.

Free-tier Flash models are rate-limited per minute and per day, and the newest ones
return 503 "high demand" fairly often. If a model is unavailable the app falls through to
the next verified one automatically; if the quota is genuinely exhausted it says so
specifically rather than showing a generic failure.

`gemini-3.8-flash` and `gemini-3.7-flash` were both overloaded when this was tested, which
is why the default is `gemini-3.5-flash`. The `gemini-2.5-*` models are advertised by the
models list but return 404 on `generateContent` with this schema, so they are not offered.

---

## Environment variables

| Variable | Required | Default | What it does |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | For AI features | — | Server-side key for the Gemini API. Never exposed to the browser. |
| `GEMINI_MODEL` | No | `gemini-3.5-flash` | Overrides the model. Verified free-tier options for structured output: `gemini-3.5-flash`, `gemini-3.6-flash`, `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`. |
| `AI_RATE_LIMIT_PER_MINUTE` | No | `10` | Requests per IP per minute against `/api/analyze` and `/api/chat`. |
| `GEMINI_BASE_URL` | No | Google's endpoint | Points the client at a stand-in. Used only for local testing (see below). |
| `NEXT_PUBLIC_SITE_URL` | No | `https://alignly.vercel.app` | Canonical URL for social metadata and the sitemap. |

`.env.example` holds placeholders only. `.env.local` is gitignored; no key should ever
be committed.

---

## How it fits together

```
src/
  app/
    page.tsx                  landing page
    privacy/                  what happens to your data, in plain terms
    analyze/                  the workspace (session provider + tabs)
    api/
      extract/                PDF & DOCX -> text (Node runtime)
      analyze/                resume + posting -> structured analysis
      chat/                   assistant turns
      status/                 "is a key configured?" for honest UI states
  components/
    ui/                       Button, Card, Badge, Textarea, Alert, Disclosure…
    layout/                   header, footer, wordmark
    workspace/                upload, job description, tabs, assistant, draft editor
    results/                  score visualisation and the dashboard
  middleware.ts             per-request CSP nonce
  lib/
    ai/                       Gemini client, prompts, analysis contract
    extract/                  file sniffing and text normalisation
    export/                   draft assembly, DOCX and PDF export
    session/                  browser-session state
    rate-limit.ts             per-IP fixed window
```

### Data flow

1. The file is posted to `/api/extract`, parsed **in memory** with `unpdf` or `mammoth`,
   and discarded. Only the extracted text comes back.
2. That text lives in `sessionStorage` — surviving a refresh, gone when the tab closes.
3. Nothing reaches Google until the user presses **Analyze** or sends a chat message.
4. `/api/analyze` asks Gemini for structured JSON, then re-validates the reply against
   the same Zod contract before the UI sees it.

### Design

The visual language came from the **UI/UX Pro Max** skill, installed project-locally.
See [`docs/design-system.md`](docs/design-system.md) for what it recommended, what was
adapted and why. To restore the skill locally:

```bash
npx ui-ux-pro-max-cli init --ai claude
```

### Testing the AI routes without a key

`scripts/gemini-stub.mjs` stands in for the Gemini API so the analyze and chat
routes can be driven end to end — including the failure paths, which are otherwise
hard to reach on purpose.

```bash
node scripts/gemini-stub.mjs ok        # or: quota | badkey | garbage
```

Then run the app with:

```
GEMINI_API_KEY=stub
GEMINI_BASE_URL=http://localhost:4010/models
```

---

## Scripts

```bash
npm run dev         # development server
npm run build       # production build
npm run start       # serve the production build
npm test            # unit tests (vitest)
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
```

---

## Deploying to Vercel

1. Push this branch and open a PR, or push to your default branch.
2. In Vercel, **Add New → Project** and import the repository. The framework is detected
   as Next.js; no build settings need changing.
3. Under **Settings → Environment Variables**, add `GEMINI_API_KEY` (and optionally
   `GEMINI_MODEL`, `AI_RATE_LIMIT_PER_MINUTE`) for Production, Preview and Development.
4. Deploy. The API routes become serverless functions automatically; `/api/analyze` and
   `/api/chat` declare a 60-second `maxDuration` and `/api/extract` 30 seconds, which
   fits Vercel's limits on the Hobby plan.

If you deploy without the key, the site still builds and serves — the workspace simply
shows that AI analysis is unconfigured.

---

## Known limitations

- **Scanned PDFs don't work.** There is no OCR; a PDF with no text layer is rejected with
  an explanation rather than silently producing nothing.
- **Formatting is not preserved.** Extraction yields plain text, so exports carry content,
  not your original layout. The draft is meant to be pasted back into your own template.
- **Rate limiting is per serverless instance.** Module memory is not shared between Vercel
  instances, so the limit throttles a runaway client but is not a distributed guarantee.
  Swapping in Vercel KV or Upstash behind `lib/rate-limit.ts` is the upgrade path.
- **Bullet matching is line-based.** A bullet that wraps across two lines in the source PDF
  may not be auto-placed; the draft view lists any such rewrite for manual pasting instead
  of guessing.
- **Free-tier prompts may be used by Google** to improve its products. That is Google's
  policy, not this app's behaviour, and it is stated on the privacy page.
- **The score is an estimate.** It reflects how well the resume evidences the posting, as
  judged by one model. It is not a hiring probability.
- **Pages render dynamically.** The CSP issues a nonce per request, which means pages are
  server-rendered rather than statically cached. That is the cost of a strict script policy
  on this framework, and it was chosen deliberately over `'unsafe-inline'`.
- **Analysis takes 25-30 seconds** on `gemini-3.5-flash` for a one-page resume. That is the
  model, not the app; the UI says so while it waits.

---

## Recent improvements

**v1.1.0 – Better insights and UX**
- Likelihood gauge showing estimated chance of getting the job
- Skill gap visualization with coverage percentage
- Interview prep section with expandable topic cards
- Keyword density chart showing which job keywords are in your resume
- Score breakdown showing benchmarks and ideal range
- Experience alignment checklist with status indicators
- Analysis history tracking across session
- Print-friendly styles for saving results
- Performance caching to reduce API calls
- Better error messages with actionable advice
