import { createFileRoute } from "@tanstack/react-router";

import { LEGAL_PAGES } from "@/lib/legal";

const SITE_URL = "https://tunuevavida.eu";
/** Actualiza esta fecha cuando cambie el contenido público. */
const LAST_MODIFIED = "2026-11-19";

/** Sitemap de las páginas públicas e indexables. */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const urls = [
          { loc: `${SITE_URL}/`, priority: "1.0", changefreq: "weekly" },
          ...LEGAL_PAGES.map((p) => ({
            loc: `${SITE_URL}/legal/${p.slug}`,
            priority: "0.2",
            changefreq: "yearly",
          })),
        ];
        const body =
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          urls
            .map(
              (u) =>
                `  <url><loc>${u.loc}</loc><lastmod>${LAST_MODIFIED}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`,
            )
            .join("\n") +
          `\n</urlset>\n`;
        return new Response(body, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
