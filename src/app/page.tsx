import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    title: "Add your resume",
    body: "A PDF or DOCX. The text is extracted on the server and handed back to your browser; the file itself is never stored.",
  },
  {
    title: "Paste the job description",
    body: "The whole posting, requirements included. Swap in a different role later without re-uploading anything.",
  },
  {
    title: "Read the alignment",
    body: "Where the two line up, where they don't, and rewrites built only from experience already on the page.",
  },
];

const capabilities = [
  {
    title: "An estimate you can interrogate",
    body: "The score breaks into skills, experience, credentials and keywords, and every finding opens to show the resume line it was read from.",
  },
  {
    title: "Rewrites, not inventions",
    body: "Suggested bullets are rebuilt from what you already wrote. The model is instructed never to add a role, a certification or a number you did not provide.",
  },
  {
    title: "A prioritised list, not a wall of advice",
    body: "Findings are ordered by how much they would change the read, so you know what to fix in the ten minutes before you apply.",
  },
  {
    title: "An assistant that has read both documents",
    body: "Ask which projects to lead with, or to tighten one bullet. It answers against your resume and the role in front of you.",
  },
  {
    title: "Edit and export",
    body: "Accept what you like, edit it inline, export a revised draft as DOCX or PDF. The original upload is never modified.",
  },
  {
    title: "Nothing kept afterwards",
    body: "No account and no database. The session lives in your browser tab and clearing it removes everything.",
  },
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="border-b border-border-subtle">
          <div className="container-app grid gap-x-16 gap-y-12 py-20 lg:grid-cols-12 lg:py-28">
            <div className="space-y-8 lg:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Resume-to-job analysis
              </p>
              <h1 className="max-w-3xl font-display text-[2.5rem] font-bold leading-[1.08] sm:text-5xl lg:text-[3.5rem]">
                See how your resume reads against the job.
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                Upload a resume, paste a job description, and get a specific read on
                where they align, what the posting asks for that your resume
                doesn&apos;t show, and how to say what you&apos;ve actually done more
                clearly.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg">
                  <Link href="/analyze">
                    Analyze my resume
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
                <Link
                  href="#how-it-works"
                  className="rounded-sm px-1 py-2 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline sm:px-3"
                >
                  How it works
                </Link>
              </div>
            </div>

            {/* Specification panel. Plain facts about the tool — no invented
                metrics, no testimonials, nothing that needs a citation. */}
            <dl className="divide-y divide-border-subtle self-end border-t border-border-subtle text-sm lg:col-span-5">
              {[
                ["Accepts", "PDF and DOCX, up to 5 MB"],
                ["Model", "Google Gemini, free tier"],
                ["Account", "Not required"],
                ["Stored files", "None"],
                ["Session data", "Your browser tab only"],
              ].map(([term, value]) => (
                <div key={term} className="flex items-baseline justify-between gap-6 py-3.5">
                  <dt className="text-muted-foreground">{term}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="scroll-mt-16 border-b border-border-subtle py-20"
        >
          <div className="container-app grid gap-x-16 gap-y-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                Three steps, about two minutes
              </h2>
            </div>
            <ol className="divide-y divide-border-subtle border-t border-border-subtle lg:col-span-8">
              {steps.map((step, index) => (
                <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-4 py-6">
                  <span className="font-display text-sm font-semibold tabular-nums text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="space-y-1.5">
                    <h3 className="font-display text-lg font-semibold">{step.title}</h3>
                    <p className="max-w-xl leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Capabilities */}
        <section className="border-b border-border-subtle py-20">
          <div className="container-app space-y-12">
            <div className="max-w-2xl space-y-4">
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                Built to be specific
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Generic resume advice is easy to find. This tool only tells you things
                that depend on your document and this posting.
              </p>
            </div>
            <div className="grid gap-x-16 border-t border-border-subtle sm:grid-cols-2">
              {capabilities.map((capability) => (
                <div
                  key={capability.title}
                  className="space-y-2 border-b border-border-subtle py-7"
                >
                  <h3 className="font-display text-base font-semibold">
                    {capability.title}
                  </h3>
                  <p className="max-w-md leading-relaxed text-muted-foreground">
                    {capability.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What the score is not */}
        <section className="border-b border-border-subtle py-20">
          <div className="container-app grid gap-x-16 gap-y-6 lg:grid-cols-12">
            <h2 className="font-display text-2xl font-bold sm:text-3xl lg:col-span-4">
              What the score is, and is not
            </h2>
            <div className="space-y-4 text-muted-foreground lg:col-span-8">
              <p className="leading-relaxed">
                The number is one language model&apos;s estimate of how well your resume{" "}
                <em className="not-italic text-foreground">evidences</em> a posting&apos;s
                stated requirements. It is not a probability of being hired, no employer
                sees it, and it carries the biases of the model that produced it.
              </p>
              <p className="leading-relaxed">
                It is most useful as a comparison: run the same resume against two
                postings, and the difference between the scores tells you more than
                either number on its own.
              </p>
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className="py-20">
          <div className="container-app flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold">Ready when you are</h2>
              <p className="text-muted-foreground">
                Bring the posting you&apos;re about to apply for.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/analyze">
                Start an analysis
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
