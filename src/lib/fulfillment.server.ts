// Fulfillment de compras de Stripe. Solo servidor (usa service_role).
// Todas las operaciones son idempotentes: Stripe puede reenviar el mismo evento.
import type Stripe from "stripe";

import { supabaseAdmin } from "@/integrations/supabase/client.server";

function siteUrl(): string {
  return process.env["SITE_URL"] ?? "https://tunuevavida.eu";
}

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

async function audit(action: string, targetId: string | null, metadata: Record<string, unknown>) {
  await supabaseAdmin.from("audit_logs").insert({
    actor_user_id: null,
    action,
    target_type: targetId ? "profile" : null,
    target_id: targetId,
    metadata: metadata as never,
  });
}

/** Busca un usuario existente por email (base pequeña: paginamos listUsers). */
async function findUserIdByEmail(email: string): Promise<string | null> {
  const target = email.toLowerCase();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === target);
    if (match) return match.id;
    if (data.users.length < 1000) return null;
  }
  return null;
}

/**
 * Crea la cuenta de cliente e invita por email (mismo flujo que adminInviteClient).
 * Si el email ya tiene cuenta, no toca nada: devuelve su id y deja una nota.
 */
async function provisionClient(
  email: string,
  fullName: string | null,
): Promise<{ userId: string | null; note: string | null }> {
  const { data: created, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    email,
    {
      data: { full_name: fullName ?? undefined },
      redirectTo: `${siteUrl()}/set-password`,
    },
  );

  if (inviteError || !created.user) {
    const code = inviteError?.code ?? "";
    const msg = (inviteError?.message ?? "").toLowerCase();
    if (code === "email_exists" || msg.includes("already")) {
      const existingId = await findUserIdByEmail(email);
      return {
        userId: existingId,
        note: "El email ya tenía cuenta: no se ha reenviado invitación. Revisar acceso.",
      };
    }
    // Error transitorio: lanzamos para que Stripe reintente el webhook.
    throw new Error(`inviteUserByEmail failed: ${inviteError?.status ?? ""} ${code}`);
  }

  const clientId = created.user.id;
  const rollback = async (step: string) => {
    await supabaseAdmin.auth.admin.deleteUser(clientId);
    throw new Error(`provisionClient failed at ${step}`);
  };

  const { error: profileError } = await supabaseAdmin.from("profiles").insert({
    id: clientId,
    role: "client",
    full_name: fullName,
    program_start_date: new Date().toISOString().slice(0, 10),
    status: "active",
  });
  if (profileError) await rollback("profile");

  const { error: roleError } = await supabaseAdmin
    .from("user_roles")
    .insert({ user_id: clientId, role: "client" });
  if (roleError) await rollback("role");

  const { error: initError } = await supabaseAdmin.rpc("initialize_client_progress", {
    _user_id: clientId,
  });
  if (initError) await rollback("initialize_client_progress");

  return { userId: clientId, note: null };
}

/**
 * checkout.session.completed / checkout.session.async_payment_succeeded.
 * Registra la compra y, si está pagada, da de alta al cliente una sola vez.
 */
export async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
  const email = session.customer_details?.email;
  if (!email) throw new Error(`Checkout session ${session.id} sin email`);
  const fullName = session.customer_details?.name ?? null;
  const isPaid = session.payment_status !== "unpaid";

  const { data: existing, error: readError } = await supabaseAdmin
    .from("purchases")
    .select("id, user_id, status")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();
  if (readError) throw readError;

  const base = {
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: idOf(session.payment_intent),
    stripe_customer_id: idOf(session.customer),
    stripe_invoice_id: idOf(session.invoice),
    email,
    full_name: fullName,
    currency: session.currency ?? "eur",
    amount_total: session.amount_total ?? 0,
    amount_tax: session.total_details?.amount_tax ?? 0,
    livemode: session.livemode,
  };

  // Nunca degradamos una compra ya reembolsada o pagada a 'pending'.
  const keepStatus =
    existing && ["paid", "refunded", "partially_refunded"].includes(existing.status);
  const status = keepStatus ? existing!.status : isPaid ? "paid" : "pending";

  const { error: upsertError } = await supabaseAdmin.from("purchases").upsert(
    {
      ...base,
      status,
      ...(isPaid && !keepStatus ? { paid_at: new Date().toISOString() } : {}),
    },
    { onConflict: "stripe_checkout_session_id" },
  );
  if (upsertError) throw upsertError;

  if (!isPaid || existing?.user_id) return;

  const { userId, note } = await provisionClient(email, fullName);

  const { error: linkError } = await supabaseAdmin
    .from("purchases")
    .update({ user_id: userId, provisioning_note: note })
    .eq("stripe_checkout_session_id", session.id);
  if (linkError) throw linkError;

  await audit(note ? "purchase_existing_account" : "purchase_client_provisioned", userId, {
    checkoutSession: session.id,
    livemode: session.livemode,
  });
}

export async function markCheckoutFailed(session: Stripe.Checkout.Session) {
  const { error } = await supabaseAdmin
    .from("purchases")
    .update({ status: "failed" })
    .eq("stripe_checkout_session_id", session.id)
    .eq("status", "pending");
  if (error) throw error;
}

/**
 * charge.refunded: solo registra el reembolso. El acceso NO se retira
 * automáticamente; lo decide un admin desde el panel (puede ser parcial o un gesto comercial).
 */
export async function recordRefund(charge: Stripe.Charge) {
  const paymentIntentId = idOf(charge.payment_intent);
  if (!paymentIntentId) return;
  const status = charge.refunded ? "refunded" : "partially_refunded";
  const { data, error } = await supabaseAdmin
    .from("purchases")
    .update({ status, amount_refunded: charge.amount_refunded })
    .eq("stripe_payment_intent_id", paymentIntentId)
    .select("user_id")
    .maybeSingle();
  if (error) throw error;
  if (data) {
    await audit("purchase_refunded", data.user_id, {
      paymentIntent: paymentIntentId,
      amountRefunded: charge.amount_refunded,
      full: charge.refunded,
    });
  }
}
