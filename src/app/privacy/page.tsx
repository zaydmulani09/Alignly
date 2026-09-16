import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How your data is handled",
  description:
    "What happens to your resume when you use Alignly: what is sent where, what is kept, and what is not.",
};

const sections = [
  {
    heading: "Your resume file is never stored",
    body: [
      "When you upload a PDF or DOCX, it is sent to this application's own server, parsed in memory, and discarded as soon as the text has been extracted. There is no database, no object storage and no file system write. The response that carries the text back is marked no-store so it is not cached along the way.",
      "The extracted text then lives in your browser's sessionStorage. It survives a refresh; it does not survive closing the tab. Clear everything removes it immediately.",
    ],
  },
  {
    heading: "Text goes to Google only when you ask for it",
    body: [
      "Nothing is sent to an AI provider by uploading a file or pasting a posting. Your resume text and job description leave this application at exactly two moments: when you press Analyze, and when you send a message to the assistant. Both requests go to Google's Gemini API from this application's server, so your browser never holds an API key.",
      "Google's handling of that data is governed by its own terms. On the free tier of the Gemini API, Google states that prompts may be used to improve its products — if that matters to you, that is a reason to use a paid tier key or to remove identifying details from your resume before uploading.",
      "In the assistant, including the job description is a checkbox you control. Your resume text is always part of an assistant request, because the assistant cannot answer without it.",
    ],
  },
  {
    heading: "What is logged",
    body: [
      "Resume text, job descriptions, chat messages and API keys are never written to logs. Error paths are deliberately written not to echo request bodies, because provider error envelopes can contain the prompt — and the prompt contains your resume.",
      "The rate limiter keeps a request count per IP address in memory for sixty seconds at a time. Nothing is persisted.",
    ],
  },
  {
    heading: "No account, no tracking",
    body: [
      "There is no sign-up, no email collection and no analytics script. Nothing identifies you across sessions.",
    ],
  },
  {
    heading: "What the analysis is",
    body: [
      "The match score is one language model's estimate of how well your resume evidences a posting's stated requirements. It is not a hiring probability, no employer sees it, and it carries the biases of the model that produced it. Treat it as a second reader, not a verdict.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 py-16 sm:py-20">
        <div className="container-app max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Privacy
          </p>
          <h1 className="mt-6 font-display text-[2.25rem] font-bold leading-[1.1] sm:text-[2.75rem]">
            How your data is handled
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            A resume is a sensitive document. Here is exactly what happens to yours.
          </p>

          <div className="mt-12 divide-y divide-border-subtle border-t border-border-subtle">
            {sections.map((section) => (
              <section
                key={section.heading}
                className="grid gap-x-12 gap-y-4 py-9 sm:grid-cols-3"
              >
                <h2 className="font-display text-lg font-semibold sm:col-span-1">
                  {section.heading}
                </h2>
                <div className="space-y-4 sm:col-span-2">
                  {section.body.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 40)}
                      className="leading-relaxed text-muted-foreground"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
