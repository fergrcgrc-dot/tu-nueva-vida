import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Lock,
  MessageCircle,
  PenLine,
  PlayCircle,
  RotateCcw,
  Save,
  Send,
  Sparkles,
} from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { ExerciseForm } from "@/components/ExerciseForm";
import { Markdown } from "@/components/Markdown";
import { askModuleClaude } from "@/lib/claude.functions";
import {
  formatAnswers,
  getExerciseSchema,
  validateAnswers,
  type ExerciseAnswers,
  type ExerciseSchema,
  type ListRow,
} from "@/lib/exercise-schemas";
import {
  getExercise,
  saveExerciseDraft,
  submitExercise,
  type ExerciseFeedback,
  type SubmissionStatus,
} from "@/lib/exercise.functions";
import { track } from "@/lib/analytics";
import { getDashboard, getMyRole } from "@/lib/program.functions";

const dashboardQuery = queryOptions({
  queryKey: ["dashboard"],
  queryFn: () => getDashboard(),
});

const exerciseQuery = (moduleId: string) =>
  queryOptions({
    queryKey: ["exercise", moduleId],
    queryFn: () => getExercise({ data: { moduleId } }),
  });

export const Route = createFileRoute("/_authenticated/modulos/$moduleId")({
  params: { parse: (p) => ({ moduleId: String(p.moduleId) }) },
  loader: async ({ context, params }) => {
    const { role } = await getMyRole();
    if (role === "coach") throw redirect({ to: "/coach" });
    const dashboard = await context.queryClient.ensureQueryData(dashboardQuery);
    const module = dashboard.modules.find((m) => m.id === params.moduleId);
    if (!module) throw new Error("Este módulo no existe.");
    if (module.status !== "locked") {
      await context.queryClient.ensureQueryData(exerciseQuery(params.moduleId));
    }
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
  const { data: dashboard } = useSuspenseQuery(dashboardQuery);
  const module = dashboard.modules.find((m) => m.id === moduleId)!;
  const locked = module.status === "locked";

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
            Fase {module.phase_number} · {module.phase_name} · Módulo {module.week_number} de 8
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">{module.title}</h1>
          <p className="mt-3 text-muted-foreground">{module.objective}</p>
        </header>

        {locked ? (
          <div className="card-depth flex items-center gap-3 rounded-2xl p-6">
            <Lock className="h-5 w-5 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">
              Este módulo se abre cuando completes el anterior.
            </p>
          </div>
        ) : (
          <UnlockedModule
            moduleId={moduleId}
            week={module.week_number}
            theory={module.theory_content ?? null}
            instructions={module.exercise_content ?? null}
            nextModuleId={
              dashboard.modules.find((m) => m.week_number === module.week_number + 1)?.id ?? null
            }
          />
        )}
      </main>
    </div>
  );
}

function initialAnswers(
  schema: ExerciseSchema | null,
  stored: ExerciseAnswers,
  prefill: Record<string, ListRow[]>,
): ExerciseAnswers {
  const out = { ...stored };
  for (const [field, rows] of Object.entries(prefill)) {
    const current = out[field];
    if (!Array.isArray(current) || current.length === 0) out[field] = rows;
  }
  // Las listas arrancan con filas vacías para no tener que pulsar «Añadir».
  for (const section of schema?.sections ?? []) {
    for (const field of section.fields) {
      if (field.type !== "list") continue;
      const current = out[field.id];
      if (!Array.isArray(current) || current.length === 0) {
        out[field.id] = Array.from({ length: Math.min(field.min, 5) }, () => ({}));
      }
    }
  }
  return out;
}

function UnlockedModule({
  moduleId,
  week,
  theory,
  instructions,
  nextModuleId,
}: {
  moduleId: string;
  week: number;
  theory: string | null;
  instructions: string | null;
  nextModuleId: string | null;
}) {
  const { data: exercise } = useSuspenseQuery(exerciseQuery(moduleId));
  const queryClient = useQueryClient();
  const schema = getExerciseSchema(week);

  const callSave = useServerFn(saveExerciseDraft);
  const callSubmit = useServerFn(submitExercise);

  const [answers, setAnswers] = useState<ExerciseAnswers>(() =>
    initialAnswers(schema, exercise.answers, exercise.prefill),
  );
  const [status, setStatus] = useState<SubmissionStatus>(exercise.status);
  const [feedback, setFeedback] = useState<ExerciseFeedback | null>(exercise.feedback);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const approved = status === "approved";

  const problems = useMemo(
    () => (schema ? validateAnswers(schema, answers) : []),
    [schema, answers],
  );

  // Autoguardado del borrador 4 s después del último cambio.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!dirty || approved) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void saveDraft(true);
    }, 4000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, dirty, approved]);

  function handleChange(next: ExerciseAnswers) {
    setAnswers(next);
    setDirty(true);
  }

  async function saveDraft(silent = false) {
    if (saving || approved) return;
    setSaving(true);
    try {
      await callSave({ data: { moduleId, answers } });
      setDirty(false);
      if (!silent) toast.success("Borrador guardado.");
    } catch (error) {
      if (!silent) toast.error(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    if (submitting || approved) return;
    if (problems.length > 0) {
      toast.error(problems[0]);
      return;
    }
    setSubmitting(true);
    try {
      const result = await callSubmit({ data: { moduleId, answers } });
      track("exercise_submitted", { module: week, result: result.status });
      if (result.status === "approved") track("module_completed", { module: week });
      setStatus(result.status);
      setFeedback(result.feedback);
      setDirty(false);
      if (result.status === "approved") {
        toast.success("Ejercicio aprobado. Módulo completado.");
        await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      } else if (!result.feedback.crisis) {
        toast("Tu coach IA te pide precisar algunas respuestas.");
      }
      document.getElementById("feedback")?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo enviar.");
    } finally {
      setSubmitting(false);
    }
  }

  const draftText = schema ? formatAnswers(schema, answers) : "";

  return (
    <div className="space-y-8">
      {/* 1. Teoría */}
      <section className="card-depth rounded-2xl p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
          <PlayCircle className="h-5 w-5 text-primary" aria-hidden /> 1 · Teoría
        </h2>
        <div className="mt-4 overflow-hidden rounded-xl bg-secondary">
          {exercise.videoUrl ? (
            <video
              src={exercise.videoUrl}
              controls
              preload="metadata"
              playsInline
              controlsList="nodownload"
              className="aspect-video w-full bg-black"
            />
          ) : (
            <div className="flex aspect-video items-center justify-center p-6 text-center text-sm text-muted-foreground">
              El vídeo de este módulo estará disponible muy pronto. Mientras tanto, tienes la teoría
              completa aquí debajo.
            </div>
          )}
        </div>
        {theory && (
          <details className="group mt-5" open={!exercise.videoUrl}>
            <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
              <BookOpen className="h-4 w-4 text-primary" aria-hidden />
              Leer la teoría
            </summary>
            <div className="mt-4">
              <Markdown content={theory} />
            </div>
          </details>
        )}
      </section>

      {/* 2. Práctica */}
      <section className="card-depth rounded-2xl p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
          <PenLine className="h-5 w-5 text-primary" aria-hidden /> 2 · Ejercicio práctico
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Responde aquí mismo. Se guarda solo mientras escribes. Cuando termines, envíalo y tu coach
          IA lo revisará y te dará feedback.
        </p>
        {instructions && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-foreground">
              Ver instrucciones completas
            </summary>
            <div className="mt-4">
              <Markdown content={instructions} />
            </div>
          </details>
        )}

        {schema ? (
          <div className="mt-6">
            <ExerciseForm
              schema={schema}
              answers={answers}
              onChange={handleChange}
              readOnly={approved || submitting}
            />
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">Este módulo no tiene ejercicio.</p>
        )}

        {!approved && schema && (
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="ember-glow inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" aria-hidden />
              {submitting ? "Tu coach IA está revisando…" : "Enviar a revisión"}
            </button>
            <button
              onClick={() => saveDraft(false)}
              disabled={saving || submitting}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/50 disabled:opacity-50"
            >
              <Save className="h-4 w-4" aria-hidden />
              {saving ? "Guardando…" : "Guardar borrador"}
            </button>
            <span className="text-xs text-muted-foreground">
              {problems.length > 0
                ? `${problems.length} ${problems.length === 1 ? "punto pendiente" : "puntos pendientes"}`
                : "Listo para enviar"}
            </span>
          </div>
        )}
      </section>

      {/* 3. Feedback */}
      {feedback && <FeedbackPanel feedback={feedback} approved={approved} />}

      {approved && (
        <section className="card-depth flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden />
            Módulo completado.
          </p>
          {nextModuleId ? (
            <Link
              to="/modulos/$moduleId"
              params={{ moduleId: nextModuleId }}
              className="ember-glow inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Ir al siguiente módulo <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <Link
              to="/dashboard"
              className="ember-glow inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Ver mi panel <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </section>
      )}

      {/* Coach IA */}
      <CoachChat moduleId={moduleId} draft={draftText} />
    </div>
  );
}

function FeedbackPanel({ feedback, approved }: { feedback: ExerciseFeedback; approved: boolean }) {
  if (feedback.crisis) {
    return (
      <section id="feedback" className="rounded-2xl border-2 border-primary bg-card p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
          <AlertTriangle className="h-5 w-5 text-primary" aria-hidden /> Antes de seguir
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-foreground">{feedback.message}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="tel:024"
            className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Llamar al 024
          </a>
          <a
            href="tel:112"
            className="inline-flex items-center rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground"
          >
            Emergencias 112
          </a>
        </div>
      </section>
    );
  }

  return (
    <section id="feedback" className="card-depth rounded-2xl p-6">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
        <Sparkles className="h-5 w-5 text-primary" aria-hidden /> Feedback de tu coach IA
      </h2>
      <p
        className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
          approved ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"
        }`}
      >
        {approved ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Aprobado
          </>
        ) : (
          <>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Revisa y vuelve a enviar
          </>
        )}
      </p>
      <p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
        {feedback.message}
      </p>
      {feedback.strengths.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-foreground">Lo que está bien trabajado</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {feedback.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
      {feedback.to_improve.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-foreground">Qué precisar</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {feedback.to_improve.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
      {feedback.phase_review && (
        <div className="mt-6 rounded-xl bg-secondary p-5">
          <h3 className="text-sm font-semibold text-foreground">Revisión de fase</h3>
          <div className="mt-2">
            <Markdown content={feedback.phase_review} />
          </div>
        </div>
      )}
    </section>
  );
}

function CoachChat({ moduleId, draft }: { moduleId: string; draft: string }) {
  const callClaude = useServerFn(askModuleClaude);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || sending) return;
    setSending(true);
    setInput("");
    setChat((c) => [...c, { role: "user", content: message }]);
    try {
      const reply = await callClaude({
        data: { moduleId, message, history: chat.slice(-20), draft: draft.slice(0, 30000) },
      });
      setChat((c) => [...c, { role: "assistant", content: reply.message }]);
      if (reply.escalated && reply.escalation_message) {
        toast(reply.escalation_message, { duration: 12000 });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo hablar con tu coach IA.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="card-depth rounded-2xl p-6">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
        <MessageCircle className="h-5 w-5 text-primary" aria-hidden /> Tu coach IA
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        ¿Atascado en una pregunta o con dudas sobre la teoría? Pregunta. Tu coach ve tu borrador y
        conoce tus módulos anteriores.
      </p>
      <div className="mt-4 max-h-96 space-y-4 overflow-y-auto pr-1">
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
        {sending && <p className="text-sm text-muted-foreground">Tu coach está escribiendo…</p>}
      </div>
      <form onSubmit={handleSend} className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe a tu coach IA…"
          className="flex-1 rounded-lg border border-input bg-secondary px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          aria-label="Enviar"
        >
          <Send className="h-4 w-4" aria-hidden />
        </button>
      </form>
      <p className="mt-3 text-xs text-muted-foreground">
        Tu coach IA no sustituye a un profesional de la salud. Si estás pasando por un momento muy
        difícil, llama al 024 (gratuito, 24 h) o al 112.
      </p>
    </section>
  );
}
