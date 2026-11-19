/**
 * Alta y baja automáticas a partir de los pedidos de Lemon Squeezy.
 * Solo servidor (service role). Sin intervención humana.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Json } from "@/integrations/supabase/types";
import type { OrderEvent } from "@/lib/lemonsqueezy.server";

async function findUserIdByEmail(email: string): Promise<string | null> {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error("listUsers");
    const hit = data.users.find((u) => u.email?.toLowerCase() === email);
    if (hit) return hit.id;
    if (data.users.length < 200) return null;
  }
  return null;
}

/** Perfil, rol y progreso (módulo 1 abierto) para una cuenta de cliente. */
async function ensureClientSetup(userId: string, fullName: string | null) {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    const { error } = await supabaseAdmin.from("profiles").insert({
      id: userId,
      role: "client",
      full_name: fullName ?? "",
      program_start_date: new Date().toISOString().slice(0, 10),
      status: "active",
    });
    if (error) throw new Error("profile");
  } else {
    await supabaseAdmin.from("profiles").update({ status: "active" }).eq("id", userId);
  }

  const { data: role } = await supabaseAdmin
    .from("user_roles")
    .select("user_id")
    .eq("user_id", userId)
    .eq("role", "client")
    .maybeSingle();
  if (!role) {
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "client" });
    if (error) throw new Error("role");
  }

  const { count } = await supabaseAdmin
    .from("module_progress")
    .select("module_id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (!count) {
    const { error } = await supabaseAdmin.rpc("initialize_client_progress", { _user_id: userId });
    if (error) throw new Error("progress");
  }
}

export async function provisionPurchase(order: OrderEvent, origin: string) {
  const { data: existing } = await supabaseAdmin
    .from("purchases")
    .select("id, user_id, status")
    .eq("provider", "lemonsqueezy")
    .eq("order_id", order.orderId)
    .maybeSingle();
  if (existing?.user_id && existing.status === "paid") return; // ya procesado

  let userId = await findUserIdByEmail(order.email);
  if (!userId) {
    const { data: invited, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(order.email, {
      data: { full_name: order.name ?? "" },
      redirectTo: `${origin}/set-password`,
    });
    if (error || !invited.user) throw new Error("invite");
    userId = invited.user.id;
  }

  await ensureClientSetup(userId, order.name);

  const row = {
    provider: "lemonsqueezy",
    order_id: order.orderId,
    email: order.email,
    customer_name: order.name,
    user_id: userId,
    status: "paid",
    total_cents: order.totalCents,
    currency: order.currency,
    raw: { test_mode: order.testMode, variant_id: order.variantId } as Json,
  };
  const { error } = existing
    ? await supabaseAdmin.from("purchases").update(row).eq("id", existing.id)
    : await supabaseAdmin.from("purchases").insert(row);
  if (error) throw new Error("purchase");

  await supabaseAdmin.from("audit_logs").insert({
    actor_user_id: null,
    action: "purchase_provisioned",
    target_type: "profile",
    target_id: userId,
    metadata: { order_id: order.orderId, test_mode: order.testMode } as Json,
  });
}

export async function revokePurchase(order: OrderEvent) {
  const { data: purchase } = await supabaseAdmin
    .from("purchases")
    .select("id, user_id")
    .eq("provider", "lemonsqueezy")
    .eq("order_id", order.orderId)
    .maybeSingle();

  if (purchase) {
    await supabaseAdmin.from("purchases").update({ status: "refunded" }).eq("id", purchase.id);
  }
  const userId = purchase?.user_id ?? (await findUserIdByEmail(order.email));
  if (userId) {
    // Solo bloquea si no le queda ninguna otra compra pagada.
    const { count } = await supabaseAdmin
      .from("purchases")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "paid");
    if (!count) {
      await supabaseAdmin.from("profiles").update({ status: "blocked" }).eq("id", userId);
    }
  }
}
