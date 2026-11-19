import { createFileRoute, Link } from "@tanstack/react-router";

import { BlogLayout } from "@/components/BlogLayout";
import { POSTS, formatDate } from "@/lib/blog";

const SITE_URL = "https://tunuevavida.eu";
const TITLE = "Blog sobre crisis profesional y reinvención | Tu nueva vida";
const DESCRIPTION =
  "Artículos para cuando tu trabajo ya no encaja: crisis de los 40, reinventarse a los 50, cómo decidir a qué dedicarte y cómo cambiar sin saltar al vacío.";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/blog` },
      { property: "og:image", content: `${SITE_URL}/og-image.jpg` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/blog` }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <BlogLayout>
      <section className="landing-hero-bg px-5 pt-16 pb-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            El blog de Tu nueva vida
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Para cuando tu trabajo ya no encaja y todavía no sabes qué viene después.
          </p>
        </div>
      </section>
      <main className="px-5 py-12">
        <div className="mx-auto grid max-w-3xl gap-6">
          {POSTS.map((post) => (
            <article key={post.slug} className="landing-soft-card rounded-3xl p-7">
              <p className="text-xs text-muted-foreground">
                {formatDate(post.date)} · {post.readingMinutes} min de lectura
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                <Link to="/blog/$slug" params={{ slug: post.slug }} className="hover:underline">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{post.excerpt}</p>
              <Link
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="mt-4 inline-block text-sm font-semibold text-ember-strong hover:underline"
              >
                Leer el artículo
              </Link>
            </article>
          ))}
        </div>
      </main>
    </BlogLayout>
  );
}
