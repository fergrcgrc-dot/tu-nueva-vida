/**
 * Utilidades de seguridad solo de servidor: límite de peticiones por usuario
 * y registro de eventos sospechosos en audit_logs (visibles en /admin).
 * Se importan de forma dinámica dentro de los handlers.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/integrations/supabase/types";

type AuthedClient = SupabaseClient<Database>;

export type SecurityEvent =
  | "rate_limited"
  | "admin_access_denied"
  | "webhook_invalid_signature"
  | "webhook_rejected"
  | "inactive_account_access"
  | "crisis_signal";

/** Registra un evento de seguridad. Nunca lanza: el registro no debe romper la petición. */
export async function logSecurityEvent(
  action: SecurityEvent,
  actorUserId: string | null,
  metadata: Record<string, unknown> = {},
) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("audit_logs").insert({
      actor_user_id: actorUserId,
      action: `security.${action}`,
      target_type: "security",
      target_id: actorUserId,
      metadata: metadata as Json,
    });
  } catch {
    console.error(`[security] no se pudo registrar ${action}`);
  }
}

/**
 * Límites por usuario. Pensados para uso humano normal; frenan bots y abuso
 * del coste de IA. Ventanas en segundos.
 */
export const RATE_LIMITS = {
  ai_chat: { max: 20, window: 600 }, // 20 mensajes / 10 min
  ai_chat_day: { max: 150, window: 86_400 }, // 150 mensajes / día
  ai_review: { max: 8, window: 3_600 }, // 8 envíos a revisión / hora
  ai_review_day: { max: 30, window: 86_400 },
  draft_save: { max: 60, window: 600 }, // autoguardado
} as const;

export type RateBucket = keyof typeof RATE_LIMITS;

/** Consume una unidad de cada cubo; si alguno está agotado, registra y lanza. */
export async function enforceRateLimit(
  supabase: AuthedClient,
  userId: string,
  buckets: RateBucket[],
) {
  for (const bucket of buckets) {
    const { max, window } = RATE_LIMITS[bucket];
    const { data, error } = await supabase.rpc("consume_rate_limit", {
      _bucket: bucket,
      _max: max,
      _window_seconds: window,
    });
    if (error) {
      // Si el limitador falla, se deniega (fail closed) para no abrir el coste de IA.
      console.error("[security] limitador no disponible");
      throw new Error("Servicio ocupado. Inténtalo de nuevo en unos minutos.");
    }
    if (data === false) {
      await logSecurityEvent("rate_limited", userId, { bucket, max, window });
      throw new Error(
        window >= 86_400
          ? "Has alcanzado el límite diario. Podrás seguir mañana."
          : "Vas muy rápido. Espera unos minutos y vuelve a intentarlo.",
      );
    }
  }
}
