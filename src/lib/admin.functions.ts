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
/* Autorización                                                        */
/* ------------------------------------------------------------------ */

/**
 * Comprueba en base de datos que quien llama es administrador de plataforma
 * y que su cuenta está activa. El frontend nunca decide esto por su cuenta.
 */
export async function assertPlatformAdmin(supabase: AuthedClient, userId: string) {
  const { data: isAdmin } = await supabase.rpc("is_platform_admin", {
    _user_id: userId,
  });
  if (!isAdmin) throw safeError("No tienes permiso para acceder a esta sección.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", userId)
    .maybeSingle();
  if (profile && profile.status !== "active") {
    throw safeError("Tu cuenta no está activa.");
  }
}

/** Registro de actividad administrativa. Nunca guarda claves ni contraseñas. */
async function writeAuditLog(entry: {
  actorUserId: string;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("audit_logs").insert({
    actor_user_id: entry.actorUserId,
    action: entry.action,
    target_type: entry.targetType ?? null,
    target_id: entry.targetId ?? null,
    metadata: (entry.metadata ?? {}) as never,
  });
}

/* ------------------------------------------------------------------ */
/* Lecturas del panel de administración                                */
/* ------------------------------------------------------------------ */

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertPlatformAdmin(supabase, userId);

    const [profilesRes, rolesRes, assignRes, flagsRes, sessionsRes, progressRes] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, status, program_start_date, last_active_at, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
        supabase
          .from("coach_clients")
          .select("id, coach_id, client_id, status, assigned_at, unassigned_at")
          .order("assigned_at", { ascending: false }),
        supabase.from("flags").select("user_id, status"),
        supabase
          .from("sessions_1_1")
          .select("id, user_id, phase_number, scheduled_at, status")
          .not("scheduled_at", "is", null)
          .order("scheduled_at", { ascending: true }),
        supabase.from("module_progress").select("user_id, status"),
      ]);

    if (
      profilesRes.error || rolesRes.error || assignRes.error ||
      flagsRes.error || sessionsRes.error || progressRes.error
    ) {
      throw safeError("No se pudo cargar el panel de administración.");
    }

    const roles = rolesRes.data ?? [];
    const isRole = (id: string, role: string) =>
      roles.some((r) => r.user_id === id && r.role === role);

    const profiles = profilesRes.data ?? [];
    const clients = profiles.filter((p) => isRole(p.id, "client"));
    const coaches = profiles.filter((p) => isRole(p.id, "coach"));

    const activeAssignments = (assignRes.data ?? []).filter((a) => a.status === "active");
    const coachByClient = new Map(activeAssignments.map((a) => [a.client_id, a.coach_id]));

    const openFlagsByClient = new Map<string, number>();
    for (const f of flagsRes.data ?? []) {
      if (f.status !== "open") continue;
      openFlagsByClient.set(f.user_id, (openFlagsByClient.get(f.user_id) ?? 0) + 1);
    }

    const completedByClient = new Map<string, number>();
    for (const p of progressRes.data ?? []) {
      if (p.status !== "completed") continue;
      completedByClient.set(p.user_id, (completedByClient.get(p.user_id) ?? 0) + 1);
    }

    const INACTIVE_DAYS = 7;
    const cutoff = Date.now() - INACTIVE_DAYS * 24 * 60 * 60 * 1000;
    const inactiveClients = clients.filter(
      (c) => !c.last_active_at || new Date(c.last_active_at).getTime() < cutoff,
    );

    const averageProgress =
      clients.length === 0
        ? 0
        : Math.round(
            (clients.reduce((sum, c) => sum + (completedByClient.get(c.id) ?? 0), 0) /
              (clients.length * 8)) *
              100,
          );

    const nameById = new Map(profiles.map((p) => [p.id, p.full_name]));

    return {
      totals: {
        clients: clients.length,
        activeClients: clients.filter((c) => c.status === "active").length,
        activeCoaches: coaches.filter((c) => c.status === "active").length,
        withoutCoach: clients.filter((c) => !coachByClient.has(c.id)).length,
        withOpenFlags: clients.filter((c) => (openFlagsByClient.get(c.id) ?? 0) > 0).length,
        inactive: inactiveClients.length,
        averageProgress,
      },
      clients: clients.map((c) => ({
        id: c.id,
        fullName: c.full_name,
        status: c.status,
        programStartDate: c.program_start_date,
        lastActiveAt: c.last_active_at,
        createdAt: c.created_at,
        coachId: coachByClient.get(c.id) ?? null,
        coachName: coachByClient.has(c.id)
          ? nameById.get(coachByClient.get(c.id)!) ?? null
          : null,
        openFlags: openFlagsByClient.get(c.id) ?? 0,
        completedModules: completedByClient.get(c.id) ?? 0,
      })),
      coaches: coaches.map((c) => ({
        id: c.id,
        fullName: c.full_name,
        status: c.status,
        timezone: null as string | null,
        activeClients: activeAssignments.filter((a) => a.coach_id === c.id).length,
        openFlags: activeAssignments
          .filter((a) => a.coach_id === c.id)
          .reduce((sum, a) => sum + (openFlagsByClient.get(a.client_id) ?? 0), 0),
      })),
      assignments: (assignRes.data ?? []).slice(0, 50).map((a) => ({
        id: a.id,
        clientName: nameById.get(a.client_id) ?? null,
        coachName: nameById.get(a.coach_id) ?? null,
        status: a.status,
        assignedAt: a.assigned_at,
        unassignedAt: a.unassigned_at,
      })),
      upcomingSessions: (sessionsRes.data ?? [])
        .filter((s) => s.status === "scheduled")
        .slice(0, 10)
        .map((s) => ({
          id: s.id,
          clientName: nameById.get(s.user_id) ?? null,
          phaseNumber: s.phase_number,
          scheduledAt: s.scheduled_at,
        })),
    };
  });

export const getAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertPlatformAdmin(supabase, userId);

    const { data, error } = await supabase
      .from("audit_logs")
      .select("id, actor_user_id, action, target_type, target_id, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw safeError("No se pudo cargar el registro de actividad.");
    return data ?? [];
  });

/* ------------------------------------------------------------------ */
/* Altas                                                               */
/* ------------------------------------------------------------------ */

const InviteClientInput = z.object({
  email: z.string().email(),
  fullName: z.string().min(1).max(120),
  redirectOrigin: z.string().url(),
  coachId: z.string().uuid().nullable().optional(),
});

/**
 * Invita a un cliente por correo. No se fija contraseña aquí: Supabase envía
 * un email de invitación y la persona la crea ella misma desde /set-password.
 * Solo administrador de plataforma.
 */
export const adminInviteClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InviteClientInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertPlatformAdmin(supabase, userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      data.email,
      {
        data: { full_name: data.fullName },
        redirectTo: `${data.redirectOrigin}/set-password`,
      },
    );
    if (inviteError || !created.user) {
      console.error("[adminInviteClient] inviteUserByEmail", {
        status: inviteError?.status,
        code: inviteError?.code,
      });
      const code = inviteError?.code ?? "";
      const msg = (inviteError?.message ?? "").toLowerCase();
      if (code === "email_exists" || msg.includes("already")) {
        throw safeError("Ese correo ya tiene una cuenta.");
      }
      throw safeError("No se pudo enviar la invitación. Revisa el correo e inténtalo de nuevo.");
    }
    const clientId = created.user.id;

    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: clientId,
      role: "client",
      full_name: data.fullName,
      program_start_date: new Date().toISOString().slice(0, 10),
      status: "active",
    });
    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(clientId);
      throw safeError("No se pudo crear el perfil del cliente.");
    }

    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: clientId, role: "client" });
    if (roleError) {
      await supabaseAdmin.auth.admin.deleteUser(clientId);
      throw safeError("No se pudo asignar el rol del cliente.");
    }

    const { error: initError } = await supabaseAdmin.rpc("initialize_client_progress", {
      _user_id: clientId,
    });
    if (initError) {
      await supabaseAdmin.auth.admin.deleteUser(clientId);
      throw safeError("No se pudo inicializar el programa del cliente.");
    }

    if (data.coachId) {
      const { error: assignError } = await supabaseAdmin.from("coach_clients").insert({
        coach_id: data.coachId,
        client_id: clientId,
        assigned_by: userId,
        status: "active",
      });
      if (assignError) {
        throw safeError("Invitación enviada, pero no se pudo asignar el coach.");
      }
    }

    await writeAuditLog({
      actorUserId: userId,
      action: "client_invited",
      targetType: "profile",
      targetId: clientId,
      metadata: { email: data.email, conCoach: Boolean(data.coachId) },
    });

    return { ok: true, clientId, withoutCoach: !data.coachId };
  });

const CreateCoachInput = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  fullName: z.string().min(1).max(120),
  timezone: z.string().max(60).optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

/** Alta de coach. Solo administrador de plataforma. */
export const adminCreateCoach = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateCoachInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertPlatformAdmin(supabase, userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (createError || !created.user) {
      console.error("[adminCreateCoach] createUser", {
        status: createError?.status,
        code: createError?.code,
      });
      if ((createError?.message ?? "").toLowerCase().includes("already")) {
        throw safeError("Ese correo ya tiene una cuenta. Usa otro correo.");
      }
      throw safeError("No se pudo crear la cuenta del coach.");
    }
    const coachId = created.user.id;

    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: coachId,
      role: "coach",
      full_name: data.fullName,
      timezone: data.timezone ?? null,
      status: data.status,
    });
    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(coachId);
      throw safeError("No se pudo crear el perfil del coach.");
    }

    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: coachId, role: "coach" });
    if (roleError) {
      await supabaseAdmin.auth.admin.deleteUser(coachId);
      throw safeError("No se pudo asignar el rol de coach.");
    }

    await writeAuditLog({
      actorUserId: userId,
      action: "coach_created",
      targetType: "profile",
      targetId: coachId,
      metadata: { estadoInicial: data.status },
    });

    return { ok: true, coachId };
  });

/* ------------------------------------------------------------------ */
/* Estado de cuenta y asignaciones                                     */
/* ------------------------------------------------------------------ */

const SetStatusInput = z.object({
  targetUserId: z.string().uuid(),
  status: z.enum(["active", "inactive", "blocked"]),
});

export const adminSetAccountStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SetStatusInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertPlatformAdmin(supabase, userId);

    if (data.targetUserId === userId) {
      throw safeError("No puedes cambiar el estado de tu propia cuenta.");
    }

    const { error } = await supabase
      .from("profiles")
      .update({ status: data.status })
      .eq("id", data.targetUserId);
    if (error) throw safeError("No se pudo cambiar el estado de la cuenta.");

    await writeAuditLog({
      actorUserId: userId,
      action: "account_status_changed",
      targetType: "profile",
      targetId: data.targetUserId,
      metadata: { nuevoEstado: data.status },
    });

    return { ok: true };
  });

const AssignCoachInput = z.object({
  clientId: z.string().uuid(),
  coachId: z.string().uuid().nullable(),
});

/**
 * Asigna, cambia o retira el coach de un cliente. Nunca borra histórico:
 * cierra la asignación anterior y crea una nueva.
 */
export const adminAssignCoach = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AssignCoachInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertPlatformAdmin(supabase, userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: current } = await supabaseAdmin
      .from("coach_clients")
      .select("id, coach_id")
      .eq("client_id", data.clientId)
      .eq("status", "active")
      .maybeSingle();

    if (current && current.coach_id === data.coachId) {
      return { ok: true, unchanged: true };
    }

    if (current) {
      const { error } = await supabaseAdmin
        .from("coach_clients")
        .update({ status: "inactive", unassigned_at: new Date().toISOString() })
        .eq("id", current.id);
      if (error) throw safeError("No se pudo retirar la asignación anterior.");
    }

    if (data.coachId) {
      const { error } = await supabaseAdmin.from("coach_clients").insert({
        coach_id: data.coachId,
        client_id: data.clientId,
        assigned_by: userId,
        status: "active",
      });
      if (error) throw safeError("No se pudo asignar el nuevo coach.");
    }

    await writeAuditLog({
      actorUserId: userId,
      action: data.coachId ? (current ? "coach_changed" : "coach_assigned") : "coach_unassigned",
      targetType: "profile",
      targetId: data.clientId,
      metadata: { coachAnterior: current?.coach_id ?? null, coachNuevo: data.coachId },
    });

    return { ok: true, unchanged: false };
  });

/* ------------------------------------------------------------------ */
/* Desbloqueo manual de contenido                                      */
/* ------------------------------------------------------------------ */

const SetModuleLockInput = z.object({
  clientId: z.string().uuid(),
  moduleId: z.string().uuid(),
  locked: z.boolean(),
});

/**
 * Desbloquea o vuelve a bloquear un módulo concreto para un cliente concreto,
 * sin pasar por la secuencia automática (complete_module). Solo administrador
 * de plataforma; pensado para excepciones puntuales, no para el flujo normal.
 */
export const adminSetModuleLock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SetModuleLockInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertPlatformAdmin(supabase, userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin
      .from("module_progress")
      .update(
        data.locked
          ? { status: "locked", started_at: null, completed_at: null }
          : { status: "unlocked" },
      )
      .eq("user_id", data.clientId)
      .eq("module_id", data.moduleId);
    if (error) throw safeError("No se pudo cambiar el estado del módulo.");

    await writeAuditLog({
      actorUserId: userId,
      action: data.locked ? "module_locked_manually" : "module_unlocked_manually",
      targetType: "module_progress",
      targetId: data.moduleId,
      metadata: { clientId: data.clientId },
    });

    return { ok: true };
  });
