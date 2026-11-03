// Diagnóstico de solo lectura: lista los clientes existentes y su progreso actual.
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function isNewSupabaseApiKey(value) {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}
const customFetch = (input, init) => {
  const headers = new Headers(init?.headers);
  if (isNewSupabaseApiKey(SERVICE_ROLE_KEY) && headers.get("Authorization") === `Bearer ${SERVICE_ROLE_KEY}`) {
    headers.delete("Authorization");
  }
  headers.set("apikey", SERVICE_ROLE_KEY);
  return fetch(input, { ...init, headers });
};

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  global: { fetch: customFetch },
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: clients, error } = await admin
  .from("profiles")
  .select("id, full_name, status, created_at")
  .eq("role", "client")
  .order("created_at");

if (error) {
  console.error(error.message);
  process.exit(1);
}

for (const c of clients) {
  const { data: users } = await admin.auth.admin.getUserById(c.id);
  const { data: progress } = await admin
    .from("module_progress")
    .select("status, started_at, completed_at, modules(week_number)")
    .eq("user_id", c.id);
  const completed = (progress ?? []).filter((p) => p.status === "completed").length;
  const started = (progress ?? []).filter((p) => p.started_at).length;
  console.log(
    `${users?.user?.email ?? "?"} · ${c.full_name} · creado ${c.created_at} · módulos completados: ${completed} · con avance: ${started}`,
  );
}
