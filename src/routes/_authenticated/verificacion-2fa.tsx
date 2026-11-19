import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { ShieldCheck } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { getMyRole } from "@/lib/program.functions";

export const Route = createFileRoute("/_authenticated/verificacion-2fa")({
  beforeLoad: async () => {
    const { role } = await getMyRole();
    if (role !== "platform_admin") throw redirect({ to: "/dashboard" });
  },
  head: () => ({ meta: [{ title: "Verificación en dos pasos — Tu Nueva Vida" }] }),
  component: TwoFactorPage,
});

type Mode = "loading" | "enroll" | "verify" | "error";

/**
 * Verificación en dos pasos (TOTP) para la cuenta de administración.
 * - Sin factor verificado: alta con QR (Google Authenticator, 1Password, etc.).
 * - Con factor: pide el código de 6 dígitos y eleva la sesión a aal2.
 */
function TwoFactorPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>("loading");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel === "aal2") {
        navigate({ to: "/admin", replace: true });
        return;
      }
      const { data, error: listError } = await supabase.auth.mfa.listFactors();
      if (!active) return;
      if (listError) {
        setMode("error");
        return;
      }
      const verified = data.totp.find((f) => f.status === "verified");
      if (verified) {
        setFactorId(verified.id);
        setMode("verify");
        return;
      }
      // Limpia altas a medias (QR generado pero nunca confirmado).
      for (const f of data.all.filter((f) => f.status !== "verified")) {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data: enrolled, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `Administración ${new Date().toISOString().slice(0, 10)}`,
        issuer: "Tu nueva vida",
      });
      if (!active) return;
      if (enrollError || !enrolled) {
        setMode("error");
        return;
      }
      setFactorId(enrolled.id);
      setQr(enrolled.totp.qr_code);
      setSecret(enrolled.totp.secret);
      setMode("enroll");
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!factorId || busy) return;
    const clean = code.replace(/\D/g, "");
    if (clean.length !== 6) {
      setError("El código tiene 6 dígitos.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: clean,
    });
    setBusy(false);
    if (verifyError) {
      setCode("");
      setError("Código incorrecto o caducado. Espera al siguiente y vuelve a probar.");
      return;
    }
    await queryClient.invalidateQueries();
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="card-depth w-full max-w-md rounded-2xl p-8 sm:p-10">
        <div className="mb-6 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-primary" aria-hidden />
          <h1 className="mt-4 text-2xl font-semibold text-foreground">Verificación en dos pasos</h1>
        </div>

        {mode === "loading" && (
          <p className="text-center text-sm text-muted-foreground">Preparando…</p>
        )}

        {mode === "error" && (
          <p role="alert" className="text-center text-sm text-destructive">
            No se pudo iniciar la verificación. Recarga la página.
          </p>
        )}

        {mode === "enroll" && (
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              La administración exige un segundo factor. Escanea este código con tu app de
              autenticación (Google Authenticator, Microsoft Authenticator, 1Password…) y escribe el
              código de 6 dígitos que te muestre.
            </p>
            {qr && (
              <img
                src={qr}
                alt="Código QR para la app de autenticación"
                width={200}
                height={200}
                className="mx-auto rounded-lg bg-white p-2"
              />
            )}
            {secret && (
              <p className="text-center text-xs">
                ¿No puedes escanear? Introduce esta clave a mano:
                <br />
                <code className="mt-1 inline-block rounded bg-secondary px-2 py-1 font-mono text-foreground select-all">
                  {secret}
                </code>
              </p>
            )}
          </div>
        )}

        {mode === "verify" && (
          <p className="text-sm text-muted-foreground">
            Abre tu app de autenticación y escribe el código de 6 dígitos de «Tu nueva vida».
          </p>
        )}

        {(mode === "enroll" || mode === "verify") && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={7}
              autoFocus
              placeholder="123456"
              aria-label="Código de 6 dígitos"
              className="w-full rounded-lg border border-input bg-secondary px-3.5 py-3 text-center font-mono text-2xl tracking-[0.4em] text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-ring"
            />
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="ember-glow w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Comprobando…" : mode === "enroll" ? "Activar 2FA" : "Verificar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
