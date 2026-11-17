import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CHECKIN_CONTENT, COACH_PERSONA, getModuleContent } from "@/lib/module-content";
import type { Database } from "@/integrations/supabase/types";

/**
 * Modelo fijado en servidor. El frontend nunca envía ni decide el modelo.
 */
const CLAUDE_MODEL = "claude-sonnet-5";

type AuthedClient = SupabaseClient<Database>;

const HistoryMessage = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

/** Tope de tamaño total de la conversación que se envía al modelo. */
const MAX_HISTORY_CHARS = 40_000;
function capHistory<T extends { content: string }>(history: T[] | undefined): T[] {
  const out: T[] = [];
  let total = 0;
  for (const m of [...(history ?? [])].reverse()) {
    total += m.content.length;
    if (total > MAX_HISTORY_CHARS) break;
    out.unshift(m);
  }
  return out;
}

const ModuleClaudeInput = z.object({
  moduleId: z.string().uuid(),
  message: z.string().min(1).max(8000),
  history: z.array(HistoryMessage).max(30).optional(),
  /** Borrador actual del ejercicio, en texto, para que el coach lo tenga delante. */
  draft: z.string().max(30000).optional(),
});

const ModuleReply = z.object({
  message: z.string(),
  should_save_deliverable: z.boolean().default(false),
  deliverable_content: z.string().nullable().default(null),
  flag: z.string().nullable().default(null),
});

export type ModuleClaudeReply = z.infer<typeof ModuleReply> & {
  escalated?: boolean;
  escalation_message?: string;
};

/**
 * Señales de la IA, los 4 triggers definidos para todo el programa
 * (documento base, sección 5). "inactividad" no aparece aquí porque no es
 * detectable dentro de un mensaje: se calcula por fecha de última actividad,
 * a nivel de sistema, no por el modelo.
 */
const KNOWN_TRIGGERS: Record<string, string> = {
  lenguaje_crisis:
    "Si sientes que no puedes más, llama ahora al 024 (gratuito, 24 h) o al 112 si es una emergencia.",
  bloqueo_repetido: "",
  contradiccion_no_resuelta: "",
  seguimiento_estancado: "",
};

/**
 * Error seguro: nunca revela detalles internos, claves ni respuestas del
 * proveedor. El texto es apto para mostrar directamente al usuario.
 */
function safeError(message: string): Error {
  return new Error(message);
}

/** Módulo existente y accesible por el cliente con sesión. */
async function loadAccessibleModule(supabase: AuthedClient, userId: string, moduleId: string) {
  const { data: owner } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", userId)
    .maybeSingle();
  if (!owner || owner.status !== "active") {
    throw safeError("Tu acceso al programa no está activo.");
  }
  const { data: moduleRow, error: moduleError } = await supabase
    .from("modules")
    .select("id, phase_number, phase_name, week_number, title, objective")
    .eq("id", moduleId)
    .maybeSingle();
  if (moduleError) throw safeError("No se pudo cargar el módulo.");
  if (!moduleRow) throw safeError("Este módulo no existe.");

  const { data: progress, error: progressError } = await supabase
    .from("module_progress")
    .select("status")
    .eq("user_id", userId)
    .eq("module_id", moduleId)
    .maybeSingle();
  if (progressError) throw safeError("No se pudo comprobar tu progreso.");
  if (!progress || progress.status === "locked") {
    throw safeError("Este módulo todavía está bloqueado.");
  }
  return moduleRow;
}

/** Entregables anteriores del propio cliente (RLS refuerza la propiedad). */
async function loadPreviousDeliverables(supabase: AuthedClient, userId: string, week: number) {
  const { data, error } = await supabase
    .from("deliverables")
    .select("content, created_at, modules!inner(week_number)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw safeError("No se pudieron cargar tus entregables anteriores.");

  return (data ?? [])
    .filter((row) => {
      const w = (row.modules as { week_number?: number } | null)?.week_number;
      return typeof w === "number" && w < week;
    })
    .map(
      (row, index) =>
        `Entregable ${index + 1} (semana ${(row.modules as { week_number: number }).week_number}):\n${row.content}`,
    );
}

/** Llamada al proveedor. Nunca registra ni devuelve la clave. */
async function callClaude(
  system: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  maxTokens = 2048,
): Promise<string> {
  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) {
    throw safeError("Falta configurar el secreto ANTHROPIC_API_KEY en el hosting.");
  }

  let res: Response;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: maxTokens,
        system,
        messages,
      }),
      signal: AbortSignal.timeout(45_000),
    });
  } catch {
    throw safeError("La guía está tardando demasiado. Inténtalo de nuevo en unos segundos.");
  }

  if (!res.ok) {
    if (res.status === 429) {
      throw safeError(
        "Se ha alcanzado el límite de uso por ahora. Espera un momento e inténtalo de nuevo.",
      );
    }
    console.error(`[claude] Anthropic respondió ${res.status}`);
    throw safeError("No se pudo conectar con la guía. Inténtalo de nuevo.");
  }

  let payload: { content?: Array<{ type: string; text?: string }> };
  try {
    payload = (await res.json()) as typeof payload;
  } catch {
    throw safeError("La respuesta de la guía no fue válida. Inténtalo de nuevo.");
  }

  const text = (payload.content ?? [])
    .filter((part) => part.type === "text" && part.text)
    .map((part) => part.text)
    .join("\n")
    .trim();
  if (!text) throw safeError("La respuesta de la guía no fue válida. Inténtalo de nuevo.");
  return text;
}

/**
 * Guía del módulo. Solo backend: autenticación obligatoria, verificación de
 * acceso al módulo y contexto limitado a los entregables del propio cliente.
 */
export const askModuleClaude = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ModuleClaudeInput.parse(input))
  .handler(async ({ data, context }): Promise<ModuleClaudeReply> => {
    const { supabase, userId } = context;
    const moduleRow = await loadAccessibleModule(supabase, userId, data.moduleId);
    const { enforceRateLimit } = await import("@/lib/security.server");
    await enforceRateLimit(supabase, userId, ["ai_chat", "ai_chat_day"]);
    const previous = await loadPreviousDeliverables(supabase, userId, moduleRow.week_number);
    const content = getModuleContent(moduleRow.week_number);

    const systemPrompt = [
      COACH_PERSONA,
      "",
      "## Tu papel en este chat",
      "El usuario está trabajando el módulo dentro de la plataforma: ve el vídeo y la teoría, y rellena un ejercicio escrito que luego envía a revisión. Aquí le acompañas mientras lo hace: le ayudas a desatascarse con preguntas, a concretar respuestas genéricas y a entender la teoría. No escribes las respuestas del ejercicio por él ni le dices qué contestar.",
      "",
      `## Guía del módulo\n${content.systemPrompt}`,
      "",
      data.draft
        ? `## Borrador actual del ejercicio del usuario\n${data.draft}`
        : "El usuario todavía no ha escrito nada en el ejercicio.",
      "",
      `Contexto del programa: «Tu Nueva Vida». Fase ${moduleRow.phase_number} — «${moduleRow.phase_name}». Semana ${moduleRow.week_number} de 8. Módulo: «${moduleRow.title}». Objetivo: ${moduleRow.objective}`,
      previous.length > 0
        ? `Entregables anteriores del propio cliente:\n${previous.join("\n\n")}`
        : "El cliente aún no tiene entregables anteriores.",
      "",
      "Responde SIEMPRE con un JSON válido y nada más, con esta forma exacta:",
      '{"message": string, "should_save_deliverable": boolean, "deliverable_content": string | null, "flag": string | null}',
      "- message: tu respuesta al cliente, en español.",
      "- should_save_deliverable: true solo cuando la conversación del módulo esté completa; el cliente decide guardarlo con una acción explícita.",
      '- flag: null normalmente. Usa exactamente "lenguaje_crisis" (desesperanza sostenida, indefensión total, deterioro grave de salud mental), "bloqueo_repetido" (misma respuesta vacía o genérica en 2 o más preguntas pese a la repregunta), o "contradiccion_no_resuelta" (discrepancia fuerte entre lo declarado ahora y el perfil acumulado del usuario, no reconocida pese a señalarla una vez). No uses otros valores.',
    ].join("\n");

    const messages = [
      ...capHistory(data.history).map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: data.message },
    ];

    const text = await callClaude(systemPrompt, messages);

    const jsonCandidate = text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
    let reply: ModuleClaudeReply = {
      message: text,
      should_save_deliverable: false,
      deliverable_content: null,
      flag: null,
    };
    try {
      const parsed = ModuleReply.safeParse(JSON.parse(jsonCandidate));
      if (parsed.success) reply = parsed.data;
    } catch {
      // respaldo de texto plano
    }

    // Señal registrada para el administrador (no hay coach humano).
    if (reply.flag) {
      const raw = reply.flag.trim();
      const triggerType = raw in KNOWN_TRIGGERS ? raw : "senal_guia";
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error: flagError } = await supabaseAdmin.from("flags").insert({
        user_id: userId,
        module_id: moduleRow.id,
        trigger_type: triggerType,
        status: "open",
        note: reply.flag.slice(0, 2000),
      });
      if (flagError) console.error("[claude] no se pudo registrar el aviso");
      const notice = KNOWN_TRIGGERS[triggerType];
      if (notice) {
        reply.escalated = true;
        reply.escalation_message = notice;
      }
    }

    return reply;
  });

/* ------------------------------------------------------------------ */
/* Check-ins de seguimiento del plan a 90 días                          */
/* ------------------------------------------------------------------ */

const FollowUpChatInput = z.object({
  followUpId: z.string().uuid(),
  message: z.string().min(1).max(8000),
  history: z.array(HistoryMessage).max(40).optional(),
});

/** Comprueba que el seguimiento es del propio cliente y está disponible. */
async function loadFollowUp(supabase: AuthedClient, userId: string, id: string) {
  const { data: owner } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", userId)
    .maybeSingle();
  if (!owner || owner.status !== "active") {
    throw safeError("Tu acceso al programa no está activo.");
  }
  const { data, error } = await supabase
    .from("follow_ups")
    .select("id, day_offset, due_at, status")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw safeError("No se pudo cargar el seguimiento.");
  if (!data) throw safeError("Este seguimiento no existe.");
  return data;
}

/** Check-in breve por IA sobre el plan a 90 días. */
export const askFollowUpClaude = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => FollowUpChatInput.parse(input))
  .handler(async ({ data, context }): Promise<ModuleClaudeReply> => {
    const { supabase, userId } = context;
    const followUp = await loadFollowUp(supabase, userId, data.followUpId);
    const { enforceRateLimit } = await import("@/lib/security.server");
    await enforceRateLimit(supabase, userId, ["ai_chat", "ai_chat_day"]);

    const previous = await loadPreviousDeliverables(supabase, userId, 9);

    const systemPrompt = [
      COACH_PERSONA,
      "",
      CHECKIN_CONTENT.systemPrompt,
      "",
      `Este es el check-in de los ${followUp.day_offset} días posteriores al cierre del programa «Tu Nueva Vida».`,
      previous.length > 0
        ? `Entregables del propio cliente, incluida su hoja de ruta a 90 días:\n${previous.join("\n\n")}`
        : "El cliente no tiene entregables guardados.",
      "",
      "Responde SIEMPRE con un JSON válido y nada más, con esta forma exacta:",
      '{"message": string, "should_save_deliverable": boolean, "deliverable_content": string | null, "flag": string | null}',
      "- message: tu respuesta al cliente, en español.",
      '- flag: null normalmente, o exactamente "seguimiento_estancado" si el plan está parado o hay hitos estancados.',
    ].join("\n");

    const text = await callClaude(systemPrompt, [
      ...capHistory(data.history).map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: data.message },
    ]);

    const jsonCandidate = text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
    let reply: ModuleClaudeReply = {
      message: text,
      should_save_deliverable: false,
      deliverable_content: null,
      flag: null,
    };
    try {
      const parsed = ModuleReply.safeParse(JSON.parse(jsonCandidate));
      if (parsed.success) reply = parsed.data;
    } catch {
      // respaldo de texto plano
    }

    if (reply.flag) {
      const raw = reply.flag.trim();
      const triggerType = raw in KNOWN_TRIGGERS ? raw : "seguimiento_estancado";
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error: flagError } = await supabaseAdmin.from("flags").insert({
        user_id: userId,
        module_id: null,
        trigger_type: triggerType,
        status: "open",
        note: `Seguimiento de ${followUp.day_offset} días: ${reply.flag.slice(0, 1800)}`,
      });
      if (flagError) console.error("[claude] no se pudo registrar el aviso de seguimiento");
      const notice = KNOWN_TRIGGERS[triggerType];
      if (notice) {
        reply.escalated = true;
        reply.escalation_message = notice;
      }
    }

    return reply;
  });

const CloseFollowUpInput = z.object({
  followUpId: z.string().uuid(),
  history: z.array(HistoryMessage).min(1).max(40),
});

/** Cierra el check-in guardando un resumen breve en el perfil del usuario. */
export const closeFollowUp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CloseFollowUpInput.parse(input))
  .handler(async ({ data, context }): Promise<{ summary: string }> => {
    const { supabase, userId } = context;
    const followUp = await loadFollowUp(supabase, userId, data.followUpId);
    const { enforceRateLimit } = await import("@/lib/security.server");
    await enforceRateLimit(supabase, userId, ["ai_chat", "ai_chat_day"]);

    const transcript = data.history
      .map((m) => `${m.role === "user" ? "Cliente" : "Guía"}: ${m.content}`)
      .join("\n\n");

    const summary = await callClaude(
      CHECKIN_CONTENT.extractionPrompt,
      [{ role: "user", content: `Conversación del check-in:\n\n${transcript}` }],
      800,
    );

    const { error } = await supabase
      .from("follow_ups")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        summary,
      })
      .eq("id", followUp.id);
    if (error) throw safeError("No se pudo cerrar el seguimiento.");

    return { summary };
  });
