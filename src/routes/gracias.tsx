import { createFileRoute, Link } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";

export const Route = createFileRoute("/gracias")({
  head: () => ({
    meta: [
      { title: "Gracias por tu compra — Tu nueva vida" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Gracias,
});

function Gracias() {
  return (
    <div className="landing landing-hero-bg flex min-h-screen items-center justify-center px-5 font-body">
      <div className="landing-soft-card max-w-lg rounded-[2rem] p-10 text-center">
        <MailCheck className="mx-auto h-10 w-10 text-ember" aria-hidden />
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Ya estás dentro</h1>
        <p className="mt-4 text-muted-foreground">
          Te hemos enviado un email para crear tu contraseña. Ábrelo desde este dispositivo y
          empieza por el Módulo 1. Si no lo ves en unos minutos, revisa la carpeta de spam. El
          enlace caduca en 1 hora: si se te pasa, pide uno nuevo desde «¿Has olvidado tu
          contraseña?» en la página de acceso.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          ¿Ya tenías cuenta? Entra directamente con tu email y tu contraseña.
        </p>
        <Link
          to="/login"
          className="mt-8 inline-flex rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Acceder al programa
        </Link>
        <p className="mt-6 text-xs text-muted-foreground">
          ¿Algún problema con el acceso? Escribe a hola@tunuevavida.eu con el email de tu compra.
        </p>
      </div>
    </div>
  );
}
