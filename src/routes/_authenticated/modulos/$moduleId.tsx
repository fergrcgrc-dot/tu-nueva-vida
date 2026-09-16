import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowLeft, Lock, Save, Send, CheckCircle2, LifeBuoy, FileText } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { DecisionMatrix, type MatrixItem } from "@/components/DecisionMatrix";
import { usesDecisionMatrix } from "@/lib/module-content";
import { askModuleClaude, generateDeliverable } from "@/lib/claude.functions";
import {
  completeModule,
  getDashboard,
  getMyDeliverables,
  getMyRole,
  requestHumanContact,
  saveDeliverable,
  startModule,
} from "@/lib/program.functions";

const moduleQuery = (moduleId: string) =>
  queryOptions({
    queryKey: ["module", moduleId],
    queryFn: async () => {
      const dashboard = await getDashboard();
      const module = dashboard.modules.find((m) => m.id === moduleId);
      if (!module) throw new Error("Este módulo no existe.");
      return module;
    },
  });

export const Route = createFileRoute("/_authenticated/modulos/$moduleId")({
  params: { parse: (p) => ({ moduleId: String(p.moduleId) }) },
  loader: async ({ context, params }) => {
    const { role } = await getMyRole();
    if (role === "coach") throw redirect({ to: "/coach" });
    await context.queryClient.ensureQueryData(moduleQuery(params.moduleId));
  },
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
      <p className="text-sm text-muted-foreground">
        {error instanceof Error ? error.message : "No se pudo cargar el módulo."}
      </p>
      <Link to="/dashboard" className="text-sm font-medium text-primary hover:underline">
        Volver al panel
      </Link>
    </div>
  ),
  component: ModulePage,
});

type ChatMessage = { role: "user" | "assistant"; content: string };

function ModulePage() {
  const { moduleId } = Route.useParams();
  const { data: module } = useSuspenseQuery(moduleQuery(moduleId));
  const queryClient = useQueryClient();

  const callStart = useServerFn(startModule);
  const callComplete = useServerFn(completeModule);
  const callSave = useServerFn(saveDeliverable);
  const callClaude = useServerFn(askModuleClaude);
  const callGenerate = useServerFn(generateDeliverable);
  const callHelp = useServerFn(requestHumanContact);

  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [deliverable, setDeliverable] = useState("");
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [askingHelp, setAskingHelp] = useState(false);
  const [matrix, setMatrix] = useState<MatrixItem[]>([]);
  const showMatrix = usesDecisionMatrix(module.week_number);

  async function handleHumanContact() {
    if (askingHelp) return;
    setAskingHelp(true);
    try {
      await callHelp({ data: { moduleId } });
      toast.success("Aviso enviado. Tu coach te responderá en menos de 24 horas.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo enviar el aviso.");
    } finally {
      setAskingHelp(false);
    }
  }

  async function handleGenerateDeliverable() {
    if (generating || chat.length === 0) return;
    setGenerating(true);
    try {
      const result = await callGenerate({
        data: {
          moduleId,
          history: chat.slice(-60),
          ...(showMatrix && matrix.length > 0
            ? {
                matrix: matrix.map((i) => ({
                  text: i.text,
                  nonNegotiable: i.nonNegotiable,
                })),
              }
            : {}),
        },
      });
      setDeliverable(result.content);
      toast.success("Entregable generado y módulo completado.");
      await queryClient.invalidateQueries();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo generar el entregable.",
      );
    } finally {
      setGenerating(false);
    }
  }

  const locked = module.status === "locked";

  async function ensureStarted() {
    if (module.status === "unlocked") {
      try {
        await callStart({ data: { moduleId } });
      } catch {
        /* ya iniciado */
      }
    }
  }

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || sending) return;
    setSending(true);
    setInput("");
    setChat((c) => [...c, { role: "user", content: message }]);
    try {
      await ensureStarted();
      const reply = await callClaude({
        data: { moduleId, message, history: chat.slice(-20) },
      });
      setChat((c) => [...c, { role: "assistant", content: reply.message }]);
      if (reply.deliverable_content && !deliverable) {
        setDeliverable(reply.deliverable_content);
      }
      if (reply.escalated) {
        toast(
          reply.escalation_message ??
            "Hemos avisado a tu coach. Te responderá en menos de 24 horas.",
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo hablar con la guía.");
    } finally {
      setSending(false);
    }
  }

  async function handleSaveDeliverable() {
    if (!deliverable.trim() || saving) return;
    setSaving(true);
    try {
      await ensureStarted();
      await callSave({ data: { moduleId, content: deliverable.trim() } });
      toast.success("Entregable guardado.");
      await queryClient.invalidateQueries({ queryKey: ["my-deliverables"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleComplete() {
    if (completing) return;
    setCompleting(true);
    try {
      await callComplete({ data: { moduleId } });
      toast.success("Módulo completado. La siguiente semana ya está abierta.");
      await queryClient.invalidateQueries();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo completar.");
    } finally {
      setCompleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader section="Mi programa" />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Volver al panel
        </Link>

        <header className="mb-8">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Fase {module.phase_number} · {module.phase_name} · Semana {module.week_number} de 8
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">{module.title}</h1>
          <p className="mt-3 text-muted-foreground">{module.objective}</p>
          <button
            onClick={handleHumanContact}
            disabled={askingHelp}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50 disabled:opacity-50"
          >
            <LifeBuoy className="h-4 w-4 text-primary" aria-hidden />
            {askingHelp ? "Enviando…" : "Hablar con alguien"}
          </button>
        </header>


        {locked ? (
          <div className="card-depth flex items-center gap-3 rounded-2xl p-6">
            <Lock className="h-5 w-5 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">
              Este módulo está bloqueado. Se abrirá al completar la semana anterior.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Guía del módulo (Claude, solo backend) */}
            <section className="card-depth rounded-2xl p-6">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Guía del módulo
              </h2>
              <div className="mt-4 max-h-96 space-y-4 overflow-y-auto pr-1">
                {chat.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Empieza la conversación: cuenta a tu guía dónde estás en este módulo.
                  </p>
                )}
                {chat.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {m.content}
                  </div>
                ))}
                {sending && (
                  <p className="text-sm text-muted-foreground">La guía está escribiendo…</p>
                )}
              </div>
              <form onSubmit={handleSend} className="mt-4 flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe a tu guía…"
                  className="flex-1 rounded-lg border border-input bg-secondary px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" aria-hidden />
                </button>
              </form>
            </section>

            {/* Entregable */}
            <section className="card-depth rounded-2xl p-6">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Tu entregable
              </h2>
              <textarea
                value={deliverable}
                onChange={(e) => setDeliverable(e.target.value)}
                rows={6}
                placeholder="Recoge aquí tu trabajo de esta semana…"
                className="mt-4 w-full rounded-lg border border-input bg-secondary px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring"
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={handleGenerateDeliverable}
                  disabled={generating || chat.length === 0}
                  className="ember-glow inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <FileText className="h-4 w-4" aria-hidden />
                  {generating ? "Generando…" : "Generar entregable"}
                </button>
                <button
                  onClick={handleSaveDeliverable}
                  disabled={saving || !deliverable.trim()}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" aria-hidden />
                  {saving ? "Guardando…" : "Guardar entregable"}
                </button>
                {module.status !== "completed" && (
                  <button
                    onClick={handleComplete}
                    disabled={completing}
                    className="ember-glow inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                    {completing ? "Completando…" : "Completar módulo"}
                  </button>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
