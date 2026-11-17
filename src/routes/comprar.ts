import { createFileRoute } from "@tanstack/react-router";

/**
 * /comprar → redirige a un checkout de Lemon Squeezy recién creado.
 * Todos los CTA de la landing apuntan aquí.
 */
export const Route = createFileRoute("/comprar")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { createCheckoutUrl } = await import("@/lib/lemonsqueezy.server");
        const url = await createCheckoutUrl(request);
        return new Response(null, {
          status: 302,
          headers: { Location: url ?? "/#precio", "Cache-Control": "no-store" },
        });
      },
    },
  },
});
