/**
 * Stripe: cobro (Checkout), factura (Invoicing) e IVA (Stripe Tax).
 * Solo servidor: se importa de forma dinámica dentro de los handlers.
 * Variables de entorno (secretos en Cloudflare):
 *   STRIPE_SECRET_KEY          clave secreta o restringida (rk_live_… recomendado)
 *   STRIPE_WEBHOOK_SECRET      whsec_… del endpoint /api/stripe/webhook
 *   STRIPE_ALLOW_TEST_MODE     (opcional) "true" solo mientras se prueba con claves de test
 *   SITE_URL                   p. ej. https://tunuevavida.eu
 */
import Stripe from "stripe";

/** Precio del programa, resuelto por lookup key (mismo valor en sandbox y en live). */
export const PROGRAM_PRICE_LOOKUP_KEY = "tnv_programa_8s";
/** Marca que ponemos en la sesión; el webhook solo da acceso si coincide. */
export const PROGRAM_PRODUCT_TAG = "programa_8s";
/** Identifica este flujo de checkout en el Dashboard de Stripe. */
const CHECKOUT_INTEGRATION_ID = "tnv_comprar_checkout_qkvwmzrd";

let _stripe: Stripe | undefined;

/** Devuelve el cliente o null si falta la clave (pasarela sin configurar). */
export function getStripe(): Stripe | null {
  if (_stripe) return _stripe;
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) return null;
  _stripe = new Stripe(key, {
    // Sin apiVersion explícita: el SDK usa la versión con la que se publicó
    // (sus tipos coinciden). Actualizar = subir la versión del paquete `stripe`.
    httpClient: Stripe.createFetchHttpClient(), // Cloudflare Workers
    appInfo: { name: "tu-nueva-vida" },
  });
  return _stripe;
}

export const cryptoProvider = Stripe.createSubtleCryptoProvider();

export function siteUrl(request?: Request): string {
  const env = process.env["SITE_URL"];
  if (env) return env.replace(/\/$/, "");
  if (request) return new URL(request.url).origin;
  return "https://tunuevavida.eu";
}

/** Crea una Checkout Session de pago único y devuelve su URL (o null si no se puede). */
export async function createCheckoutUrl(request: Request): Promise<string | null> {
  const stripe = getStripe();
  if (!stripe) return null;
  const origin = siteUrl(request);

  try {
    const prices = await stripe.prices.list({
      lookup_keys: [PROGRAM_PRICE_LOOKUP_KEY],
      active: true,
      limit: 1,
    });
    const price = prices.data[0];
    if (!price) {
      console.error("[stripe] no hay precio activo con la lookup key del programa");
      return null;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: price.id, quantity: 1 }],
      // IVA según el país del cliente; el precio ya lo incluye (tax_behavior inclusive).
      automatic_tax: { enabled: true },
      billing_address_collection: "required",
      // NIF/VAT para quien compra como profesional o empresa (factura a su nombre).
      tax_id_collection: { enabled: true },
      customer_creation: "always",
      // Factura PDF enviada por email tras el pago.
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: "Tu nueva vida — Programa de 8 semanas",
          footer: "Gracias por confiar en Tu nueva vida. Dudas: hola@tunuevavida.eu",
        },
      },
      allow_promotion_codes: true,
      locale: "es",
      metadata: { app: "tu-nueva-vida", product: PROGRAM_PRODUCT_TAG },
      integration_identifier: CHECKOUT_INTEGRATION_ID,
      success_url: `${origin}/gracias`,
      cancel_url: `${origin}/#precio`,
    });
    return session.url ?? null;
  } catch (error) {
    console.error(
      "[stripe] no se pudo crear el checkout",
      error instanceof Error ? error.message : "",
    );
    return null;
  }
}
