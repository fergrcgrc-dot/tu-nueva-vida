import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

type AuthedClient = SupabaseClient<Database>;

function safeError(message: string): Error {
  return new Error(message);
}

/* ------------------------------------------------------------------ */
/* Rol y sesión                                                        */
/* ------------------------------------------------------------------ */

export type AppRole = "client" | "coach" | "platform_admin";

/** Rol real del usuario con sesión, leído desde user_roles. */
export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ role: AppRole; status: string }> => {
    const [adminRes, coachRes, profileRes] = await Promise.all([
      context.supabase.rpc("is_platform_admin", { _user_id: context.userId }),
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "coach" }),
      context.supabase
        .from("profiles")
        .select("status")
        .eq("id", context.userId)
        .maybeSingle(),
    ]);
    const role: AppRole = adminRes.data
      ? "platform_admin"
      : coachRes.data
        ? "coach"
        : "client";
    return { role, status: profileRes.data?.status ?? "active" };
  });

/* ------------------------------------------------------------------ */
/* Panel del cliente                                                   */
/* ------------------------------------------------------------------ */

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [profileRes, modulesRes, progressRes, sessionsRes, followUpsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, program_start_date")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("modules")
        .select(
          "id, phase_number, phase_name, week_number, title, objective, theory_content, slides_content, exercise_content",
        )
        .order("week_number", { ascending: true }),
      supabase
        .from("module_progress")
        .select("module_id, status, started_at, completed_at")
        .eq("user_id", userId),
      supabase
        .from("sessions_1_1")
        .select("id, phase_number, scheduled_at, status")
        .eq("user_id", userId)
        .order("phase_number", { ascending: true }),
      supabase
        .from("follow_ups")
        .select("id, day_offset, due_at, status")
        .eq("user_id", userId)
        .order("day_offset", { ascending: true }),
    ]);

    if (
      profileRes.error || modulesRes.error || progressRes.error ||
      sessionsRes.error || followUpsRes.error
    ) {
      throw safeError("No se pudo cargar tu programa.");
    }

    const progressByModule = new Map(
      (progressRes.data ?? []).map((p) => [p.module_id, p]),
    );

    const modules = (modulesRes.data ?? []).map((m) => ({
      ...m,
      status: progressByModule.get(m.id)?.status ?? "locked",
      started_at: progressByModule.get(m.id)?.started_at ?? null,
      completed_at: progressByModule.get(m.id)?.completed_at ?? null,
    }));

    const nextSession =
      (sessionsRes.data ?? []).find(
        (s) => s.status === "scheduled" && s.scheduled_at && new Date(s.scheduled_at) >= new Date(),
      ) ??
      (sessionsRes.data ?? []).find((s) => s.status === "pending") ??
      null;

    return {
      profile: profileRes.data ?? null,
      modules,
      nextSession,
      followUps: followUpsRes.data ?? [],
    };
  });

const ModuleIdInput = z.object({ moduleId: z.string().uuid() });

/** Marca un módulo desbloqueado como en curso (validado en base de datos). */
export const startModule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ModuleIdInput.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("start_module", {
      _user_id: context.userId,
      _module_id: data.moduleId,
    });
    if (error) throw safeError("No se pudo iniciar el módulo.");
    return { ok: true };
  });

/**
 * Completa un módulo. La lógica (estado válido, desbloqueo de la semana
 * siguiente) vive íntegramente en la función de base de datos; desde el
 * navegador no se puede saltar ninguna semana.
 */
export const completeModule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ModuleIdInput.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("complete_module", {
      _user_id: context.userId,
      _module_id: data.moduleId,
    });
    if (error) {
      if (error.message.includes("module_locked")) {
        throw safeError("Este módulo todavía está bloqueado.");
      }
      throw safeError("No se pudo completar el módulo.");
    }
    return { ok: true };
  });

const SaveDeliverableInput = z.object({
  moduleId: z.string().uuid(),
  content: z.string().min(1).max(20000),
});

/** Guarda el entregable del módulo (acción explícita del cliente). */
export const saveDeliverable = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SaveDeliverableInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Solo en módulos no bloqueados.
    const { data: progress } = await supabase
      .from("module_progress")
      .select("status")
      .eq("user_id", userId)
      .eq("module_id", data.moduleId)
      .maybeSingle();
    if (!progress || progress.status === "locked") {
      throw safeError("Este módulo todavía está bloqueado.");
    }

    const { data: existing } = await supabase
      .from("deliverables")
      .select("id")
      .eq("user_id", userId)
      .eq("module_id", data.moduleId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("deliverables")
        .update({ content: data.content })
        .eq("id", existing.id);
      if (error) throw safeError("No se pudo guardar el entregable.");
      return { ok: true, deliverableId: existing.id };
    }

    const { data: inserted, error } = await supabase
      .from("deliverables")
      .insert({ user_id: userId, module_id: data.moduleId, content: data.content })
      .select("id")
      .single();
    if (error) throw safeError("No se pudo guardar el entregable.");
    return { ok: true, deliverableId: inserted.id as string };
  });

/** Entregables del propio cliente (para saber cuáles módulos tienen trabajo guardado). */
export const getMyDeliverables = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("deliverables")
      .select("id, module_id, content, updated_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true });
    if (error) throw safeError("No se pudieron cargar tus entregables.");
    return data ?? [];
  });

/** "Hablar con alguien": crea un aviso abierto para el coach humano. */
export const requestHumanContact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ moduleId: z.string().uuid().nullable().optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("flags").insert({
      user_id: context.userId,
      module_id: data.moduleId ?? null,
      trigger_type: "solicitud_explicita",
      status: "open",
      note: "El cliente ha pedido hablar con una persona.",
    });
    if (error) throw safeError("No se pudo enviar tu solicitud. Inténtalo de nuevo.");
    return { ok: true };
  });

/* ------------------------------------------------------------------ */
/* Panel del coach                                                     */
/* ------------------------------------------------------------------ */

/**
 * Autorización del panel de coach: rol comprobado en base de datos y cuenta
 * activa. Un coach desactivado o bloqueado no accede a ningún dato.
 */
async function assertCoach(supabase: AuthedClient, userId: string) {
  const [roleRes, adminRes, profileRes] = await Promise.all([
    supabase.rpc("has_role", { _user_id: userId, _role: "coach" }),
    supabase.rpc("is_platform_admin", { _user_id: userId }),
    supabase.from("profiles").select("status").eq("id", userId).maybeSingle(),
  ]);
  if (!roleRes.data && !adminRes.data) {
    throw safeError("No tienes permiso para ver esta sección.");
  }
  if (profileRes.data && profileRes.data.status !== "active") {
    throw safeError("Tu cuenta no está activa. Contacta con el administrador.");
  }
}

/** Asignaciones activas del coach (el histórico inactivo no da acceso). */
async function activeClientIds(supabase: AuthedClient, coachId: string) {
  const { data, error } = await supabase
    .from("coach_clients")
    .select("client_id, profiles:client_id(full_name, program_start_date)")
    .eq("coach_id", coachId)
    .eq("status", "active")
    .is("unassigned_at", null);
  if (error) throw safeError("No se pudieron cargar los clientes.");
  return data ?? [];
}

export const getCoachClients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertCoach(supabase, userId);

    const assignments = await activeClientIds(supabase, userId);

    const clientIds = (assignments ?? []).map((a) => a.client_id);
    if (clientIds.length === 0) return [];

    const [progressRes, flagsRes] = await Promise.all([
      supabase
        .from("module_progress")
        .select("user_id, status, modules:module_id(week_number)")
        .in("user_id", clientIds),
      supabase.from("flags").select("user_id, status").in("user_id", clientIds),
    ]);
    if (progressRes.error || flagsRes.error) {
      throw safeError("No se pudieron cargar las métricas.");
    }

    return (assignments ?? []).map((a) => {
      const rows = (progressRes.data ?? []).filter((p) => p.user_id === a.client_id);
      const completed = rows.filter((p) => p.status === "completed");
      const currentWeek =
        rows
          .filter((p) => p.status === "in_progress" || p.status === "unlocked")
          .map((p) => (p.modules as { week_number: number } | null)?.week_number ?? 0)
          .sort((x, y) => x - y)[0] ?? null;
      const openFlags = (flagsRes.data ?? []).filter(
        (f) => f.user_id === a.client_id && f.status === "open",
      ).length;
      const profile = a.profiles as { full_name: string | null; program_start_date: string | null } | null;
      return {
        clientId: a.client_id,
        fullName: profile?.full_name ?? null,
        programStartDate: profile?.program_start_date ?? null,
        completedCount: completed.length,
        currentWeek,
        openFlags,
      };
    });
  });

const ClientIdInput = z.object({ clientId: z.string().uuid() });

export const getClientDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ClientIdInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // El administrador puede supervisar cualquier ficha, pero queda registrado.
    const { data: isAdmin } = await supabase.rpc("is_platform_admin", {
      _user_id: userId,
    });
    if (isAdmin) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("audit_logs").insert({
        actor_user_id: userId,
        action: "admin_viewed_client",
        target_type: "profile",
        target_id: data.clientId,
      });
    } else {
      await assertCoach(supabase, userId);
      const { data: assigned } = await supabase.rpc("is_active_coach_of", {
        _coach_id: userId,
        _client_id: data.clientId,
      });
      if (!assigned) throw safeError("Este cliente no está asignado a ti.");
    }

    const [profileRes, progressRes, deliverablesRes, flagsRes, sessionsRes] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, program_start_date")
          .eq("id", data.clientId)
          .maybeSingle(),
        supabase
          .from("module_progress")
          .select("status, started_at, completed_at, modules:module_id(id, week_number, phase_number, title)")
          .eq("user_id", data.clientId),
        supabase
          .from("deliverables")
          .select("id, content, updated_at, modules:module_id(week_number, title)")
          .eq("user_id", data.clientId)
          .order("created_at", { ascending: true }),
        supabase
          .from("flags")
          .select("id, trigger_type, status, note, created_at, modules:module_id(week_number, title)")
          .eq("user_id", data.clientId)
          .order("created_at", { ascending: false }),
        supabase
          .from("sessions_1_1")
          .select("id, phase_number, scheduled_at, status, coach_notes, next_step_recommended")
          .eq("user_id", data.clientId)
          .order("phase_number", { ascending: true }),
      ]);

    if (
      profileRes.error || progressRes.error || deliverablesRes.error ||
      flagsRes.error || sessionsRes.error
    ) {
      throw safeError("No se pudo cargar el detalle del cliente.");
    }
    if (!profileRes.data) throw safeError("Este cliente no existe o no está asignado a ti.");

    return {
      profile: profileRes.data,
      progress: (progressRes.data ?? [])
        .map((p) => ({
          status: p.status,
          startedAt: p.started_at,
          completedAt: p.completed_at,
          module: p.modules as {
            id: string; week_number: number; phase_number: number; title: string;
          } | null,
        }))
        .filter((p) => p.module)
        .sort((a, b) => (a.module!.week_number ?? 0) - (b.module!.week_number ?? 0)),
      deliverables: deliverablesRes.data ?? [],
      flags: flagsRes.data ?? [],
      sessions: sessionsRes.data ?? [],
    };
  });

const ReviewFlagInput = z.object({ flagId: z.string().uuid() });

export const reviewFlag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ReviewFlagInput.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("flags")
      .update({ status: "reviewed" })
      .eq("id", data.flagId);
    if (error) throw safeError("No se pudo actualizar el aviso.");
    return { ok: true };
  });

const UpdateSessionInput = z.object({
  sessionId: z.string().uuid(),
  scheduledAt: z.string().datetime({ offset: true }).nullable().optional(),
  status: z.enum(["pending", "scheduled", "completed"]).optional(),
  coachNotes: z.string().max(10000).optional(),
  nextStepRecommended: z
    .enum(["acompanamiento_1_1", "retiro_leon"])
    .nullable()
    .optional(),
});

export const updateSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UpdateSessionInput.parse(input))
  .handler(async ({ data, context }) => {
    const patch: Database["public"]["Tables"]["sessions_1_1"]["Update"] = {};
    if (data.scheduledAt !== undefined) patch.scheduled_at = data.scheduledAt;
    if (data.status !== undefined) patch.status = data.status;
    if (data.coachNotes !== undefined) patch.coach_notes = data.coachNotes;
    if (data.nextStepRecommended !== undefined) {
      patch.next_step_recommended = data.nextStepRecommended;
    }

    const { error } = await context.supabase
      .from("sessions_1_1")
      .update(patch)
      .eq("id", data.sessionId);
    if (error) throw safeError("No se pudo actualizar la sesión.");
    return { ok: true };
  });

/** Seguimientos de 30 y 60 días de todos los clientes del coach. */
export const getCoachFollowUps = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertCoach(supabase, userId);

    const assignments = await activeClientIds(supabase, userId);

    const clientIds = (assignments ?? []).map((a) => a.client_id);
    if (clientIds.length === 0) return [];

    const { data: followUps, error } = await supabase
      .from("follow_ups")
      .select("id, user_id, day_offset, due_at, status, summary, completed_at")
      .in("user_id", clientIds)
      .order("due_at", { ascending: true });
    if (error) throw safeError("No se pudieron cargar los seguimientos.");

    const nameById = new Map(
      (assignments ?? []).map((a) => [
        a.client_id,
        (a.profiles as { full_name: string | null } | null)?.full_name ?? null,
      ]),
    );

    return (followUps ?? []).map((f) => ({
      ...f,
      fullName: nameById.get(f.user_id) ?? null,
    }));
  });

