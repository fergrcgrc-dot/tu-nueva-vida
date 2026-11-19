// Cliente de Stripe solo para servidor. Nunca importar desde código de cliente:
// cárgalo dentro de los handlers con `await import("@/lib/stripe.server")`.
import Stripe from "stripe";

/** Precio del programa, resuelto por lookup key (igual en sandbox y en live). */
export const PROGRAM_PRICE_LOOKUP_KEY = "tnv_programa_8s";

/** Etiqueta para identificar este flujo de checkout en el Dashboard de Stripe. */
export const CHECKOUT_INTEGRATION_ID = "tnv_landing_checkout_qkvwmzrd";

let _stripe: Stripe | undefined;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) {
    throw new Error("Falta configurar el secreto STRIPE_SECRET_KEY en el hosting.");
  }
  _stripe = new Stripe(key, {
    // Sin apiVersion explícita: el SDK fija la versión con la que se publicó
    // (sus tipos coinciden con ella). Actualizar = subir la versión de `stripe`.
    // Cloudflare Workers: transporte basado en fetch.
    httpClient: Stripe.createFetchHttpClient(),
    appInfo: { name: "tu-nueva-vida" },
  });
  return _stripe;
}

export function getWebhookSecret(): string {
  const secret = process.env["STRIPE_WEBHOOK_SECRET"];
  if (!secret) {
    throw new Error("Falta configurar el secreto STRIPE_WEBHOOK_SECRET en el hosting.");
  }
  return secret;
}

export const cryptoProvider = Stripe.createSubtleCryptoProvider();

export type { Stripe };
