import { Link } from "@tanstack/react-router";

import { LEGAL_PAGES } from "@/lib/legal";

/** Enlaces a las páginas legales, para pies de página. */
export function LegalLinks({ className = "" }: { className?: string }) {
  return (
    <nav aria-label="Información legal" className={`flex flex-wrap gap-x-5 gap-y-2 ${className}`}>
      {LEGAL_PAGES.map((p) => (
        <Link
          key={p.slug}
          to="/legal/$slug"
          params={{ slug: p.slug }}
          className="transition-colors hover:text-foreground"
        >
          {p.title}
        </Link>
      ))}
    </nav>
  );
}
