import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { BlogLayout } from "@/components/BlogLayout";
import { Markdown } from "@/components/Markdown";
import { ValuesTest } from "@/components/ValuesTest";
import { POSTS, formatDate, getPost } from "@/lib/blog";

const SITE_URL = "https://tunuevavida.eu";
/** Marcador en el Markdown donde se inserta el test interactivo de valores. */
const TOOL_MARKER = "<!-- herramienta:test-valores -->";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { slug: post.slug };
  },
  head: ({ loaderData }) => {
    const post = loaderData ? getPost(loaderData.slug) : undefined;
    if (!post) return {};
    const url = `${SITE_URL}/blog/${post.slug}`;
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          dateModified: post.updated,
          inLanguage: "es-ES",
          mainEntityOfPage: url,
          image: `${SITE_URL}/og-image.jpg`,
          keywords: post.keywords.join(", "),
          author: { "@type": "Organization", name: "Tu nueva vida", url: `${SITE_URL}/` },
          publisher: {
            "@type": "Organization",
            name: "Tu nueva vida",
            logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.svg` },
          },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
            { "@type": "ListItem", position: 3, name: post.title, item: url },
          ],
        },
        ...(post.faq.length
          ? [
              {
                "@type": "FAQPage",
                mainEntity: post.faq.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              },
            ]
          : []),
      ],
    };
    return {
      meta: [
        { title: post.seoTitle },
        { name: "description", content: post.description },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:image", content: `${SITE_URL}/og-image.jpg` },
        { property: "article:published_time", content: post.date },
        { property: "article:modified_time", content: post.updated },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useLoaderData();
  const post = getPost(slug)!;
  const related = POSTS.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <BlogLayout>
      <article>
        <header className="landing-hero-bg px-5 pt-12 pb-10">
          <div className="mx-auto max-w-2xl">
            <nav aria-label="Ruta" className="text-xs text-muted-foreground">
              <Link to="/" className="hover:underline">
                Inicio
              </Link>{" "}
              ›{" "}
              <Link to="/blog" className="hover:underline">
                Blog
              </Link>
            </nav>
            <h1 className="mt-5 text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
              {post.title}
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              {formatDate(post.date)} · {post.readingMinutes} min de lectura
            </p>
          </div>
        </header>
        <div className="px-5 py-10">
          <div className="blog-prose mx-auto max-w-2xl">
            {post.body.split(TOOL_MARKER).map((part, i) => (
              <div key={i}>
                {i > 0 && <ValuesTest />}
                <Markdown content={part} />
              </div>
            ))}
          </div>
        </div>
      </article>

      <aside className="px-5 pb-12">
        <div className="mx-auto max-w-2xl rounded-[2rem] bg-primary px-7 py-10 text-primary-foreground">
          <p className="text-2xl font-bold tracking-tight">
            Si te has reconocido en este artículo, el programa está hecho para ti
          </p>
          <p className="mt-3 text-primary-foreground/80">
            Ocho módulos con vídeo y ejercicios que revisa un coach IA. Sales con una dirección
            clara y un plan a 90 días. Pago único, acceso de por vida y 14 días de garantía.
          </p>
          <a
            href="/#modulos"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-card px-6 py-3 text-sm font-semibold text-card-foreground hover:opacity-90"
          >
            Ver los 8 módulos <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </aside>

      {related.length > 0 && (
        <section className="px-5 pb-20">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-xl font-bold tracking-tight">También te puede servir</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="landing-soft-card rounded-2xl p-5 transition-colors hover:border-primary/40"
                >
                  <p className="font-semibold">{p.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{p.readingMinutes} min</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </BlogLayout>
  );
}
