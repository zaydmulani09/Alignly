import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  FileText,
  Highlighter,
  ListChecks,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import Link from "next/link";

const steps = [
  {
    icon: FileText,
    title: "Add your resume",
    body: "Drop in a PDF or DOCX. The text is pulled out on our server and handed straight back to your browser — the file itself is never stored.",
  },
  {
    icon: Target,
    title: "Paste the job description",
    body: "The whole posting, responsibilities and requirements included. You can swap in a different role later without re-uploading anything.",
  },
  {
    icon: Sparkles,
    title: "Read the alignment",
    body: "Where the two line up, where they don't, and concrete rewrites built only from experience already on your resume.",
  },
];

const features = [
  {
    icon: Target,
    title: "An estimate you can interrogate",
    body: "The match score breaks into skills, experience, education and keywords, and every finding opens up to show the reasoning behind it.",
  },
  {
    icon: Highlighter,
    title: "Rewrites, not inventions",
    body: "Suggested bullet points are rebuilt from what you already wrote. The model is instructed never to add a job, a certification or a number you did not provide.",
  },
  {
    icon: ListChecks,
    title: "A prioritised list, not a wall of advice",
    body: "Findings are ordered by how much they would change the read, so you know what to fix in the ten minutes before you apply.",
  },
  {
    icon: MessagesSquare,
    title: "An assistant that has read both documents",
    body: "Ask it which projects to lead with, or to tighten a specific bullet. It answers against your actual resume and the role in front of you.",
  },
  {
    icon: FileText,
    title: "Edit and export",
    body: "Accept the suggestions you like, edit them inline, and export a revised draft as DOCX or PDF. Your original upload is never touched.",
  },
  {
    icon: ShieldCheck,
    title: "Nothing kept afterwards",
    body: "No account, no database. Your session lives in your browser and clearing it removes everything, including the analysis.",
  },
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border-subtle">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-secondary/8 to-transparent"
          />
          <div className="container-app relative grid gap-12 py-16 sm:py-24 lg:grid-cols-[1.05fr_1fr] lg:items-center">
            <div className="space-y-7">
              <Badge tone="info" className="px-3">
                <Sparkles className="size-3.5" aria-hidden />
                Powered by Google Gemini
              </Badge>
              <h1 className="font-display text-4xl font-extrabold sm:text-5xl lg:text-6xl">
                See how your resume reads{" "}
                <span className="text-secondary">against the job</span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                Upload a resume, paste a job description, and get a specific read on
                where they align, what the posting asks for that your resume
                doesn&apos;t show, and how to say what you&apos;ve actually done more
                clearly.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/analyze">
                    Analyze my resume
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="#how-it-works">See how it works</Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                No account. No stored files. Works with PDF and DOCX.
              </p>
            </div>

            {/* Illustration of the results view. Static sample content: not a real
                analysis, and not anyone's real resume. */}
            <div aria-hidden className="relative lg:pl-4">
              <Card className="overflow-hidden shadow-xl shadow-slate-900/10">
                <div className="flex items-center gap-2 border-b border-border-subtle bg-surface-sunken px-4 py-3">
                  <span className="size-2.5 rounded-full bg-border" />
                  <span className="size-2.5 rounded-full bg-border" />
                  <span className="size-2.5 rounded-full bg-border" />
                  <span className="ml-2 text-xs text-muted-foreground">
                    Illustration of the results view
                  </span>
                </div>
                <CardContent className="space-y-5 p-5 pt-5 sm:p-6 sm:pt-6">
                  <div className="flex items-center gap-5">
                    <div className="grid size-20 shrink-0 place-items-center rounded-full bg-secondary/15">
                      <div className="grid size-15 place-items-center rounded-full bg-surface">
                        <span className="font-display text-xl font-bold">74</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="font-display font-semibold">Strong alignment</p>
                      <p className="text-sm text-muted-foreground">
                        Estimated by the model, not a hiring probability
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      ["Demonstrated", "TypeScript, React, REST APIs", "positive"],
                      ["Thinly evidenced", "Team leadership", "caution"],
                      ["Not found", "Kubernetes, Terraform", "negative"],
                    ].map(([label, value, tone]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-3 rounded-lg bg-surface-sunken px-3 py-2.5"
                      >
                        <Badge tone={tone as "positive"}>{label}</Badge>
                        <span className="truncate text-sm text-muted-foreground">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="scroll-mt-20 border-b border-border-subtle py-16 sm:py-20"
        >
          <div className="container-app">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Three steps, about two minutes
            </h2>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {steps.map(({ icon: Icon, title, body }, i) => (
                <li key={title}>
                  <Card className="h-full">
                    <CardContent className="space-y-3 p-6 pt-6">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-lg bg-secondary/10 text-secondary">
                          <Icon className="size-5" aria-hidden />
                        </span>
                        <span className="font-display text-sm font-semibold text-muted-foreground">
                          Step {i + 1}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-semibold">{title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {body}
                      </p>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 sm:py-20">
          <div className="container-app">
            <div className="max-w-2xl space-y-4">
              <h2 className="font-display text-3xl font-bold sm:text-4xl">
                Built to be specific
              </h2>
              <p className="text-lg text-muted-foreground">
                Generic resume advice is easy to find. This tool only tells you things
                that depend on your document and this posting.
              </p>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, body }) => (
                <Card key={title} className="h-full">
                  <CardContent className="space-y-3 p-6 pt-6">
                    <Icon className="size-5 text-secondary" aria-hidden />
                    <h3 className="font-display text-base font-semibold">{title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {body}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="border-t border-border-subtle bg-surface py-16">
          <div className="container-app flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                Ready when you are
              </h2>
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
