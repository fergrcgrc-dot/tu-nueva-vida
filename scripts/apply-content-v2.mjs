// Sube la reescritura v2 (teoría + ejercicio, tono directo / español de España)
// a la tabla modules. Lee los archivos locales directamente (UTF-8 correcto
// via fs) y escribe por API, sin pasar por el editor SQL del dashboard.
// No toca slides_content: los slides ahora se generan en NotebookLM a partir
// de contenido-programa/sesion-0X-slides-guion-v2.md, fuera de la app.
import { readFileSync } from "node:fs";
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

for (let week = 1; week <= 8; week++) {
  const n = String(week).padStart(2, "0");
  const theory = readFileSync(`contenido-programa/sesion-${n}-teoria-v2.md`, "utf-8");
  const exercise = readFileSync(`contenido-programa/sesion-${n}-ejercicio-v2.md`, "utf-8");

  const { data: moduleRow, error: findError } = await admin
    .from("modules")
    .select("id, title")
    .eq("week_number", week)
    .single();
  if (findError || !moduleRow) {
    console.error(`Semana ${week}: no se encontró el módulo.`, findError?.message);
    continue;
  }

  const { error: updateError } = await admin
    .from("modules")
    .update({ theory_content: theory, exercise_content: exercise })
    .eq("id", moduleRow.id);

  if (updateError) {
    console.error(`Semana ${week}: error al actualizar.`, updateError.message);
  } else {
    console.log(`Semana ${week} · "${moduleRow.title}" actualizada (${theory.length} chars teoría, ${exercise.length} chars ejercicio).`);
  }
}
