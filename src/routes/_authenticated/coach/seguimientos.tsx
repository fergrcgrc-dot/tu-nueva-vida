import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarClock, CheckCircle2 } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { getCoachFollowUps, getMyRole } from "@/lib/program.functions";

const followUpsQuery = queryOptions({
  queryKey: ["coach-follow-ups"],
  queryFn: () => getCoachFollowUps(),
});

export const Route = createFileRoute("/_authenticated/coach/seguimientos")({
  loader: async ({ context }) => {
    const { role } = await getMyRole();
    if (role !== "coach" && role !== "platform_admin") throw redirect({ to: "/dashboard" });
    await context.queryClient.ensureQueryData(followUpsQuery);
  },
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <p className="text-sm text-muted-foreground">
        {error instanceof Error ? error.message : "No se pudieron cargar los seguimientos."}
      </p>
    </div>
  ),
  component: FollowUpsPage,
});

function FollowUpsPage() {
  const { data: followUps } = useSuspenseQuery(followUpsQuery);
  const pending = followUps.filter((f) => f.status === "pending");
  const done = followUps.filter((f) => f.status === "completed");

  return (
    <div className="min-h-screen bg-background">
      <AppHeader section="Panel del coach" />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link
          to="/coach"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Volver a clientes
        </Link>

        <h1 className="text-3xl font-semibold text-foreground">Seguimientos pendientes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Check-ins de 30 y 60 días tras el cierre del programa.
        </p>

        <section className="mt-8 space-y-3">
          {pending.length === 0 ? (
            <div className="card-depth rounded-2xl p-8 text-center text-sm text-muted-foreground">
              No hay seguimientos pendientes.
            </div>
          ) : (
            pending.map((f) => (
              <Link
                key={f.id}
                to="/coach/clientes/$clientId"
                params={{ clientId: f.user_id }}
                className="card-depth flex items-center gap-4 rounded-2xl p-5 transition-all hover:border-primary/40"
              >
                <CalendarClock className="h-5 w-5 shrink-0 text-gold" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {f.fullName ?? "Cliente"} · check-in de {f.day_offset} días
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Previsto:{" "}
                    {new Date(f.due_at).toLocaleDateString("es-ES", {
                      dateStyle: "medium",
                      timeZone: "UTC",
                    })}
                  </p>
                </div>
              </Link>
            ))
          )}
        </section>

        {done.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Completados
            </h2>
            <ul className="space-y-3">
              {done.map((f) => (
                <li key={f.id} className="card-depth rounded-2xl p-5">
                  <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                    {f.fullName ?? "Cliente"} · check-in de {f.day_offset} días
                  </p>
                  {f.summary && (
                    <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
                      {f.summary}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
