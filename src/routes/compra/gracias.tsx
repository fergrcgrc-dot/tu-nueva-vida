import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { z } from "zod";

import { getCheckoutStatus } from "@/lib/checkout.functions";

export const Route = createFileRoute("/compra/gracias")({
  ssr: false,
  validateSearch: z.object({ session_id: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Gracias por tu compra — Tu nueva vida" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ThankYouPage,
});

type State =
  | { kind: "loading" }
  | { kind: "paid"; email: string | null }
  | { kind: "processing"; email: string | null }
  | { kind: "unknown" };

/**
 * Página informativa tras el pago. NO da acceso: el alta la hace el webhook.
 * Aquí solo confirmamos el estado y explicamos el siguiente paso.
 */
function ThankYouPage() {
  const { session_id } = Route.useSearch();
  const fetchStatus = useServerFn(getCheckoutStatus);
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!session_id) {
      setState({ kind: "unknown" });
      return;
    }
    let active = true;
    fetchStatus({ data: { sessionId: session_id } })
      .then((s) => {
        if (!active) return;
        if (s.paymentStatus === "paid" || s.paymentStatus === "no_payment_required") {
          setState({ kind: "paid", email: s.email });
        } else if (s.status === "complete") {
          setState({ kind: "processing", email: s.email });
        } else {
          setState({ kind: "unknown" });
        }
      })
      .catch(() => active && setState({ kind: "unknown" }));
    return () => {
      active = false;
    };
  }, [session_id, fetchStatus]);

  return (
    <main className="landing-hero-bg flex min-h-screen items-center justify-center px-5 py-20">
      <div className="landing-soft-card w-full max-w-lg rounded-3xl p-8 text-center">
        {state.kind === "loading" && <p className="text-muted-foreground">Confirmando tu pago…</p>}

        {state.kind === "paid" && (
          <>
            <h1 className="text-3xl font-bold tracking-tight">¡Ya estás dentro!</h1>
            <p className="mt-4 text-muted-foreground">
              Pago confirmado. En unos minutos recibirás un email
              {state.email ? (
                <>
                  {" "}
                  en <strong className="text-foreground">{state.email}</strong>
                </>
              ) : null}{" "}
              para crear tu contraseña y entrar al programa. También te llegará la factura.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              ¿No te llega? Revisa spam o escríbenos a{" "}
              <a className="underline" href="mailto:hola@tunuevavida.eu">
                hola@tunuevavida.eu
              </a>
              .
            </p>
          </>
        )}

        {state.kind === "processing" && (
          <>
            <h1 className="text-3xl font-bold tracking-tight">Estamos procesando tu pago</h1>
            <p className="mt-4 text-muted-foreground">
              Tu método de pago tarda un poco en confirmarse. Cuando se complete te enviaremos el
              email de acceso{state.email ? ` a ${state.email}` : ""}.
            </p>
          </>
        )}

        {state.kind === "unknown" && (
          <>
            <h1 className="text-3xl font-bold tracking-tight">No encontramos tu pago</h1>
            <p className="mt-4 text-muted-foreground">
              Si has pagado, revisa tu email en unos minutos. Si no, puedes volver a intentarlo.
            </p>
          </>
        )}

        <Link
          to="/"
          className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
