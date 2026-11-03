// Diagnóstico de solo lectura: ¿tiene la tabla modules las columnas de
// contenido (theory_content / exercise_content / slides_content) y están
// rellenas? Usa la misma Service Role Key que create-test-client.mjs.
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.");
  process.exit(1);
}

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

const { data, error } = await admin
  .from("modules")
  .select("id, week_number, title, theory_content, exercise_content, slides_content")
  .order("week_number");

if (error) {
  console.error("Error consultando modules:", error.message);
  process.exit(1);
}

for (const m of data) {
  console.log(
    `semana ${m.week_number} · ${m.title} · theory=${m.theory_content ? "sí (" + m.theory_content.length + " chars)" : "NO"} · exercise=${m.exercise_content ? "sí" : "NO"} · slides=${Array.isArray(m.slides_content) ? m.slides_content.length : 0}`,
  );
}
