import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { CheckCircle2, Circle, CircleDot, Lock, CalendarDays, ArrowRight } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { getDashboard, getMyDeliverables, getMyRole } from "@/lib/program.functions";

const dashboardQuery = queryOptions({
  queryKey: ["dashboard"],
  queryFn: () => getDashboard(),
});

const deliverablesQuery = queryOptions({
  queryKey: ["my-deliverables"],
  queryFn: () => getMyDeliverables(),
});

export const Route = createFileRoute("/_authenticated/dashboard")({
  loader: async ({ context }) => {
    const { role } = await getMyRole();
    if (role === "coach") throw redirect({ to: "/coach" });
    await context.queryClient.ensureQueryData(dashboardQuery);
    await context.queryClient.ensureQueryData(deliverablesQuery);
  },
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <p className="text-sm text-muted-foreground">
        {error instanceof Error ? error.message : "No se pudo cargar tu panel."}
      </p>
    </div>
  ),
  component: DashboardPage,
});

const STATUS_LABEL: Record<string, string> = {
  locked: "Bloqueado",
  unlocked: "Por empezar",
  in_progress: "En curso",
  completed: "Completado",
};

function StatusIcon({ status }: { status: string }) {
  if (status === "completed")
    return <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden />;
  if (status === "in_progress")
    return <CircleDot className="h-5 w-5 text-ember" aria-hidden />;
  if (status === "unlocked") return <Circle className="h-5 w-5 text-gold" aria-hidden />;
  return <Lock className="h-4 w-4 text-muted-foreground" aria-hidden />;
}

function DashboardPage() {
  const { data } = useSuspenseQuery(dashboardQuery);
  const { data: deliverables } = useSuspenseQuery(deliverablesQuery);

  const deliverableByModule = new Map(deliverables.map((d) => [d.module_id, d]));
  const completedCount = data.modules.filter((m) => m.status === "completed").length;
  const activeModule =
    data.modules.find((m) => m.status === "in_progress") ??
    data.modules.find((m) => m.status === "unlocked") ??
    null;
  const progressPct = Math.round((completedCount / 8) * 100);

  const phases = [1, 2, 3, 4].map((phase) => ({
    phase,
    name: data.modules.find((m) => m.phase_number === phase)?.phase_name ?? "",
    modules: data.modules.filter((m) => m.phase_number === phase),
  }));

  const firstName = data.profile?.full_name?.split(" ")[0] ?? null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader section="Mi programa" />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Saludo y progreso */}
        <section className="mb-10">
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
            {firstName ? `Hola, ${firstName}` : "Bienvenido"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Semana {activeModule?.week_number ?? 8} de 8 ·{" "}
            {completedCount === 8
              ? "Programa completado"
              : `${completedCount} de 8 módulos completados`}
          </p>
          <div className="mt-5 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-muted">
            <div
              className="ember-glow h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </section>

        {/* Próxima sesión 1:1 */}
        {data.nextSession && (
          <section className="card-depth mb-10 flex flex-wrap items-center gap-4 rounded-2xl p-5">
            <CalendarDays className="h-5 w-5 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                Sesión 1:1 · Cierre de la fase {data.nextSession.phase_number}
              </p>
              <p className="text-sm text-muted-foreground">
                {data.nextSession.status === "scheduled" && data.nextSession.scheduled_at
                  ? new Date(data.nextSession.scheduled_at).toLocaleString("es-ES", {
                      dateStyle: "full",
                      timeStyle: "short",
                      timeZone: "UTC",
                    })
                  : "Pendiente de agendar con tu coach"}
              </p>
            </div>
          </section>
        )}

        {/* Continuar */}
        {activeModule && (
          <Link
            to="/modulos/$moduleId"
            params={{ moduleId: activeModule.id }}
            className="ember-glow mb-12 flex items-center justify-between gap-4 rounded-2xl bg-primary px-6 py-5 text-primary-foreground transition-opacity hover:opacity-90"
          >
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase opacity-80">
                {activeModule.status === "in_progress" ? "Continúa donde lo dejaste" : "Tu módulo activo"}
              </p>
              <p className="mt-1 font-display text-xl font-semibold">
                Semana {activeModule.week_number} · {activeModule.title}
              </p>
            </div>
            <ArrowRight className="h-6 w-6 shrink-0" aria-hidden />
          </Link>
        )}

        {/* Línea de tiempo: 8 semanas en 4 fases */}
        <div className="space-y-10">
          {phases.map((phase) => (
            <section key={phase.phase}>
              <h2 className="mb-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Fase {phase.phase} · {phase.name}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {phase.modules.map((m) => {
                  const deliverable = deliverableByModule.get(m.id);
                  const locked = m.status === "locked";
                  const card = (
                    <article
                      className={`card-depth rounded-2xl p-5 transition-all ${
                        locked ? "opacity-45" : "hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <StatusIcon status={m.status} />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Semana {m.week_number}
                            </p>
                            <h3 className="font-display text-lg font-semibold text-foreground">
                              {m.title}
                            </h3>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            m.status === "completed"
                              ? "bg-accent text-primary"
                              : m.status === "in_progress"
                                ? "bg-accent text-ember"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {STATUS_LABEL[m.status]}
                        </span>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                        {m.objective}
                      </p>
                      {deliverable && (
                        <p className="mt-3 text-xs font-medium text-gold">
                          Entregable guardado ✓
                        </p>
                      )}
                    </article>
                  );
                  return locked ? (
                    <div key={m.id} aria-disabled>
                      {card}
                    </div>
                  ) : (
                    <Link
                      key={m.id}
                      to="/modulos/$moduleId"
                      params={{ moduleId: m.id }}
                      className="block"
                    >
                      {card}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
