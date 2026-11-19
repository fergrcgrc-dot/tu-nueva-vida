/**
 * Artículos del blog: archivos Markdown en src/content/blog/*.md con una
 * cabecera sencilla (clave: valor) entre líneas «---». Se leen en tiempo de
 * compilación, sin base de datos.
 */
const files = import.meta.glob("../content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export type BlogPost = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  date: string;
  updated: string;
  keywords: string[];
  excerpt: string;
  body: string;
  readingMinutes: number;
  faq: Array<{ q: string; a: string }>;
};

function parse(path: string, raw: string): BlogPost {
  const slug = path.split("/").pop()!.replace(/\.md$/, "");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`Artículo sin cabecera: ${slug}`);
  const meta: Record<string, string> = {};
  for (const line of match[1]!.split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  const body = match[2]!.trim();
  const words = body.split(/\s+/).length;

  // Preguntas frecuentes: «### Pregunta» bajo «## Preguntas frecuentes».
  const faq: Array<{ q: string; a: string }> = [];
  const faqSection = body.split(/^## Preguntas frecuentes.*$/m)[1];
  if (faqSection) {
    const block = faqSection.split(/^## /m)[0] ?? "";
    for (const part of block.split(/^### /m).slice(1)) {
      const [q, ...rest] = part.split("\n");
      const a = rest
        .join("\n")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .trim();
      if (q && a) faq.push({ q: q.trim(), a });
    }
  }

  return {
    slug,
    title: meta["title"] ?? slug,
    seoTitle: meta["seoTitle"] ?? meta["title"] ?? slug,
    description: meta["description"] ?? "",
    date: meta["date"] ?? "",
    updated: meta["updated"] ?? meta["date"] ?? "",
    keywords: (meta["keywords"] ?? "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    excerpt: meta["excerpt"] ?? meta["description"] ?? "",
    body,
    readingMinutes: Math.max(1, Math.round(words / 220)),
    faq,
  };
}

export const POSTS: BlogPost[] = Object.entries(files)
  .map(([path, raw]) => parse(path, raw))
  .filter((p) => p.date)
  .sort((a, b) => b.date.localeCompare(a.date));

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
