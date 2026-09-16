import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  Flag,
  History,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import {
  adminAssignCoach,
  adminCreateClient,
  adminCreateCoach,
  adminSetAccountStatus,
  getAdminOverview,
  getAuditLogs,
} from "@/lib/admin.functions";

const overviewQuery = queryOptions({
  queryKey: ["admin-overview"],
  queryFn: () => getAdminOverview(),
});

const auditQuery = queryOptions({
  queryKey: ["admin-audit"],
  queryFn: () => getAuditLogs(),
});

export const Route = createFileRoute("/_authenticated/admin/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(overviewQuery);
  },
  head: () => ({
    meta: [
      { title: "Panel de administración · Tu Nueva Vida" },
      {
        name: "description",
        content:
          "Gestión de clientes, coaches, asignaciones y actividad del programa Tu Nueva Vida.",
      },
    ],
  }),
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <p className="text-sm text-muted-foreground">
        {error instanceof Error ? error.message : "No se pudo cargar el panel."}
      </p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <p className="text-sm text-muted-foreground">Sección no encontrada.</p>
    </div>
  ),
  component: AdminPage,
});

type Section = "dashboard" | "clientes" | "coaches" | "asignaciones" | "actividad";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "dashboard", label: "Resumen" },
  { id: "clientes", label: "Clientes" },
  { id: "coaches", label: "Coaches" },
  { id: "asignaciones", label: "Asignaciones" },
  { id: "actividad", label: "Registro de actividad" },
];

const STATUS_LABEL: Record<string, string> = {
  active: "Activa",
  inactive: "Inactiva",
  blocked: "Bloqueada",
};

function fmtDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-ES", { dateStyle: "medium" });
}

function AdminPage() {
  const { data } = useSuspenseQuery(overviewQuery);
  const queryClient = useQueryClient();
  const [section, setSection] = useState<Section>("dashboard");

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-audit"] }),
    ]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader section="Panel de administración" />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">
              Panel de administración
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {data.totals.clients} clientes · {data.totals.activeCoaches} coaches activos
            </p>
          </div>
          <Link
            to="/coach"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/50"
          >
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
            Panel de coach
          </Link>
        </div>

        <nav className="mb-8 flex flex-wrap gap-2 border-b border-border pb-3">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                section === s.id
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>

        {section === "dashboard" && <DashboardSection data={data} />}
        {section === "clientes" && <ClientsSection data={data} onChanged={refresh} />}
        {section === "coaches" && <CoachesSection data={data} onChanged={refresh} />}
        {section === "asignaciones" && <AssignmentsSection data={data} />}
        {section === "actividad" && <ActivitySection />}
      </main>
    </div>
  );
}

type Overview = Awaited<ReturnType<typeof getAdminOverview>>;

/* ------------------------------ Resumen ------------------------------ */

function DashboardSection({ data }: { data: Overview }) {
  const cards = [
    { label: "Clientes totales", value: data.totals.clients },
    { label: "Clientes activos", value: data.totals.activeClients },
    { label: "Coaches activos", value: data.totals.activeCoaches },
    { label: "Sin coach asignado", value: data.totals.withoutCoach, alert: true },
    { label: "Con avisos abiertos", value: data.totals.withOpenFlags, alert: true },
    { label: "Sin actividad reciente", value: data.totals.inactive },
    { label: "Progreso medio", value: `${data.totals.averageProgress}%` },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card-depth rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</p>
            <p
              className={`mt-2 font-display text-3xl font-semibold ${
                c.alert && Number(c.value) > 0 ? "text-destructive" : "text-foreground"
              }`}
            >
              {c.value}
            </p>
          </div>
        ))}
      </div>

      {data.totals.withoutCoach > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" aria-hidden />
          <p className="text-sm text-foreground">
            Hay {data.totals.withoutCoach}{" "}
            {data.totals.withoutCoach === 1 ? "cliente" : "clientes"} sin coach asignado.
            Asígnalos desde la sección Clientes.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-depth rounded-2xl p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
            <CalendarClock className="h-4 w-4 text-primary" aria-hidden />
            Próximas sesiones 1:1
          </h2>
          {data.upcomingSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay sesiones programadas.</p>
          ) : (
            <ul className="space-y-3">
              {data.upcomingSessions.map((s) => (
                <li key={s.id} className="flex justify-between gap-3 text-sm">
                  <span className="text-foreground">{s.clientName ?? "Sin nombre"}</span>
                  <span className="text-muted-foreground">
                    Fase {s.phaseNumber} · {fmtDate(s.scheduledAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-depth rounded-2xl p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
            <Users className="h-4 w-4 text-primary" aria-hidden />
            Últimos clientes creados
          </h2>
          {data.clients.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavía no hay clientes.</p>
          ) : (
            <ul className="space-y-3">
              {data.clients.slice(0, 6).map((c) => (
                <li key={c.id} className="flex justify-between gap-3 text-sm">
                  <span className="text-foreground">{c.fullName ?? "Sin nombre"}</span>
                  <span className="text-muted-foreground">{fmtDate(c.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Clientes ----------------------------- */

function ClientsSection({ data, onChanged }: { data: Overview; onChanged: () => Promise<unknown> }) {
  const callCreate = useServerFn(adminCreateClient);
  const callAssign = useServerFn(adminAssignCoach);
  const callStatus = useServerFn(adminSetAccountStatus);

  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    startDate: "",
    coachId: "",
    adminNotes: "",
  });

  const [search, setSearch] = useState("");
  const [coachFilter, setCoachFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [flagsOnly, setFlagsOnly] = useState(false);
  const [withoutCoachOnly, setWithoutCoachOnly] = useState(false);

  const [confirm, setConfirm] = useState<{
    clientId: string;
    clientName: string;
    previousCoach: string | null;
    newCoachId: string | null;
    newCoachName: string | null;
  } | null>(null);

  const filtered = useMemo(
    () =>
      data.clients.filter((c) => {
        const term = search.trim().toLowerCase();
        if (term && !(c.fullName ?? "").toLowerCase().includes(term)) return false;
        if (coachFilter && c.coachId !== coachFilter) return false;
        if (statusFilter && c.status !== statusFilter) return false;
        if (flagsOnly && c.openFlags === 0) return false;
        if (withoutCoachOnly && c.coachId) return false;
        return true;
      }),
    [data.clients, search, coachFilter, statusFilter, flagsOnly, withoutCoachOnly],
  );

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (creating) return;
    setCreating(true);
    try {
      const result = await callCreate({
        data: {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          programStartDate: form.startDate,
          coachId: form.coachId || null,
          adminNotes: form.adminNotes.trim() || undefined,
        },
      });
      if (result.withoutCoach) {
        toast.warning(`«${form.fullName.trim()}» se ha creado sin coach asignado.`);
      } else {
        toast.success(`Cliente «${form.fullName.trim()}» creado y asignado.`);
      }
      setShowForm(false);
      setForm({ fullName: "", email: "", password: "", startDate: "", coachId: "", adminNotes: "" });
      await onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el cliente.");
    } finally {
      setCreating(false);
    }
  }

  async function applyAssignment() {
    if (!confirm) return;
    try {
      await callAssign({ data: { clientId: confirm.clientId, coachId: confirm.newCoachId } });
      toast.success("Asignación actualizada.");
      setConfirm(null);
      await onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cambiar el coach.");
    }
  }

  async function changeStatus(userId: string, status: "active" | "inactive" | "blocked") {
    try {
      await callStatus({ data: { targetUserId: userId, status } });
      toast.success("Estado de la cuenta actualizado.");
      await onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cambiar el estado.");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-input bg-secondary px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-ring";

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="ember-glow inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <UserPlus className="h-4 w-4" aria-hidden />
          Nuevo cliente
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card-depth grid gap-4 rounded-2xl p-6 sm:grid-cols-2">
          <h2 className="font-display text-lg font-semibold text-foreground sm:col-span-2">
            Nuevo cliente
          </h2>
          <input
            required
            placeholder="Nombre completo"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className={inputClass}
          />
          <input
            required
            type="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
          />
          <input
            required
            minLength={8}
            placeholder="Contraseña temporal"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={inputClass}
          />
          <input
            required
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className={inputClass}
          />
          <select
            value={form.coachId}
            onChange={(e) => setForm({ ...form, coachId: e.target.value })}
            className={inputClass}
          >
            <option value="">Sin coach asignado</option>
            {data.coaches.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName ?? "Sin nombre"}
              </option>
            ))}
          </select>
          <input
            placeholder="Notas administrativas (opcional)"
            value={form.adminNotes}
            onChange={(e) => setForm({ ...form, adminNotes: e.target.value })}
            className={inputClass}
          />
          <div className="flex gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {creating ? "Creando…" : "Crear cliente"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="card-depth grid gap-3 rounded-2xl p-5 sm:grid-cols-3">
        <input
          placeholder="Buscar por nombre"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={inputClass}
        />
        <select
          value={coachFilter}
          onChange={(e) => setCoachFilter(e.target.value)}
          className={inputClass}
        >
          <option value="">Todos los coaches</option>
          {data.coaches.map((c) => (
            <option key={c.id} value={c.id}>
              {c.fullName ?? "Sin nombre"}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={inputClass}
        >
          <option value="">Todos los estados</option>
          <option value="active">Activa</option>
          <option value="inactive">Inactiva</option>
          <option value="blocked">Bloqueada</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={flagsOnly} onChange={(e) => setFlagsOnly(e.target.checked)} />
          Solo con avisos abiertos
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={withoutCoachOnly}
            onChange={(e) => setWithoutCoachOnly(e.target.checked)}
          />
          Solo sin coach asignado
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="card-depth rounded-2xl p-10 text-center text-sm text-muted-foreground">
          No hay clientes que coincidan con los filtros.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const coachName = c.coachName ?? "Sin coach asignado";
            return (
              <div key={c.id} className="card-depth rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-lg font-semibold text-foreground">
                      {c.fullName ?? "Sin nombre"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {coachName} · alta {fmtDate(c.createdAt)} · última actividad{" "}
                      {fmtDate(c.lastActiveAt)} · {c.completedModules}/8 módulos
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {c.openFlags > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-1 text-[11px] font-medium text-destructive">
                        <Flag className="h-3 w-3" aria-hidden />
                        {c.openFlags} requiere atención
                      </span>
                    )}
                    <span className="rounded-full bg-accent px-2 py-1 text-[11px] text-muted-foreground">
                      {STATUS_LABEL[c.status] ?? c.status}
                    </span>
                    <Link
                      to="/coach/clientes/$clientId"
                      params={{ clientId: c.id }}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary"
                    >
                      Ver detalle <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <select
                    value={c.coachId ?? ""}
                    onChange={(e) => {
                      const newCoachId = e.target.value || null;
                      setConfirm({
                        clientId: c.id,
                        clientName: c.fullName ?? "Sin nombre",
                        previousCoach: c.coachName,
                        newCoachId,
                        newCoachName:
                          data.coaches.find((x) => x.id === newCoachId)?.fullName ?? null,
                      });
                    }}
                    className="rounded-lg border border-input bg-secondary px-3 py-2 text-xs text-foreground"
                  >
                    <option value="">Sin coach asignado</option>
                    {data.coaches.map((co) => (
                      <option key={co.id} value={co.id}>
                        {co.fullName ?? "Sin nombre"}
                      </option>
                    ))}
                  </select>
                  <select
                    value={c.status}
                    onChange={(e) =>
                      changeStatus(c.id, e.target.value as "active" | "inactive" | "blocked")
                    }
                    className="rounded-lg border border-input bg-secondary px-3 py-2 text-xs text-foreground"
                  >
                    <option value="active">Activa</option>
                    <option value="inactive">Inactiva</option>
                    <option value="blocked">Bloqueada</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4">
          <div className="card-depth w-full max-w-md rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold text-foreground">
              {confirm.newCoachId ? "Cambiar coach" : "Retirar coach"}
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">Cliente:</strong> {confirm.clientName}
              </li>
              <li>
                <strong className="text-foreground">Coach anterior:</strong>{" "}
                {confirm.previousCoach ?? "Sin coach asignado"}
              </li>
              <li>
                <strong className="text-foreground">Nuevo coach:</strong>{" "}
                {confirm.newCoachName ?? "Sin coach asignado"}
              </li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              El coach anterior dejará de ver a este cliente y el nuevo obtendrá acceso. El
              progreso, los módulos y los entregables se conservan, y el cambio queda registrado.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={applyAssignment}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Confirmar cambio
              </button>
              <button
                onClick={() => setConfirm(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------- Coaches ----------------------------- */

function CoachesSection({ data, onChanged }: { data: Overview; onChanged: () => Promise<unknown> }) {
  const callCreate = useServerFn(adminCreateCoach);
  const callStatus = useServerFn(adminSetAccountStatus);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    timezone: "",
    status: "active" as "active" | "inactive",
  });

  const inputClass =
    "w-full rounded-lg border border-input bg-secondary px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-ring";

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (creating) return;
    setCreating(true);
    try {
      await callCreate({
        data: {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          timezone: form.timezone.trim() || undefined,
          status: form.status,
        },
      });
      toast.success(`Coach «${form.fullName.trim()}» creado.`);
      setShowForm(false);
      setForm({ fullName: "", email: "", password: "", timezone: "", status: "active" });
      await onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el coach.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="ember-glow inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <UserPlus className="h-4 w-4" aria-hidden />
          Nuevo coach
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card-depth grid gap-4 rounded-2xl p-6 sm:grid-cols-2">
          <h2 className="font-display text-lg font-semibold text-foreground sm:col-span-2">
            Nuevo coach
          </h2>
          <input
            required
            placeholder="Nombre completo"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className={inputClass}
          />
          <input
            required
            type="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
          />
          <input
            required
            minLength={8}
            placeholder="Contraseña temporal"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={inputClass}
          />
          <input
            placeholder="Zona horaria (opcional)"
            value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            className={inputClass}
          />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}
            className={inputClass}
          >
            <option value="active">Estado inicial: activa</option>
            <option value="inactive">Estado inicial: inactiva</option>
          </select>
          <div className="flex gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {creating ? "Creando…" : "Crear coach"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {data.coaches.length === 0 ? (
        <div className="card-depth rounded-2xl p-10 text-center text-sm text-muted-foreground">
          Todavía no hay coaches.
        </div>
      ) : (
        <div className="space-y-3">
          {data.coaches.map((c) => (
            <div key={c.id} className="card-depth flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
              <div>
                <p className="font-display text-lg font-semibold text-foreground">
                  {c.fullName ?? "Sin nombre"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {c.activeClients} clientes asignados · {c.openFlags} avisos pendientes
                </p>
              </div>
              <select
                value={c.status}
                onChange={async (e) => {
                  try {
                    await callStatus({
                      data: {
                        targetUserId: c.id,
                        status: e.target.value as "active" | "inactive" | "blocked",
                      },
                    });
                    toast.success("Estado actualizado.");
                    await onChanged();
                  } catch (error) {
                    toast.error(
                      error instanceof Error ? error.message : "No se pudo cambiar el estado.",
                    );
                  }
                }}
                className="rounded-lg border border-input bg-secondary px-3 py-2 text-xs text-foreground"
              >
                <option value="active">Activa</option>
                <option value="inactive">Inactiva</option>
                <option value="blocked">Bloqueada</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------- Asignaciones --------------------------- */

function AssignmentsSection({ data }: { data: Overview }) {
  if (data.assignments.length === 0) {
    return (
      <div className="card-depth rounded-2xl p-10 text-center text-sm text-muted-foreground">
        Todavía no hay asignaciones.
      </div>
    );
  }
  return (
    <div className="card-depth overflow-hidden rounded-2xl">
      <table className="w-full text-left text-sm">
        <thead className="bg-accent/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-5 py-3">Cliente</th>
            <th className="px-5 py-3">Coach</th>
            <th className="px-5 py-3">Estado</th>
            <th className="px-5 py-3">Asignado</th>
            <th className="px-5 py-3">Retirado</th>
          </tr>
        </thead>
        <tbody>
          {data.assignments.map((a) => (
            <tr key={a.id} className="border-t border-border">
              <td className="px-5 py-3 text-foreground">{a.clientName ?? "—"}</td>
              <td className="px-5 py-3 text-muted-foreground">{a.coachName ?? "—"}</td>
              <td className="px-5 py-3 text-muted-foreground">
                {a.status === "active" ? "Activa" : "Inactiva"}
              </td>
              <td className="px-5 py-3 text-muted-foreground">{fmtDate(a.assignedAt)}</td>
              <td className="px-5 py-3 text-muted-foreground">{fmtDate(a.unassignedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------ Actividad ---------------------------- */

function ActivitySection() {
  const { data: logs } = useSuspenseQuery(auditQuery);

  if (logs.length === 0) {
    return (
      <div className="card-depth rounded-2xl p-10 text-center text-sm text-muted-foreground">
        Todavía no hay actividad registrada.
      </div>
    );
  }

  return (
    <div className="card-depth rounded-2xl p-6">
      <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
        <History className="h-4 w-4 text-primary" aria-hidden />
        Actividad reciente
      </h2>
      <ul className="space-y-3">
        {logs.map((l) => (
          <li key={l.id} className="flex flex-wrap justify-between gap-2 border-b border-border pb-3 text-sm last:border-0">
            <span className="text-foreground">{l.action}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(l.created_at).toLocaleString("es-ES")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
