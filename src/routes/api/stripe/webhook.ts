import { createFileRoute } from "@tanstack/react-router";

/**
 * Webhook de Stripe: POST https://tunuevavida.eu/api/stripe/webhook
 *
 * Eventos que hay que suscribir en el endpoint de Stripe:
 *  - checkout.session.completed
 *  - checkout.session.async_payment_succeeded
 *  - checkout.session.async_payment_failed
 *  - charge.refunded
 *
 * Responde 2xx solo si el evento se procesó; si algo falla devuelve 500 y
 * Stripe reintenta (el fulfillment es idempotente).
 */
export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const signature = request.headers.get("stripe-signature");
        if (!signature) return new Response("Missing signature", { status: 400 });

        const { getStripe, getWebhookSecret, cryptoProvider } = await import("@/lib/stripe.server");
        let stripe, webhookSecret;
        try {
          stripe = getStripe();
          webhookSecret = getWebhookSecret();
        } catch (err) {
          // Configuración incompleta en el hosting: 500 para que Stripe reintente.
          console.error("[stripe-webhook] misconfigured", {
            message: err instanceof Error ? err.message : String(err),
          });
          return new Response("Webhook not configured", { status: 500 });
        }

        const payload = await request.text();

        let event;
        try {
          event = await stripe.webhooks.constructEventAsync(
            payload,
            signature,
            webhookSecret,
            undefined,
            cryptoProvider,
          );
        } catch (err) {
          console.error("[stripe-webhook] signature verification failed", {
            message: err instanceof Error ? err.message : String(err),
          });
          return new Response("Invalid signature", { status: 400 });
        }

        const { fulfillCheckoutSession, markCheckoutFailed, recordRefund } =
          await import("@/lib/fulfillment.server");

        try {
          switch (event.type) {
            case "checkout.session.completed":
            case "checkout.session.async_payment_succeeded":
              await fulfillCheckoutSession(event.data.object);
              break;
            case "checkout.session.async_payment_failed":
              await markCheckoutFailed(event.data.object);
              break;
            case "charge.refunded":
              await recordRefund(event.data.object);
              break;
            default:
              // Evento no gestionado: confirmamos para que Stripe no reintente.
              break;
          }
        } catch (err) {
          console.error("[stripe-webhook] handler failed", {
            eventId: event.id,
            type: event.type,
            message: err instanceof Error ? err.message : String(err),
          });
          return new Response("Webhook handler failed", { status: 500 });
        }

        return Response.json({ received: true });
      },
    },
  },
});
