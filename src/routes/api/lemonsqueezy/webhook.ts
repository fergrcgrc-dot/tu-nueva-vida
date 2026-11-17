import { createFileRoute } from "@tanstack/react-router";

/**
 * Webhook de Lemon Squeezy. Eventos a suscribir: order_created, order_refunded.
 * - order_created (pagado): crea la cuenta, inicializa el programa (módulo 1
 *   abierto) y envía el email de acceso para que la persona cree su contraseña.
 * - order_refunded: bloquea el acceso.
 * Idempotente por order_id: Lemon Squeezy reintenta si no recibe 200.
 */
export const Route = createFileRoute("/api/lemonsqueezy/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ls = await import("@/lib/lemonsqueezy.server");
        const raw = await request.text();
        if (!(await ls.verifySignature(raw, request.headers.get("x-signature")))) {
          return new Response("invalid signature", { status: 401 });
        }

        let payload: unknown;
        try {
          payload = JSON.parse(raw);
        } catch {
          return new Response("bad json", { status: 400 });
        }
        const order = ls.parseOrderEvent(payload);
        if (!order) return new Response("ignored", { status: 200 });

        const expectedVariant = process.env["LEMONSQUEEZY_VARIANT_ID"];
        if (expectedVariant && order.variantId && order.variantId !== expectedVariant) {
          return new Response("other product", { status: 200 });
        }

        const { provisionPurchase, revokePurchase } = await import("@/lib/purchases.server");
        try {
          if (order.eventName === "order_created" && order.status === "paid") {
            await provisionPurchase(order, ls.siteUrl(request));
          } else if (order.eventName === "order_refunded" || order.status === "refunded") {
            await revokePurchase(order);
          }
        } catch (error) {
          console.error(
            "[webhook] error procesando el pedido",
            error instanceof Error ? error.message : "",
          );
          return new Response("error", { status: 500 });
        }
        return new Response("ok", { status: 200 });
      },
    },
  },
});
