import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { LegalLinks } from "@/components/LegalLinks";
import { Markdown } from "@/components/Markdown";
import { LEGAL, LEGAL_CONTENT, LEGAL_PAGES, type LegalSlug } from "@/lib/legal";

export const Route = createFileRoute("/legal/$slug")({
  loader: ({ params }) => {
    const page = LEGAL_PAGES.find((p) => p.slug === params.slug);
    if (!page) throw notFound();
    return { title: page.title, content: LEGAL_CONTENT[page.slug as LegalSlug] };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.title ?? "Legal"} — ${LEGAL.marca}` }],
  }),
  component: LegalPage,
});

function LegalPage() {
  const { title, content } = Route.useLoaderData();
  return (
    <div className="landing min-h-screen font-body">
      <header className="landing-hero-bg px-5 pt-10 pb-12">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> {LEGAL.marca}
          </Link>
          <h1 className="mt-8 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        </div>
      </header>
      <main className="px-5 py-12">
        <article className="mx-auto max-w-3xl [&_a]:text-ember [&_a]:underline [&_p]:leading-relaxed">
          <Markdown content={content} />
        </article>
      </main>
      <footer className="landing-footer-bg px-5 py-10">
        <div className="mx-auto max-w-3xl text-sm text-muted-foreground">
          <LegalLinks />
        </div>
      </footer>
    </div>
  );
}
