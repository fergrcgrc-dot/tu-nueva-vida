// Reinicia el progreso de TODOS los clientes a estado "recién empezado":
// semana 1 = unlocked (sin fechas), semanas 2-8 = locked (sin fechas).
// Borra también sus entregables guardados (si no, verían texto antiguo en
// un módulo "recién empezado"). No toca flags ni sesiones 1:1 con el coach.
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

const { data: modules, error: modulesError } = await admin
  .from("modules")
  .select("id, week_number")
  .order("week_number");
if (modulesError) {
  console.error("No se pudo leer modules:", modulesError.message);
  process.exit(1);
}

const { data: clients, error: clientsError } = await admin
  .from("profiles")
  .select("id, full_name")
  .eq("role", "client");
if (clientsError) {
  console.error("No se pudo leer profiles:", clientsError.message);
  process.exit(1);
}

for (const client of clients) {
  for (const m of modules) {
    const status = m.week_number === 1 ? "unlocked" : "locked";
    const { error } = await admin
      .from("module_progress")
      .update({ status, started_at: null, completed_at: null })
      .eq("user_id", client.id)
      .eq("module_id", m.id);
    if (error) {
      console.error(`Error reseteando módulo semana ${m.week_number} de ${client.full_name}:`, error.message);
    }
  }

  const { error: delError, count } = await admin
    .from("deliverables")
    .delete({ count: "exact" })
    .eq("user_id", client.id);
  if (delError) {
    console.error(`Error borrando entregables de ${client.full_name}:`, delError.message);
  }

  console.log(`Reiniciado: ${client.full_name} (${client.id}) — entregables borrados: ${count ?? 0}`);
}

console.log(`Listo. ${clients.length} cliente(s) reiniciados a estado inicial.`);
