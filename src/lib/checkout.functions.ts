import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const DEFAULT_SITE_URL = "https://tunuevavida.eu";

/**
 * Solo devolvemos al cliente a orígenes conocidos (evita redirecciones abiertas).
 * Incluye los dominios de preview de Lovable y localhost para desarrollo.
 */
function resolveOrigin(candidate: string | undefined): string {
  const site = process.env["SITE_URL"] ?? DEFAULT_SITE_URL;
  if (!candidate) return site;
  try {
    const url = new URL(candidate);
    const host = url.hostname;
    const allowed =
      url.origin === new URL(site).origin ||
      host === "tunuevavida.eu" ||
      host === "www.tunuevavida.eu" ||
      host.endsWith(".lovable.app") ||
      host.endsWith(".lovableproject.com") ||
      host === "localhost" ||
      host === "127.0.0.1";
    return allowed ? url.origin : site;
  } catch {
    return site;
  }
}

const CreateCheckoutInput = z.object({
  origin: z.string().url().optional(),
});

/**
 * Crea una sesión de Stripe Checkout para el programa (pago único, IVA incluido)
 * y devuelve la URL a la que redirigir. Público: no requiere sesión.
 *
 * El alta en la plataforma NO ocurre aquí ni en la página de éxito: la hace el
 * webhook (`/api/stripe/webhook`) cuando Stripe confirma el pago.
 */
export const createProgramCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CreateCheckoutInput.parse(input ?? {}))
  .handler(async ({ data }) => {
    const { getStripe, PROGRAM_PRICE_LOOKUP_KEY, CHECKOUT_INTEGRATION_ID } =
      await import("@/lib/stripe.server");
    const stripe = getStripe();
    const origin = resolveOrigin(data.origin);

    const prices = await stripe.prices.list({
      lookup_keys: [PROGRAM_PRICE_LOOKUP_KEY],
      active: true,
      limit: 1,
    });
    const price = prices.data[0];
    if (!price) {
      console.error("[createProgramCheckout] price not found", { PROGRAM_PRICE_LOOKUP_KEY });
      throw new Error("El pago no está disponible ahora mismo. Escríbenos a hola@tunuevavida.eu.");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: price.id, quantity: 1 }],
      // Stripe Tax: calcula el IVA según el país del cliente (precio con IVA incluido).
      automatic_tax: { enabled: true },
      billing_address_collection: "required",
      // Facturas con NIF/VAT para quien compra como profesional o empresa.
      tax_id_collection: { enabled: true },
      customer_creation: "always",
      // Stripe Invoicing: factura PDF tras el pago, enviada por email.
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: "Tu nueva vida — Programa de 8 semanas",
          footer: "Gracias por confiar en Tu nueva vida. Dudas: hola@tunuevavida.eu",
          metadata: { app: "tu-nueva-vida" },
        },
      },
      allow_promotion_codes: true,
      locale: "es",
      metadata: { app: "tu-nueva-vida", product: "programa_8s" },
      integration_identifier: CHECKOUT_INTEGRATION_ID,
      success_url: `${origin}/compra/gracias?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#programa`,
    });

    if (!session.url) throw new Error("No se pudo iniciar el pago. Inténtalo de nuevo.");
    return { url: session.url };
  });

const SessionStatusInput = z.object({
  sessionId: z.string().regex(/^cs_(test|live)_[A-Za-z0-9]+$/),
});

/** Estado mínimo de una sesión para la página de gracias (sin datos sensibles). */
export const getCheckoutStatus = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => SessionStatusInput.parse(input))
  .handler(async ({ data }) => {
    const { getStripe } = await import("@/lib/stripe.server");
    const session = await getStripe().checkout.sessions.retrieve(data.sessionId);
    return {
      status: session.status,
      paymentStatus: session.payment_status,
      email: session.customer_details?.email ?? null,
    };
  });
