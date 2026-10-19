import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type FormEvent } from "react";

import { supabase } from "@/integrations/supabase/client";
import { getMyRole } from "@/lib/program.functions";

export const Route = createFileRoute("/set-password")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Crea tu contraseña — Tu Nueva Vida" }],
  }),
  component: SetPasswordPage,
});

/**
 * Destino del enlace de invitación/recuperación de Supabase. El propio
 * cliente de Supabase detecta la sesión a partir del hash de la URL; aquí
 * solo queda pedir la contraseña nueva.
 */
function SetPasswordPage() {
  const navigate = useNavigate();
  const fetchRole = useServerFn(getMyRole);
  const [status, setStatus] = useState<"checking" | "ready" | "invalid">("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setStatus(data.session ? "ready" : "invalid");
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setSaving(false);
      setError("No se pudo guardar la contraseña. Inténtalo de nuevo.");
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
      setSaving(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
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
          <div className="ember-glow mx-auto mb-5 h-2.5 w-2.5 rounded-full bg-ember" />
          <h1 className="text-3xl font-semibold text-foreground">Tu Nueva Vida</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Crea tu contraseña para acceder al programa.
          </p>
        </div>

        {status === "checking" && (
          <p className="text-center text-sm text-muted-foreground">Comprobando tu invitación…</p>
        )}

        {status === "invalid" && (
          <p role="alert" className="text-center text-sm text-destructive">
            Este enlace no es válido o ha caducado. Pide a tu coach que te reenvíe la invitación.
          </p>
        )}

        {status === "ready" && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Nueva contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-input bg-secondary px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
                Repite la contraseña
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              disabled={saving}
              className="ember-glow w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Crear contraseña y entrar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
