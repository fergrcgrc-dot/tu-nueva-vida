// Genera una migración nueva (no reescribe la ya aplicada) con el contenido
// v2: tono directo, español de España. Deja slides_content tal cual está
// (los slides ahora se generan en NotebookLM, fuera de la base de datos).
import { readFileSync, writeFileSync } from "node:fs";

const OUT_PATH = "supabase/migrations/20261020160000_session_content_v2_tono_directo.sql";

let sql = `-- Reescritura del contenido de las 8 sesiones: tono directo ("tú a tú"),
-- español de España, sin jerga interna de diseño del programa.
-- Sustituye theory_content y exercise_content aplicados en
-- 20261019120000_session_content.sql. No toca slides_content: los slides
-- ahora se generan en NotebookLM a partir de contenido-programa/sesion-0X-slides-guion-v2.md.

`;

for (let week = 1; week <= 8; week++) {
  const n = String(week).padStart(2, "0");
  const theory = readFileSync(`contenido-programa/sesion-${n}-teoria-v2.md`, "utf-8").trimEnd();
  const exercise = readFileSync(`contenido-programa/sesion-${n}-ejercicio-v2.md`, "utf-8").trimEnd();
  const thTag = `t${week}v2`;
  const exTag = `e${week}v2`;

  sql += `-- Semana ${week}\n`;
  sql += `UPDATE public.modules SET\n`;
  sql += `  theory_content = $${thTag}$${theory}\n$${thTag}$,\n`;
  sql += `  exercise_content = $${exTag}$${exercise}\n$${exTag}$\n`;
  sql += `WHERE week_number = ${week};\n\n`;
}

writeFileSync(OUT_PATH, sql, "utf-8");
console.log(`Escrito ${OUT_PATH} (${sql.length} chars).`);
