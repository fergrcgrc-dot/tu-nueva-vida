import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { UserPlus, Flag, ArrowRight, CalendarClock } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { createClientAccount, getCoachClients } from "@/lib/program.functions";

const clientsQuery = queryOptions({
  queryKey: ["coach-clients"],
  queryFn: () => getCoachClients(),
});

export const Route = createFileRoute("/_authenticated/coach/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(clientsQuery);
  },
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <p className="text-sm text-muted-foreground">
        {error instanceof Error ? error.message : "No se pudo cargar el panel."}
      </p>
    </div>
  ),
  component: CoachPage,
});

function CoachPage() {
  const { data: clients } = useSuspenseQuery(clientsQuery);
  const queryClient = useQueryClient();
  const callCreate = useServerFn(createClientAccount);

  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (creating) return;
    setCreating(true);
    try {
      await callCreate({
        data: {
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          programStartDate: startDate,
        },
      });
      toast.success(`Cliente «${fullName.trim()}» creado y asignado.`);
      setShowForm(false);
      setEmail("");
      setPassword("");
      setFullName("");
      setStartDate("");
      await queryClient.invalidateQueries({ queryKey: ["coach-clients"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el cliente.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader section="Panel del coach" />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Tus clientes</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {clients.length} {clients.length === 1 ? "cliente asignado" : "clientes asignados"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/coach/seguimientos"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/50"
            >
              <CalendarClock className="h-4 w-4 text-primary" aria-hidden />
              Seguimientos pendientes
            </Link>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="ember-glow inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <UserPlus className="h-4 w-4" aria-hidden />
              Invitar cliente
            </button>
          </div>
        </div>


        {clients.length === 0 ? (
          <div className="card-depth rounded-2xl p-10 text-center">
            <p className="text-muted-foreground">
              Todavía no tienes clientes. Invita al primero para empezar.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((c) => (
              <Link
                key={c.clientId}
                to="/coach/clientes/$clientId"
                params={{ clientId: c.clientId }}
                className="card-depth group rounded-2xl p-5 transition-all hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-foreground">
                      {c.fullName ?? "Sin nombre"}
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {c.programStartDate
                        ? `Inicio: ${new Date(`${c.programStartDate}T00:00:00Z`).toLocaleDateString("es-ES", { dateStyle: "medium", timeZone: "UTC" })}`
                        : "Sin fecha de inicio"}
                    </p>
                  </div>
                  {c.openFlags > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-1 text-[11px] font-medium text-destructive">
                      <Flag className="h-3 w-3" aria-hidden />
                      {c.openFlags}
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {c.completedCount}/8 módulos
                      {c.currentWeek ? ` · semana ${c.currentWeek}` : ""}
                    </span>
                    <span>{Math.round((c.completedCount / 8) * 100)}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(c.completedCount / 8) * 100}%` }}
                    />
                  </div>
                </div>
                <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Ver detalle <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
