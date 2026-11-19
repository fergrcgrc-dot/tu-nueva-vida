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
        if (raw.length > 200_000) return new Response("too large", { status: 413 });
        if (!(await ls.verifySignature(raw, request.headers.get("x-signature")))) {
          const { logSecurityEvent } = await import("@/lib/security.server");
          await logSecurityEvent("webhook_invalid_signature", null, {
            ip: request.headers.get("cf-connecting-ip"),
          });
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

        // El acceso solo se concede por el producto y la tienda configurados en
        // el servidor; el precio lo fija Lemon Squeezy, nunca el navegador.
        const expectedVariant = process.env["LEMONSQUEEZY_VARIANT_ID"];
        const expectedStore = process.env["LEMONSQUEEZY_STORE_ID"];
        const reject = async (reason: string) => {
          const { logSecurityEvent } = await import("@/lib/security.server");
          await logSecurityEvent("webhook_rejected", null, { reason, order: order.orderId });
          return new Response("ignored", { status: 200 });
        };
        if (!expectedVariant || order.variantId !== expectedVariant) return reject("variant");
        if (expectedStore && order.storeId && order.storeId !== expectedStore)
          return reject("store");
        if (order.testMode && process.env["LEMONSQUEEZY_ALLOW_TEST_MODE"] !== "true") {
          return reject("test_mode");
        }
        if (order.currency && order.currency !== "EUR") return reject("currency");

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
