import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database, Json } from "@/integrations/supabase/types";
import {
  formatAnswers,
  getExerciseSchema,
  validateAnswers,
  type ExerciseAnswers,
  type ListRow,
} from "@/lib/exercise-schemas";
import {
  COACH_PERSONA,
  closesPhase,
  getModuleContent,
  getModuleRubric,
} from "@/lib/module-content";

type AuthedClient = SupabaseClient<Database>;

export type ExerciseFeedback = {
  verdict: "approved" | "needs_revision";
  message: string;
  strengths: string[];
  to_improve: string[];
  phase_review: string | null;
  crisis: boolean;
};

export type SubmissionStatus = Database["public"]["Enums"]["submission_status"];

function safeError(message: string): Error {
  return new Error(message);
}

// Las respuestas son JSON libre validado contra el esquema del módulo.
const AnswersInput = z
  .record(z.string(), z.unknown())
  .refine((v) => JSON.stringify(v).length <= 60_000, "El ejercicio es demasiado largo.");

const ModuleInput = z.object({ moduleId: z.string().uuid() });
const SaveInput = z.object({ moduleId: z.string().uuid(), answers: AnswersInput });

/** Módulo existente y no bloqueado para el propio cliente. */
async function loadAccessibleModule(supabase: AuthedClient, userId: string, moduleId: string) {
  const { data: owner } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", userId)
    .maybeSingle();
  if (owner && owner.status !== "active") {
    throw safeError("Tu acceso al programa no está activo.");
  }
  const { data: moduleRow, error } = await supabase
    .from("modules")
    .select("id, phase_number, phase_name, week_number, title, objective, video_path")
    .eq("id", moduleId)
    .maybeSingle();
  if (error) throw safeError("No se pudo cargar el módulo.");
  if (!moduleRow) throw safeError("Este módulo no existe.");

  const { data: progress } = await supabase
    .from("module_progress")
    .select("status")
    .eq("user_id", userId)
    .eq("module_id", moduleId)
    .maybeSingle();
  if (!progress || progress.status === "locked") {
    throw safeError("Este módulo todavía está bloqueado.");
  }
  return { ...moduleRow, progressStatus: progress.status };
}

/** Ejercicios aprobados de semanas anteriores (perfil acumulado). */
async function loadPreviousWork(supabase: AuthedClient, userId: string, week: number) {
  const { data } = await supabase
    .from("exercise_submissions")
    .select("answers, status, feedback, modules!inner(week_number, title)")
    .eq("user_id", userId)
    .eq("status", "approved");
  return (data ?? [])
    .map((row) => {
      const mod = row.modules as unknown as { week_number: number; title: string };
      return { week: mod.week_number, title: mod.title, answers: row.answers as ExerciseAnswers };
    })
    .filter((r) => r.week < week)
    .sort((a, b) => a.week - b.week);
}

function formatPrevious(prev: Awaited<ReturnType<typeof loadPreviousWork>>): string {
  if (prev.length === 0) return "El usuario aún no tiene ejercicios anteriores.";
  return prev
    .map((p) => {
      const schema = getExerciseSchema(p.week);
      const body = schema ? formatAnswers(schema, p.answers) : JSON.stringify(p.answers);
      return `### Semana ${p.week} · ${p.title}\n${body}`;
    })
    .join("\n\n");
}

/* ------------------------------------------------------------------ */
/* Lectura                                                             */
/* ------------------------------------------------------------------ */

/**
 * Estado del ejercicio del módulo: respuestas guardadas, último feedback,
 * datos precargados de semanas anteriores y URL firmada del vídeo.
 */
export const getExercise = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ModuleInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const moduleRow = await loadAccessibleModule(supabase, userId, data.moduleId);

    const { data: submission } = await supabase
      .from("exercise_submissions")
      .select("answers, status, feedback, attempts, submitted_at, reviewed_at")
      .eq("user_id", userId)
      .eq("module_id", data.moduleId)
      .maybeSingle();

    // Precarga: filas de listas que parten de un ejercicio anterior.
    const prefill: Record<string, ListRow[]> = {};
    const schema = getExerciseSchema(moduleRow.week_number);
    if (schema) {
      const prev = await loadPreviousWork(supabase, userId, moduleRow.week_number);
      for (const section of schema.sections) {
        for (const field of section.fields) {
          if (field.type !== "list" || !field.prefillFrom) continue;
          const src = prev.find((p) => p.week === field.prefillFrom!.week);
          const rows = src?.answers[field.prefillFrom.field];
          if (Array.isArray(rows)) {
            prefill[field.id] = rows
              .map((r) => r[field.prefillFrom!.column])
              .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
              .map((v) => ({ [field.prefillFrom!.into]: v }));
          }
        }
      }
    }

    let videoUrl: string | null = null;
    if (moduleRow.video_path) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: signed } = await supabaseAdmin.storage
        .from("module-videos")
        .createSignedUrl(moduleRow.video_path, 60 * 60 * 4);
      videoUrl = signed?.signedUrl ?? null;
    }

    return {
      week: moduleRow.week_number,
      answers: (submission?.answers ?? {}) as ExerciseAnswers,
      status: (submission?.status ?? "draft") as SubmissionStatus,
      feedback: (submission?.feedback ?? null) as ExerciseFeedback | null,
      attempts: submission?.attempts ?? 0,
      prefill,
      videoUrl,
    };
  });

/* ------------------------------------------------------------------ */
/* Borrador                                                            */
/* ------------------------------------------------------------------ */

export const saveExerciseDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SaveInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const moduleRow = await loadAccessibleModule(supabase, userId, data.moduleId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await supabaseAdmin
      .from("exercise_submissions")
      .select("id, status")
      .eq("user_id", userId)
      .eq("module_id", data.moduleId)
      .maybeSingle();

    if (existing?.status === "approved") {
      throw safeError("Este ejercicio ya está aprobado.");
    }

    if (existing) {
      const { error } = await supabaseAdmin
        .from("exercise_submissions")
        .update({ answers: data.answers as Json })
        .eq("id", existing.id);
      if (error) throw safeError("No se pudo guardar el borrador.");
    } else {
      const { error } = await supabaseAdmin.from("exercise_submissions").insert({
        user_id: userId,
        module_id: data.moduleId,
        answers: data.answers as Json,
        status: "draft",
      });
      if (error) throw safeError("No se pudo guardar el borrador.");
    }

    if (moduleRow.progressStatus === "unlocked") {
      await supabase.rpc("start_module", { _user_id: userId, _module_id: data.moduleId });
    }
    return { ok: true };
  });

/* ------------------------------------------------------------------ */
/* Envío y revisión del coach IA                                       */
/* ------------------------------------------------------------------ */

const ReviewSchema = z.object({
  verdict: z.enum(["approved", "needs_revision"]),
  message: z.string().min(1),
  strengths: z.array(z.string()).default([]),
  to_improve: z.array(z.string()).default([]),
  phase_review: z.string().nullable().default(null),
  flag: z.string().nullable().default(null),
  deliverable: z.string().nullable().default(null),
});

const MAX_ATTEMPTS_BEFORE_ACCEPT = 3;

export const submitExercise = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SaveInput.parse(input))
  .handler(
    async ({
      data,
      context,
    }): Promise<{ status: SubmissionStatus; feedback: ExerciseFeedback }> => {
      const { supabase, userId } = context;
      const moduleRow = await loadAccessibleModule(supabase, userId, data.moduleId);
      const week = moduleRow.week_number;
      const schema = getExerciseSchema(week);
      if (!schema) throw safeError("Este módulo no tiene ejercicio.");

      const answers = data.answers as ExerciseAnswers;
      const problems = validateAnswers(schema, answers);
      if (problems.length > 0) {
        throw safeError(`Antes de enviar: ${problems.slice(0, 3).join(" ")}`);
      }

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { callClaude, parseJsonObject, CRISIS_MESSAGE } = await import("@/lib/ai.server");

      const { data: existing } = await supabaseAdmin
        .from("exercise_submissions")
        .select("id, status, attempts")
        .eq("user_id", userId)
        .eq("module_id", data.moduleId)
        .maybeSingle();
      if (existing?.status === "approved") throw safeError("Este ejercicio ya está aprobado.");
      const attempts = (existing?.attempts ?? 0) + 1;

      const previous = await loadPreviousWork(supabase, userId, week);
      const content = getModuleContent(week);

      const system = [
        COACH_PERSONA,
        `## Tu tarea ahora\nRevisas el ejercicio de la semana ${week} de 8 («${moduleRow.title}», fase ${moduleRow.phase_number}: ${moduleRow.phase_name}). Objetivo del módulo: ${moduleRow.objective}`,
        `## Guía del módulo\n${content.systemPrompt}`,
        `## Rúbrica de evaluación del módulo\n${getModuleRubric(week)}`,
        "## Criterio de aprobación",
        "- Apruebas (approved) si las respuestas son honestas y concretas: ejemplos reales, fechas o momentos, cifras justificadas. No exiges perfección ni respuestas «bonitas».",
        "- Devuelves (needs_revision) si hay respuestas genéricas, evasivas o que no contestan a lo que se pregunta. En to_improve indica exactamente qué pregunta precisar y cómo (máximo 3 puntos).",
        `- Este es el intento ${attempts}. A partir del intento ${MAX_ATTEMPTS_BEFORE_ACCEPT}, aprueba salvo que falte algo imprescindible, y registra la señal de bloqueo en flag.`,
        closesPhase(week)
          ? `- Esta semana cierra la fase ${moduleRow.phase_number}. Si apruebas, escribe en phase_review la revisión de fase: un repaso sobrio de lo que el usuario ha trabajado en las dos semanas de la fase, con sus propias palabras, la tensión principal que queda abierta (si la hay) como pregunta, y qué se lleva a la fase siguiente. Sin felicitaciones.`
          : "- phase_review debe ser null.",
        week === 8
          ? "- Semana 8: si apruebas, deliverable es el informe final del programa (auditoría, coste, valores y mayor distancia, hoguera personal, dirección, plan de hitos, reflexión de cierre y tensiones sin resolver), en markdown."
          : `- Si apruebas, deliverable es el entregable del módulo en markdown, con solo lo que dijo el usuario: ${content.extractionPrompt}`,
        '- flag: null normalmente. "lenguaje_crisis" ante desesperanza sostenida, ideas de hacerse daño o deterioro grave; "bloqueo_repetido" o "contradiccion_no_resuelta" según la rúbrica.',
        "- Si flag es lenguaje_crisis: verdict needs_revision, y message prioriza la seguridad del usuario (recursos 024 y 112), sin pedir más trabajo del ejercicio.",
        "## Formato",
        "Responde SOLO con un JSON válido, sin texto alrededor:",
        '{"verdict": "approved" | "needs_revision", "message": string, "strengths": string[], "to_improve": string[], "phase_review": string | null, "flag": string | null, "deliverable": string | null}',
        "message: tu feedback de coach al usuario, en segunda persona, 80-200 palabras, reflejando el patrón principal que ves con sus palabras literales y terminando con una pregunta abierta para llevarse a la semana.",
      ].join("\n\n");

      const user = [
        `# Perfil acumulado (semanas anteriores)\n${formatPrevious(previous)}`,
        `# Ejercicio de esta semana\n${formatAnswers(schema, answers)}`,
      ].join("\n\n");

      const text = await callClaude(system, [{ role: "user", content: user }], 4000);
      const parsed = ReviewSchema.safeParse(parseJsonObject(text));
      if (!parsed.success) {
        console.error("[review] respuesta no válida del modelo");
        throw safeError("No se pudo completar la revisión. Inténtalo de nuevo.");
      }
      const review = parsed.data;
      const crisis = review.flag?.trim() === "lenguaje_crisis";
      const verdict = crisis ? "needs_revision" : review.verdict;

      const feedback: ExerciseFeedback = {
        verdict,
        message: crisis ? CRISIS_MESSAGE : review.message,
        strengths: crisis ? [] : review.strengths.slice(0, 4),
        to_improve: crisis ? [] : review.to_improve.slice(0, 3),
        phase_review: verdict === "approved" ? review.phase_review : null,
        crisis,
      };
      const status: SubmissionStatus = verdict === "approved" ? "approved" : "needs_revision";
      const now = new Date().toISOString();

      const row = {
        answers: answers as unknown as Json,
        status,
        feedback: feedback as unknown as Json,
        attempts,
        submitted_at: now,
        reviewed_at: now,
      };
      const { error: saveError } = existing
        ? await supabaseAdmin.from("exercise_submissions").update(row).eq("id", existing.id)
        : await supabaseAdmin
            .from("exercise_submissions")
            .insert({ ...row, user_id: userId, module_id: data.moduleId });
      if (saveError) throw safeError("No se pudo guardar la revisión.");

      // Aviso interno (solo admin): nunca hay una persona que responda al
      // cliente, pero el administrador debe saber que hubo una señal seria.
      if (review.flag) {
        await supabaseAdmin.from("flags").insert({
          user_id: userId,
          module_id: data.moduleId,
          trigger_type: review.flag.trim().slice(0, 60),
          status: "open",
          note: `Revisión de ejercicio, semana ${week}, intento ${attempts}.`,
        });
      }

      if (status === "approved") {
        const deliverable = [
          review.deliverable?.trim() || formatAnswers(schema, answers),
          feedback.phase_review ? `\n\n## Revisión de fase\n\n${feedback.phase_review}` : "",
        ].join("");

        const { data: existingDeliverable } = await supabaseAdmin
          .from("deliverables")
          .select("id")
          .eq("user_id", userId)
          .eq("module_id", data.moduleId)
          .maybeSingle();
        if (existingDeliverable) {
          await supabaseAdmin
            .from("deliverables")
            .update({ content: deliverable })
            .eq("id", existingDeliverable.id);
        } else {
          await supabaseAdmin
            .from("deliverables")
            .insert({ user_id: userId, module_id: data.moduleId, content: deliverable });
        }

        const { error: completeError } = await supabaseAdmin.rpc("complete_module", {
          _user_id: userId,
          _module_id: data.moduleId,
        });
        if (completeError) throw safeError("Revisión guardada, pero no se pudo cerrar el módulo.");

        // Semana 8: check-ins automáticos durante los 90 días del plan.
        if (week === 8) {
          const step = answers["frecuencia"] === "quincenal" ? 14 : 7;
          const base = Date.now();
          for (let offset = step; offset <= 90; offset += step) {
            await supabaseAdmin.from("follow_ups").upsert(
              {
                user_id: userId,
                day_offset: offset,
                due_at: new Date(base + offset * 86_400_000).toISOString(),
                status: "pending" as const,
              },
              { onConflict: "user_id,day_offset", ignoreDuplicates: true },
            );
          }
        }
      }

      return { status, feedback };
    },
  );
