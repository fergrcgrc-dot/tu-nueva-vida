/**
 * Google Analytics 4 con consentimiento previo (LSSI art. 22.2 / RGPD).
 * - Solo se activa si existe VITE_GA4_MEASUREMENT_ID (formato G-XXXXXXX).
 * - gtag.js no se descarga hasta que el visitante acepta las cookies de análisis.
 * - Eventos: page_view (también en navegación interna), begin_checkout,
 *   contact_email, login, sign_up, exercise_submitted, module_completed.
 */
const RAW_ID = (import.meta.env["VITE_GA4_MEASUREMENT_ID"] as string | undefined) ?? "";
export const GA_ID = /^G-[A-Z0-9]{4,}$/.test(RAW_ID) ? RAW_ID : null;
export const ANALYTICS_ENABLED = GA_ID !== null;

const CONSENT_KEY = "tnv_cookie_consent";
export type ConsentChoice = "granted" | "denied";

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

export function readConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

let loaded = false;

function loadGa() {
  if (!GA_ID || loaded || typeof window === "undefined") return;
  loaded = true;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { anonymize_ip: true });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  document.addEventListener("click", trackClicks, { capture: true });
}

/** Clics que interesan al embudo, sin tocar cada botón. */
function trackClicks(e: MouseEvent) {
  const a = (e.target as HTMLElement | null)?.closest?.("a");
  if (!a) return;
  const href = a.getAttribute("href") ?? "";
  if (href === "/comprar") {
    track("begin_checkout", {
      currency: "EUR",
      value: 399,
      cta: a.textContent?.trim().slice(0, 60),
    });
  } else if (href.startsWith("mailto:")) {
    track("contact_email");
  }
}

export function setConsent(choice: ConsentChoice) {
  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    /* sin almacenamiento: se volverá a preguntar */
  }
  if (choice === "granted") {
    loadGa();
  } else if (loaded) {
    // Retirada del consentimiento: se deja de medir y se borran las cookies de GA.
    window.gtag?.("consent", "update", { analytics_storage: "denied" });
    for (const c of document.cookie.split(";")) {
      const name = c.split("=")[0]?.trim() ?? "";
      if (name.startsWith("_ga")) {
        document.cookie = `${name}=; Max-Age=0; path=/; domain=.${location.hostname}`;
        document.cookie = `${name}=; Max-Age=0; path=/`;
      }
    }
  }
  window.dispatchEvent(new Event("tnv-consent-change"));
}

/** Llamar al arrancar la app en el navegador. */
export function initAnalytics() {
  if (readConsent() === "granted") loadGa();
}

export function track(event: string, params: Record<string, unknown> = {}) {
  if (!loaded || !window.gtag) return;
  window.gtag("event", event, params);
}

export function trackPageView(path: string) {
  track("page_view", { page_path: path, page_location: window.location.href });
}
