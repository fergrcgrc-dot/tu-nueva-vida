import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";

import { supabase } from "@/integrations/supabase/client";
import { getMyRole } from "@/lib/program.functions";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — Tu Nueva Vida" },
      {
        name: "description",
        content: "Acceso privado para clientes y coach del programa Tu Nueva Vida.",
      },
      { property: "og:title", content: "Iniciar sesión — Tu Nueva Vida" },
      {
        property: "og:description",
        content: "Acceso privado para clientes y coach del programa Tu Nueva Vida.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

/**
 * Solo inicio de sesión: no existe registro público. Los clientes son
 * invitados manualmente por el coach.
 */
function LoginPage() {
  const navigate = useNavigate();
  const fetchRole = useServerFn(getMyRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setLoading(false);
      setError("Correo o contraseña incorrectos.");
      return;
    }
    try {
      const { role } = await fetchRole();
      navigate({
        to: role === "platform_admin" ? "/admin" : role === "coach" ? "/coach" : "/dashboard",
        replace: true,
      });
    } catch {
      navigate({ to: "/dashboard", replace: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Fogata: un punto de luz cálida sobre el cielo nocturno */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-30%] left-1/2 h-[70vh] w-[90vw] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(0.72 0.14 65 / 55%), transparent 65%)",
        }}
      />
      <div className="card-depth relative w-full max-w-md rounded-2xl p-8 sm:p-10">
        <div className="mb-8 text-center">
          <div className="ember-glow mx-auto mb-5 h-2.5 w-2.5 rounded-full bg-primary" />
          <h1 className="text-3xl font-semibold text-foreground">Tu Nueva Vida</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Un espacio privado. Accede con tu invitación.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-input bg-secondary px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring"
              placeholder="tu@correo.com"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-input bg-secondary px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="ember-glow w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          El acceso es solo por invitación de tu coach.
        </p>
      </div>
    </div>
  );
}
