import { useServerFn } from "@tanstack/react-start";
import { useState, type ReactNode } from "react";

import { createProgramCheckout } from "@/lib/checkout.functions";

/** Botón que abre Stripe Checkout para comprar el programa. */
export function BuyProgramButton({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const startCheckout = useServerFn(createProgramCheckout);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);
    try {
      const { url } = await startCheckout({ data: { origin: window.location.origin } });
      window.location.assign(url);
    } catch {
      setError("No se pudo abrir el pago. Inténtalo de nuevo o escríbenos a hola@tunuevavida.eu.");
      setLoading(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-busy={loading}
        className={`${className ?? ""} disabled:cursor-wait disabled:opacity-70`}
      >
        {loading ? "Abriendo pago seguro…" : children}
      </button>
      {error && (
        <span role="alert" className="max-w-xs text-center text-xs text-destructive">
          {error}
        </span>
      )}
    </span>
  );
}
