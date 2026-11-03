// Corrige la codificación del contenido de los módulos: extrae theory/exercise/
// slides directamente del archivo de migración (UTF-8 correcto, leído con fs)
// y los vuelve a escribir vía la API (PostgREST), evitando el editor SQL del
// dashboard, que corrompió los acentos en el primer intento.
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

const sql = readFileSync("supabase/migrations/20261019120000_session_content.sql", "utf-8");

// Divide el archivo en un bloque por semana usando "WHERE week_number = N;" como límite.
const chunkRe = /UPDATE public\.modules SET([\s\S]*?)WHERE week_number = (\d+);/g;
let chunkMatch;
const chunks = {};
while ((chunkMatch = chunkRe.exec(sql))) {
  chunks[Number(chunkMatch[2])] = chunkMatch[1];
}

function extractQuoted(chunk, field) {
  const m = chunk.match(new RegExp(`${field}\\s*=\\s*'((?:[^']|'')*)'`));
  return m ? m[1].replace(/''/g, "'") : null;
}

function extractDollar(chunk, kind) {
  const m = chunk.match(new RegExp(`\\$(${kind}\\d+)\\$([\\s\\S]*?)\\$\\1\\$`));
  return m ? m[2] : null;
}

for (let week = 1; week <= 8; week++) {
  const chunk = chunks[week];
  if (!chunk) {
    console.error(`Semana ${week}: no se encontró el bloque UPDATE en el archivo.`);
    continue;
  }
  const phaseName = extractQuoted(chunk, "phase_name");
  const title = extractQuoted(chunk, "title");
  const objective = extractQuoted(chunk, "objective");
  const theory = extractDollar(chunk, "th");
  const exercise = extractDollar(chunk, "ex");
  const slidesRaw = extractDollar(chunk, "sl");

  if (!phaseName || !title || !objective || !theory || !exercise || !slidesRaw) {
    console.error(`Semana ${week}: faltó extraer algún campo (phase=${!!phaseName}, title=${!!title}, objective=${!!objective}, theory=${!!theory}, exercise=${!!exercise}, slides=${!!slidesRaw}).`);
    continue;
  }
  const slides = JSON.parse(slidesRaw);

  const { data: moduleRow, error: findError } = await admin
    .from("modules")
    .select("id")
    .eq("week_number", week)
    .single();
  if (findError || !moduleRow) {
    console.error(`Semana ${week}: no se encontró el módulo.`, findError?.message);
    continue;
  }

  const { error: updateError } = await admin
    .from("modules")
    .update({
      phase_name: phaseName,
      title,
      objective,
      theory_content: theory,
      exercise_content: exercise,
      slides_content: slides,
    })
    .eq("id", moduleRow.id);

  if (updateError) {
    console.error(`Semana ${week}: error al actualizar.`, updateError.message);
  } else {
    console.log(`Semana ${week}: "${title}" — contenido reescrito (${theory.length} chars teoría, ${slides.length} slides).`);
  }
}
