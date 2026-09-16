import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";

import { supabase } from "@/integrations/supabase/client";
import { getMyRole } from "@/lib/program.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tu Nueva Vida — Programa privado de transformación" },
      {
        name: "description",
        content:
          "Acceso privado al programa Tu Nueva Vida: 8 semanas, 4 fases, guía con IA y acompañamiento humano 1:1.",
      },
      { property: "og:title", content: "Tu Nueva Vida" },
      {
        property: "og:description",
        content:
          "Acceso privado al programa Tu Nueva Vida: 8 semanas, 4 fases, guía con IA y acompañamiento humano 1:1.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

/**
 * Entrada de la app: no hay contenido público. Según la sesión y el rol,
 * lleva al panel del cliente, al panel del coach o al inicio de sesión.
 */
function Index() {
  const navigate = useNavigate();
  const fetchRole = useServerFn(getMyRole);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session) {
        navigate({ to: "/login", replace: true });
        return;
      }
      try {
        const { role } = await fetchRole();
        if (cancelled) return;
        navigate({
          to:
            role === "platform_admin" ? "/admin" : role === "coach" ? "/coach" : "/dashboard",
          replace: true,
        });
      } catch {
        if (!cancelled) navigate({ to: "/login", replace: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, fetchRole]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="ember-glow mb-6 h-3 w-3 rounded-full bg-primary" />
      <p className="text-sm tracking-widest text-muted-foreground uppercase">
        Tu Nueva Vida
      </p>
      <p className="mt-2 text-sm text-muted-foreground">Preparando tu espacio…</p>
    </div>
  );
}
