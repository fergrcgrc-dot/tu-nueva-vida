/**
 * Cabeceras de seguridad para todas las respuestas del Worker.
 * Los archivos estáticos (/assets, imágenes) las reciben desde public/_headers.
 */
const SUPABASE_URL = (import.meta.env["VITE_SUPABASE_URL"] as string | undefined) ?? "";
const SUPABASE_WS = SUPABASE_URL.replace(/^https:/, "wss:");

export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  // 'unsafe-inline' es necesario para el script de hidratación que inyecta el SSR.
  "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  `img-src 'self' data: blob: ${SUPABASE_URL} https://*.google-analytics.com https://www.googletagmanager.com`,
  `media-src 'self' blob: ${SUPABASE_URL}`,
  `connect-src 'self' ${SUPABASE_URL} ${SUPABASE_WS} https://cloudflareinsights.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com`,
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

export const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy": CONTENT_SECURITY_POLICY,
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Micrófono solo para el dictado por voz de los ejercicios.
  "Permissions-Policy":
    "camera=(), microphone=(self), geolocation=(), payment=(), usb=(), interest-cohort=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "X-Robots-Tag": "noarchive",
};

export function withSecurityHeaders(response: Response): Response {
  const out = new Response(response.body, response);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) out.headers.set(k, v);
  out.headers.delete("X-Powered-By");
  return out;
}

/**
 * Fuerza HTTPS y el dominio canónico. Devuelve la redirección o null.
 * En desarrollo (localhost) no hace nada.
 */
export function canonicalRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (local) return null;
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const insecure = url.protocol === "http:" || forwardedProto === "http";
  const www = url.hostname === "www.tunuevavida.eu";
  if (!insecure && !www) return null;
  url.protocol = "https:";
  if (www) url.hostname = "tunuevavida.eu";
  return new Response(null, { status: 301, headers: { Location: url.toString() } });
}
