import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Circle, CircleDot, Lock, Flag, Save } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import {
  getClientDetail,
  getMyRole,
  reviewFlag,
  updateSession,
} from "@/lib/program.functions";

const detailQuery = (clientId: string) =>
  queryOptions({
    queryKey: ["coach-client", clientId],
    queryFn: () => getClientDetail({ data: { clientId } }),
  });

export const Route = createFileRoute("/_authenticated/coach/clientes/$clientId")({
  params: { parse: (p) => ({ clientId: String(p.clientId) }) },
  loader: async ({ context, params }) => {
    const { role } = await getMyRole();
    if (role !== "coach") throw redirect({ to: "/dashboard" });
    await context.queryClient.ensureQueryData(detailQuery(params.clientId));
  },
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
      <p className="text-sm text-muted-foreground">
        {error instanceof Error ? error.message : "No se pudo cargar el cliente."}
      </p>
      <Link to="/coach" className="text-sm font-medium text-primary hover:underline">
        Volver al panel
      </Link>
    </div>
  ),
  component: ClientDetailPage,
});

function ProgressIcon({ status }: { status: string }) {
  if (status === "completed") return <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />;
  if (status === "in_progress") return <CircleDot className="h-4 w-4 text-ember" aria-hidden />;
  if (status === "unlocked") return <Circle className="h-4 w-4 text-gold" aria-hidden />;
  return <Lock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />;
}

function ClientDetailPage() {
  const { clientId } = Route.useParams();
  const { data } = useSuspenseQuery(detailQuery(clientId));
  const queryClient = useQueryClient();
  const callReview = useServerFn(reviewFlag);
  const callUpdateSession = useServerFn(updateSession);

  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [dateDraft, setDateDraft] = useState<Record<string, string>>({});
  const [nextStepDraft, setNextStepDraft] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const completed = data.progress.filter((p) => p.status === "completed").length;

  async function handleReviewFlag(flagId: string) {
    setBusy(flagId);
    try {
      await callReview({ data: { flagId } });
      toast.success("Aviso marcado como revisado.");
      await queryClient.invalidateQueries({ queryKey: ["coach-client", clientId] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar.");
    } finally {
      setBusy(null);
    }
  }

  async function handleSaveSession(sessionId: string) {
    setBusy(sessionId);
    try {
      const rawDate = dateDraft[sessionId];
      const rawNextStep = nextStepDraft[sessionId];
      await callUpdateSession({
        data: {
          sessionId,
          coachNotes: notesDraft[sessionId] ?? undefined,
          ...(rawNextStep !== undefined
            ? {
                nextStepRecommended:
                  rawNextStep === ""
                    ? null
                    : (rawNextStep as "acompanamiento_1_1" | "retiro_leon"),
              }
            : {}),
          ...(rawDate
            ? {
                scheduledAt: new Date(rawDate).toISOString(),
                status: "scheduled" as const,
              }
            : {}),
        },
      });
      toast.success("Sesión actualizada.");
      await queryClient.invalidateQueries({ queryKey: ["coach-client", clientId] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar.");
    } finally {
      setBusy(null);
    }
  }

  async function handleCompleteSession(sessionId: string) {
    setBusy(sessionId);
    try {
      await callUpdateSession({ data: { sessionId, status: "completed" } });
      toast.success("Sesión marcada como completada.");
      await queryClient.invalidateQueries({ queryKey: ["coach-client", clientId] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader section="Panel del coach" />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link
          to="/coach"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Volver a clientes
        </Link>

        <header className="mb-10">
          <h1 className="text-3xl font-semibold text-foreground">
            {data.profile.full_name ?? "Cliente"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.profile.program_start_date
              ? `Inicio: ${new Date(`${data.profile.program_start_date}T00:00:00Z`).toLocaleDateString("es-ES", { dateStyle: "medium", timeZone: "UTC" })}`
              : "Sin fecha de inicio"}
            {" · "}
            {completed}/8 módulos completados
          </p>
          <div className="mt-4 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(completed / 8) * 100}%` }}
            />
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Progreso */}
          <section className="card-depth rounded-2xl p-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
              Progreso por módulo
            </h2>
            <ul className="space-y-2.5">
              {data.progress.map((p) => (
                <li
                  key={p.module!.id}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                    p.status === "locked" ? "opacity-45" : "bg-secondary/60"
                  }`}
                >
                  <ProgressIcon status={p.status} />
                  <span className="text-xs text-muted-foreground">
                    S{p.module!.week_number}
                  </span>
                  <span className="flex-1 truncate text-sm text-foreground">
                    {p.module!.title}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Entregables */}
          <section className="card-depth rounded-2xl p-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
              Entregables
            </h2>
            {data.deliverables.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin entregables todavía.</p>
            ) : (
              <ul className="space-y-4">
                {data.deliverables.map((d) => {
                  const mod = d.modules as { week_number: number; title: string } | null;
                  return (
                    <li key={d.id} className="rounded-lg bg-secondary/60 p-4">
                      <p className="text-xs font-medium text-gold">
                        Semana {mod?.week_number} · {mod?.title}
                      </p>
                      <p className="mt-2 line-clamp-4 text-sm whitespace-pre-wrap text-foreground">
                        {d.content}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Flags */}
          <section className="card-depth rounded-2xl p-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
              Avisos
            </h2>
            {data.flags.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin avisos.</p>
            ) : (
              <ul className="space-y-3">
                {data.flags.map((f) => {
                  const mod = f.modules as { week_number: number; title: string } | null;
                  return (
                    <li
                      key={f.id}
                      className="flex items-start justify-between gap-3 rounded-lg bg-secondary/60 p-4"
                    >
                      <div>
                        <p className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                          <Flag
                            className={`h-3.5 w-3.5 ${f.status === "open" ? "text-destructive" : "text-muted-foreground"}`}
                            aria-hidden
                          />
                          {f.trigger_type}
                        </p>
                        {mod && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Semana {mod.week_number} · {mod.title}
                          </p>
                        )}
                        {f.note && (
                          <p className="mt-1 text-sm text-muted-foreground">{f.note}</p>
                        )}
                      </div>
                      {f.status === "open" ? (
                        <button
                          onClick={() => handleReviewFlag(f.id)}
                          disabled={busy === f.id}
                          className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/50 disabled:opacity-50"
                        >
                          Revisado
                        </button>
                      ) : (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          Revisado
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Sesiones 1:1 — las notas del coach nunca llegan al cliente */}
          <section className="card-depth rounded-2xl p-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
              Sesiones 1:1
            </h2>
            <ul className="space-y-4">
              {data.sessions.map((s) => (
                <li key={s.id} className="rounded-lg bg-secondary/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">
                      Cierre de la fase {s.phase_number}
                    </p>
                    <span className="text-xs text-muted-foreground capitalize">
                      {s.status === "pending"
                        ? "pendiente"
                        : s.status === "scheduled"
                          ? "agendada"
                          : "completada"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.scheduled_at
                      ? new Date(s.scheduled_at).toLocaleString("es-ES", {
                          dateStyle: "medium",
                          timeStyle: "short",
                          timeZone: "UTC",
                        })
                      : "Sin fecha"}
                  </p>
                  <div className="mt-3 space-y-2">
                    <input
                      type="datetime-local"
                      value={dateDraft[s.id] ?? ""}
                      onChange={(e) =>
                        setDateDraft((d) => ({ ...d, [s.id]: e.target.value }))
                      }
                      className="w-full rounded-lg border border-input bg-secondary px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                    />
                    <textarea
                      rows={2}
                      placeholder="Notas privadas del coach (el cliente no las ve)"
                      value={notesDraft[s.id] ?? s.coach_notes ?? ""}
                      onChange={(e) =>
                        setNotesDraft((n) => ({ ...n, [s.id]: e.target.value }))
                      }
                      className="w-full rounded-lg border border-input bg-secondary px-3 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                    />
                    {s.phase_number === 4 && (
                      <div className="space-y-1.5">
                        <label
                          htmlFor={`next-step-${s.id}`}
                          className="text-xs font-medium text-gold"
                        >
                          Siguiente paso propuesto
                        </label>
                        <select
                          id={`next-step-${s.id}`}
                          value={
                            nextStepDraft[s.id] ?? s.next_step_recommended ?? ""
                          }
                          onChange={(e) =>
                            setNextStepDraft((d) => ({ ...d, [s.id]: e.target.value }))
                          }
                          className="w-full rounded-lg border border-input bg-secondary px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                        >
                          <option value="">Sin decidir</option>
                          <option value="acompanamiento_1_1">
                            Acompañamiento 1:1 completo
                          </option>
                          <option value="retiro_leon">Retiro en León</option>
                        </select>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveSession(s.id)}
                        disabled={busy === s.id}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                      >
                        <Save className="h-3 w-3" aria-hidden /> Guardar
                      </button>
                      {s.status === "scheduled" && (
                        <button
                          onClick={() => handleCompleteSession(s.id)}
                          disabled={busy === s.id}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/50 disabled:opacity-50"
                        >
                          Marcar completada
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
