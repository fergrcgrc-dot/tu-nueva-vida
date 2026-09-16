import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Modelo fijado en servidor. El frontend nunca envía ni decide el modelo.
 */
const CLAUDE_MODEL = "claude-sonnet-5";

const HistoryMessage = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

const ModuleClaudeInput = z.object({
  moduleId: z.string().uuid(),
  message: z.string().min(1).max(8000),
  history: z.array(HistoryMessage).max(40).optional(),
});

const ModuleReply = z.object({
  message: z.string(),
  should_save_deliverable: z.boolean().default(false),
  deliverable_content: z.string().nullable().default(null),
  flag: z.string().nullable().default(null),
});

export type ModuleClaudeReply = z.infer<typeof ModuleReply>;

/**
 * Error seguro: nunca revela detalles internos, claves ni respuestas del
 * proveedor. El texto es apto para mostrar directamente al usuario.
 */
function safeError(message: string): Error {
  return new Error(message);
}

/**
 * Guía del módulo con Claude. Solo backend: autenticación obligatoria,
 * verificación de acceso al módulo y contexto limitado a los entregables
 * del propio cliente. La clave ANTHROPIC_API_KEY vive en un secreto de
 * backend y nunca aparece en respuestas, registros ni código del navegador.
 */
export const askModuleClaude = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ModuleClaudeInput.parse(input))
  .handler(async ({ data, context }): Promise<ModuleClaudeReply> => {
    const apiKey = process.env["ANTHROPIC_API_KEY"];
    if (!apiKey) {
      throw safeError(
        "Falta configurar el secreto ANTHROPIC_API_KEY en Lovable Cloud.",
      );
    }

    const { supabase, userId } = context;

    // 1) El módulo debe existir.
    const { data: moduleRow, error: moduleError } = await supabase
      .from("modules")
      .select("id, phase_number, phase_name, week_number, title, objective")
      .eq("id", data.moduleId)
      .maybeSingle();
    if (moduleError) throw safeError("No se pudo cargar el módulo.");
    if (!moduleRow) throw safeError("Este módulo no existe.");

    // 2) El cliente solo puede trabajar módulos desbloqueados.
    const { data: progress, error: progressError } = await supabase
      .from("module_progress")
      .select("status")
      .eq("user_id", userId)
      .eq("module_id", data.moduleId)
      .maybeSingle();
    if (progressError) throw safeError("No se pudo comprobar tu progreso.");
    if (!progress || progress.status === "locked") {
      throw safeError("Este módulo todavía está bloqueado.");
    }

    // 3) Contexto: solo entregables previos del propio cliente (RLS refuerza).
    const { data: deliverableRows, error: deliverablesError } = await supabase
      .from("deliverables")
      .select("content, created_at, modules!inner(week_number)")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (deliverablesError) {
      throw safeError("No se pudieron cargar tus entregables anteriores.");
    }

    const previousDeliverables = (deliverableRows ?? [])
      .filter((row) => {
        const week = (row.modules as { week_number?: number } | null)?.week_number;
        return typeof week === "number" && week < moduleRow.week_number;
      })
      .map(
        (row, index) =>
          `Entregable ${index + 1} (semana ${(row.modules as { week_number: number }).week_number}):\n${row.content}`,
      );

    const systemPrompt = [
      "Eres la guía de acompañamiento del programa privado de desarrollo personal «Tu Nueva Vida».",
      "Acompañas al cliente dentro del módulo actual con sobriedad, calidez y precisión. Sin tono infantil ni espiritual.",
      `Fase ${moduleRow.phase_number} — «${moduleRow.phase_name}». Semana ${moduleRow.week_number} de 8.`,
      `Módulo: «${moduleRow.title}».`,
      `Objetivo del módulo: ${moduleRow.objective}`,
      previousDeliverables.length > 0
        ? `Entregables anteriores del cliente:\n${previousDeliverables.join("\n\n")}`
        : "El cliente aún no tiene entregables anteriores.",
      "",
      "Responde SIEMPRE con un JSON válido y nada más, con esta forma exacta:",
      '{"message": string, "should_save_deliverable": boolean, "deliverable_content": string | null, "flag": string | null}',
      "- message: tu respuesta al cliente, en español.",
      "- should_save_deliverable / deliverable_content: true solo cuando el cliente haya producido un trabajo completo del módulo que merezca guardarse; el cliente decide guardarlo con una acción explícita.",
      "- flag: null normalmente; un texto breve solo si detectas algo que el coach humano debería revisar.",
    ].join("\n");

    const messages = [
      ...(data.history ?? []).map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: data.message },
    ];

    // 4) Llamada al proveedor con tiempo límite. Nunca registramos la clave
    //    ni devolvemos el cuerpo de error del proveedor al navegador.
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
          max_tokens: 2048,
          system: systemPrompt,
          messages,
        }),
        signal: AbortSignal.timeout(45_000),
      });
    } catch {
      throw safeError(
        "La guía está tardando demasiado. Inténtalo de nuevo en unos segundos.",
      );
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

    let payload: {
      content?: Array<{ type: string; text?: string }>;
    };
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
    if (!text) {
      throw safeError("La respuesta de la guía no fue válida. Inténtalo de nuevo.");
    }

    // 5) La guía responde JSON; si no, tratamos el texto como mensaje simple.
    const jsonCandidate = text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
    try {
      const parsed = ModuleReply.safeParse(JSON.parse(jsonCandidate));
      if (parsed.success) return parsed.data;
    } catch {
      // cae al respaldo de texto plano
    }
    return {
      message: text,
      should_save_deliverable: false,
      deliverable_content: null,
      flag: null,
    };
  });
