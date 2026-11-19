import { createFileRoute } from "@tanstack/react-router";

/**
 * Webhook de Stripe: POST https://tunuevavida.eu/api/stripe/webhook
 * Eventos a suscribir en el endpoint:
 *  - checkout.session.completed               (pago con tarjeta, Bizum, etc.)
 *  - checkout.session.async_payment_succeeded (métodos de pago diferido)
 *  - charge.refunded                          (reembolso total → bloquea el acceso)
 *
 * Al confirmarse el pago: crea la cuenta, inicializa el programa (módulo 1
 * abierto) y envía el email para crear la contraseña. Idempotente por
 * Checkout Session: Stripe reintenta mientras no reciba un 2xx.
 */
export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { getStripe, cryptoProvider, siteUrl, PROGRAM_PRODUCT_TAG } =
          await import("@/lib/stripe.server");
        const { logSecurityEvent } = await import("@/lib/security.server");

        const stripe = getStripe();
        const secret = process.env["STRIPE_WEBHOOK_SECRET"];
        if (!stripe || !secret) {
          console.error("[stripe-webhook] faltan STRIPE_SECRET_KEY o STRIPE_WEBHOOK_SECRET");
          return new Response("not configured", { status: 500 });
        }

        const raw = await request.text();
        if (raw.length > 500_000) return new Response("too large", { status: 413 });

        let event;
        try {
          event = await stripe.webhooks.constructEventAsync(
            raw,
            request.headers.get("stripe-signature") ?? "",
            secret,
            undefined,
            cryptoProvider,
          );
        } catch {
          await logSecurityEvent("webhook_invalid_signature", null, {
            provider: "stripe",
            ip: request.headers.get("cf-connecting-ip"),
          });
          return new Response("invalid signature", { status: 400 });
        }

        const allowTest = process.env["STRIPE_ALLOW_TEST_MODE"] === "true";
        if (!event.livemode && !allowTest) {
          await logSecurityEvent("webhook_rejected", null, {
            provider: "stripe",
            reason: "test_mode",
            event: event.id,
          });
          return new Response("ignored", { status: 200 });
        }

        const { provisionPurchase, revokePurchase } = await import("@/lib/purchases.server");

        try {
          switch (event.type) {
            case "checkout.session.completed":
            case "checkout.session.async_payment_succeeded": {
              const session = event.data.object;
              // Con pagos diferidos, "completed" llega aún sin cobrar: se espera al
              // evento async_payment_succeeded.
              if (session.payment_status === "unpaid") break;

              // El acceso solo se concede por sesiones creadas por /comprar.
              const reject = async (reason: string) =>
                logSecurityEvent("webhook_rejected", null, {
                  provider: "stripe",
                  reason,
                  session: session.id,
                });
              if (session.metadata?.["product"] !== PROGRAM_PRODUCT_TAG) {
                await reject("product");
                break;
              }
              if (session.currency !== "eur") {
                await reject("currency");
                break;
              }
              const email = session.customer_details?.email?.trim().toLowerCase();
              if (!email) {
                await reject("email");
                break;
              }

              const ref = (v: string | { id: string } | null) =>
                v == null ? null : typeof v === "string" ? v : v.id;

              await provisionPurchase(
                {
                  provider: "stripe",
                  orderId: session.id,
                  email,
                  name: session.customer_details?.name?.trim() || null,
                  totalCents: session.amount_total,
                  currency: "EUR",
                  testMode: !session.livemode,
                  extra: {
                    payment_intent: ref(session.payment_intent),
                    customer: ref(session.customer),
                    invoice: ref(session.invoice),
                    tax_cents: session.total_details?.amount_tax ?? 0,
                  },
                },
                siteUrl(request),
              );
              break;
            }

            case "charge.refunded": {
              const charge = event.data.object;
              // Reembolso parcial (gesto comercial): no se toca el acceso.
              if (!charge.refunded) break;
              const paymentIntent =
                typeof charge.payment_intent === "string"
                  ? charge.payment_intent
                  : charge.payment_intent?.id;
              if (!paymentIntent) break;
              const sessions = await stripe.checkout.sessions.list({
                payment_intent: paymentIntent,
                limit: 1,
              });
              const session = sessions.data[0];
              if (!session || session.metadata?.["product"] !== PROGRAM_PRODUCT_TAG) break;
              await revokePurchase({
                provider: "stripe",
                orderId: session.id,
                email: (
                  session.customer_details?.email ??
                  charge.billing_details.email ??
                  ""
                ).toLowerCase(),
              });
              break;
            }

            default:
              break; // Evento no gestionado: 200 para que Stripe no reintente.
          }
        } catch (error) {
          console.error(
            "[stripe-webhook] error procesando el evento",
            event.type,
            error instanceof Error ? error.message : "",
          );
          return new Response("error", { status: 500 });
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
