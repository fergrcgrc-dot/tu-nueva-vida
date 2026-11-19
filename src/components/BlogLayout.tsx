import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { CookieSettingsLink } from "@/components/CookieBanner";
import { LegalLinks } from "@/components/LegalLinks";

/** Cabecera y pie del blog, con la misma identidad que la landing. */
export function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="landing min-h-screen font-body">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="" width={32} height={32} className="h-8 w-8" aria-hidden />
            <span className="text-lg font-bold tracking-tight">Tu nueva vida</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link
              to="/blog"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Blog
            </Link>
            <a
              href="/#precio"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Ver el programa
            </a>
          </div>
        </nav>
      </header>
      {children}
      <footer className="landing-footer-bg px-5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} Tu nueva vida</p>
            <div className="flex gap-5">
              <Link to="/blog" className="transition-colors hover:text-foreground">
                Blog
              </Link>
              <Link to="/" className="transition-colors hover:text-foreground">
                El programa
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
            <LegalLinks />
            <CookieSettingsLink />
          </div>
        </div>
      </footer>
    </div>
  );
}
