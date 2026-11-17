import { createFileRoute } from "@tanstack/react-router";

/**
 * /comprar → redirige a un checkout de Lemon Squeezy recién creado.
 * Todos los CTA de la landing apuntan aquí.
 */
const NOT_FOUND_HTML = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>Página no encontrada — Tu nueva vida</title>
<link href="https://fonts.googleapis.com/css2?family=Karla:wght@400;600;700&display=swap" rel="stylesheet">
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:Karla,system-ui,sans-serif;background:oklch(0.985 0.012 85);color:oklch(0.18 0.01 60);text-align:center;padding:16px}
h1{font-size:72px;margin:0}h2{font-size:20px;margin:16px 0 8px}p{color:oklch(0.48 0.02 60);font-size:14px}
a{display:inline-block;margin-top:24px;background:oklch(0.18 0.01 60);color:oklch(0.985 0.012 85);padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px}</style>
</head><body><div><h1>404</h1><h2>Página no encontrada</h2><p>La página que buscas no existe o ha sido movida.</p><a href="/">Volver al inicio</a></div></body></html>`;

export const Route = createFileRoute("/comprar")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { createCheckoutUrl } = await import("@/lib/lemonsqueezy.server");
        const url = await createCheckoutUrl(request);
        if (!url) {
          // Pasarela aún sin configurar: 404 explícito, sin redirigir a ningún sitio.
          return new Response(NOT_FOUND_HTML, {
            status: 404,
            headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
          });
        }
        return new Response(null, {
          status: 302,
          headers: { Location: url, "Cache-Control": "no-store" },
        });
      },
    },
  },
});
