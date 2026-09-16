import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getModuleContent } from "@/lib/module-content";
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

const ModuleClaudeInput = z.object({
  moduleId: z.string().uuid(),
  message: z.string().min(1).max(8000),
  history: z.array(HistoryMessage).max(60).optional(),
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

/** Tipos de aviso reconocidos por el equipo de coaching. */
const KNOWN_TRIGGERS: Record<string, string> = {
  malestar_emocional: "Hemos avisado a tu coach. Te responderá en menos de 24 horas.",
  bloqueo_emocional: "Hemos avisado a tu coach. Te contactará en 24 a 48 horas.",
  riesgo_cero: "Tu coach lo explorará contigo en la próxima sesión.",
  empate_decision: "Lo resolveréis juntos en la sesión con tu coach.",
};

/**
 * Error seguro: nunca revela detalles internos, claves ni respuestas del
 * proveedor. El texto es apto para mostrar directamente al usuario.
 */
function safeError(message: string): Error {
  return new Error(message);
}

/** Módulo existente y accesible por el cliente con sesión. */
async function loadAccessibleModule(
  supabase: AuthedClient,
  userId: string,
  moduleId: string,
) {
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
async function loadPreviousDeliverables(
  supabase: AuthedClient,
  userId: string,
  week: number,
) {
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
    throw safeError("Falta configurar el secreto ANTHROPIC_API_KEY en Lovable Cloud.");
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
    const previous = await loadPreviousDeliverables(
      supabase,
      userId,
      moduleRow.week_number,
    );
    const content = getModuleContent(moduleRow.week_number);

    const systemPrompt = [
      content.systemPrompt,
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
      "- flag: null normalmente. Usa exactamente \"malestar_emocional\" (desesperanza, indefensión total, deterioro grave de salud mental o relación en crisis), \"bloqueo_emocional\" (vergüenza intensa, bloqueo total del ejercicio o intento de cerrar la conversación sin completarla), \"riesgo_cero\" (marca como innegociable prácticamente todo, sin margen de riesgo) o \"empate_decision\" (dos narrativas empatadas o resistencia clara a decidir). Usa un texto breve para cualquier otra señal que el coach humano deba revisar.",
    ].join("\n");

    const messages = [
      ...(data.history ?? []).map((m) => ({ role: m.role, content: m.content })),
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

    // Escalado automático al coach humano.
    if (reply.flag) {
      const raw = reply.flag.trim();
      const triggerType = raw in KNOWN_TRIGGERS ? raw : "senal_guia";
      const { error: flagError } = await supabase.from("flags").insert({
        user_id: userId,
        module_id: moduleRow.id,
        trigger_type: triggerType,
        status: "open",
        note: reply.flag.slice(0, 2000),
      });
      if (flagError) console.error("[claude] no se pudo registrar el aviso");
      reply.escalated = true;
      reply.escalation_message =
        KNOWN_TRIGGERS[triggerType] ??
        "Hemos avisado a tu coach. Te responderá en menos de 24 horas.";
    }

    return reply;
  });

const MatrixItem = z.object({
  text: z.string().min(1).max(500),
  nonNegotiable: z.boolean(),
});

const GenerateDeliverableInput = z.object({
  moduleId: z.string().uuid(),
  history: z.array(HistoryMessage).min(1).max(60),
  matrix: z.array(MatrixItem).max(40).optional(),
});

/**
 * Genera el entregable del módulo a partir del historial de la conversación,
 * lo guarda y marca el módulo como completado. Acción explícita del cliente.
 */
export const generateDeliverable = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => GenerateDeliverableInput.parse(input))
  .handler(async ({ data, context }): Promise<{ content: string }> => {
    const { supabase, userId } = context;
    const moduleRow = await loadAccessibleModule(supabase, userId, data.moduleId);
    const content = getModuleContent(moduleRow.week_number);

    const transcript = data.history
      .map((m) => `${m.role === "user" ? "Cliente" : "Guía"}: ${m.content}`)
      .join("\n\n");

    const text = await callClaude(
      [
        `Extraes el entregable del Módulo ${moduleRow.week_number} («${moduleRow.title}») del programa «Tu Nueva Vida».`,
        content.extractionPrompt,
        "Escribe en español, en formato de documento claro con títulos. No inventes datos que el cliente no haya dicho.",
      ].join("\n"),
      [
        {
          role: "user",
          content:
            `Conversación completa:\n\n${transcript}` +
            (data.matrix && data.matrix.length > 0
              ? `\n\nMatriz de decisión completada por el cliente:\n${data.matrix
                  .map(
                    (i) =>
                      `- ${i.text} → ${i.nonNegotiable ? "INNEGOCIABLE" : "dispuesto a arriesgar"}`,
                  )
                  .join("\n")}`
              : ""),
        },
      ],
      3000,
    );

    // Guardar entregable (uno por módulo).
    const { data: existing } = await supabase
      .from("deliverables")
      .select("id")
      .eq("user_id", userId)
      .eq("module_id", data.moduleId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("deliverables")
        .update({ content: text })
        .eq("id", existing.id);
      if (error) throw safeError("No se pudo guardar el entregable.");
    } else {
      const { error } = await supabase
        .from("deliverables")
        .insert({ user_id: userId, module_id: data.moduleId, content: text });
      if (error) throw safeError("No se pudo guardar el entregable.");
    }

    // Completar el módulo (la base de datos valida el estado y desbloquea).
    const { error: completeError } = await supabase.rpc("complete_module", {
      _user_id: userId,
      _module_id: data.moduleId,
    });
    if (completeError) throw safeError("No se pudo completar el módulo.");

    // Al cerrar la fase (semana par), la sesión 1:1 de esa fase queda pendiente.
    if (moduleRow.week_number % 2 === 0) {
      const phase = moduleRow.week_number / 2;
      const { data: session } = await supabase
        .from("sessions_1_1")
        .select("id")
        .eq("user_id", userId)
        .eq("phase_number", phase)
        .maybeSingle();
      if (!session) {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin
          .from("sessions_1_1")
          .insert({ user_id: userId, phase_number: phase, status: "pending" });
      }
    }

    return { content: text };
  });
