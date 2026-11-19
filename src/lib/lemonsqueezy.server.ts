/**
 * Lemon Squeezy (merchant of record: cobra, factura y gestiona el IVA).
 * Solo servidor. Variables de entorno (secretos en Cloudflare):
 *   LEMONSQUEEZY_API_KEY         API key de la tienda
 *   LEMONSQUEEZY_STORE_ID        id numérico de la tienda
 *   LEMONSQUEEZY_VARIANT_ID      id de la variante del producto (399 €)
 *   LEMONSQUEEZY_WEBHOOK_SECRET  firma de los webhooks
 *   LEMONSQUEEZY_CHECKOUT_URL    (opcional) enlace de pago fijo de respaldo
 *   LEMONSQUEEZY_ALLOW_TEST_MODE (opcional) "true" solo mientras se prueba con pedidos de test
 *   SITE_URL                     p. ej. https://tunuevavida.eu
 */

const API = "https://api.lemonsqueezy.com/v1";

export function siteUrl(request?: Request): string {
  const env = process.env["SITE_URL"];
  if (env) return env.replace(/\/$/, "");
  if (request) return new URL(request.url).origin;
  return "https://tunuevavida.eu";
}

/** Crea un checkout de un solo uso y devuelve su URL. */
export async function createCheckoutUrl(request: Request): Promise<string | null> {
  const apiKey = process.env["LEMONSQUEEZY_API_KEY"];
  const storeId = process.env["LEMONSQUEEZY_STORE_ID"];
  const variantId = process.env["LEMONSQUEEZY_VARIANT_ID"];
  const fallback = process.env["LEMONSQUEEZY_CHECKOUT_URL"] ?? null;
  if (!apiKey || !storeId || !variantId) return fallback;

  try {
    const res = await fetch(`${API}/checkouts`, {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            product_options: {
              redirect_url: `${siteUrl(request)}/gracias`,
              enabled_variants: [Number(variantId)],
            },
            checkout_options: { button_color: "#B4502D" },
          },
          relationships: {
            store: { data: { type: "stores", id: String(storeId) } },
            variant: { data: { type: "variants", id: String(variantId) } },
          },
        },
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      console.error(`[lemonsqueezy] checkout respondió ${res.status}`);
      return fallback;
    }
    const json = (await res.json()) as { data?: { attributes?: { url?: string } } };
    return json.data?.attributes?.url ?? fallback;
  } catch {
    console.error("[lemonsqueezy] no se pudo crear el checkout");
    return fallback;
  }
}

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Verifica la cabecera X-Signature (HMAC-SHA256 hex del cuerpo bruto). */
export async function verifySignature(rawBody: string, signature: string | null): Promise<boolean> {
  const secret = process.env["LEMONSQUEEZY_WEBHOOK_SECRET"];
  if (!secret || !signature) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  return timingSafeEqual(toHex(mac), signature.trim().toLowerCase());
}

export type OrderEvent = {
  eventName: string;
  orderId: string;
  email: string;
  name: string | null;
  status: string;
  totalCents: number | null;
  currency: string | null;
  variantId: string | null;
  storeId: string | null;
  testMode: boolean;
};

export function parseOrderEvent(payload: unknown): OrderEvent | null {
  const p = payload as {
    meta?: { event_name?: string; test_mode?: boolean };
    data?: {
      id?: string;
      type?: string;
      attributes?: {
        user_email?: string;
        user_name?: string;
        store_id?: number;
        status?: string;
        total?: number;
        currency?: string;
        first_order_item?: { variant_id?: number };
      };
    };
  };
  if (p?.data?.type !== "orders" || !p.data.id || !p.data.attributes?.user_email) return null;
  const a = p.data.attributes;
  return {
    eventName: p.meta?.event_name ?? "",
    orderId: String(p.data.id),
    email: a.user_email!.trim().toLowerCase(),
    name: a.user_name?.trim() || null,
    status: a.status ?? "",
    totalCents: typeof a.total === "number" ? a.total : null,
    currency: a.currency ?? null,
    variantId:
      a.first_order_item?.variant_id != null ? String(a.first_order_item.variant_id) : null,
    storeId: a.store_id != null ? String(a.store_id) : null,
    testMode: Boolean(p.meta?.test_mode),
  };
}
