import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { ANALYTICS_ENABLED, readConsent, setConsent } from "@/lib/analytics";

/** Banner de consentimiento. Solo existe si Google Analytics está configurado. */
export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ANALYTICS_ENABLED) return;
    setOpen(readConsent() === null);
    const reopen = () => setOpen(true);
    window.addEventListener("tnv-open-cookie-settings", reopen);
    return () => window.removeEventListener("tnv-open-cookie-settings", reopen);
  }, []);

  if (!ANALYTICS_ENABLED || !open) return null;

  const choose = (c: "granted" | "denied") => {
    setConsent(c);
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Preferencias de cookies"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl border border-border bg-card p-5 text-sm shadow-xl"
    >
      <p className="text-foreground">
        Usamos cookies de análisis (Google Analytics) para saber cómo se usa la web y mejorarla.
        Solo se activan si las aceptas. Más información en la{" "}
        <Link to="/legal/$slug" params={{ slug: "cookies" }} className="underline">
          política de cookies
        </Link>
        .
      </p>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => choose("denied")}
          className="rounded-full border border-border px-5 py-2 font-semibold text-foreground hover:bg-secondary"
        >
          Rechazar
        </button>
        <button
          type="button"
          onClick={() => choose("granted")}
          className="rounded-full bg-primary px-5 py-2 font-semibold text-primary-foreground hover:opacity-90"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}

/** Enlace para cambiar la elección en cualquier momento (obligatorio por ley). */
export function CookieSettingsLink({ className = "" }: { className?: string }) {
  if (!ANALYTICS_ENABLED) return null;
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("tnv-open-cookie-settings"))}
      className={`transition-colors hover:text-foreground ${className}`}
    >
      Preferencias de cookies
    </button>
  );
}
