// Genera una migración nueva con la teoría y el ejercicio de las 8 semanas
// en su versión faceless (sin coach humano, llamadas ni retiro), leyendo
// contenido-programa/sesion-0X-{teoria,ejercicio}-v2.md.
// Uso: node scripts/gen-migration-faceless.mjs
import { readFileSync, writeFileSync } from "node:fs";

const OUT_PATH = "supabase/migrations/20261117100100_contenido_faceless.sql";

let sql = `-- Contenido faceless: sin coach humano, llamadas ni retiro. Las revisiones
-- de fase las hace el coach IA. Generado con scripts/gen-migration-faceless.mjs.

`;

for (let week = 1; week <= 8; week++) {
  const n = String(week).padStart(2, "0");
  const theory = readFileSync(`contenido-programa/sesion-${n}-teoria-v2.md`, "utf-8").trimEnd();
  const exercise = readFileSync(`contenido-programa/sesion-${n}-ejercicio-v2.md`, "utf-8").trimEnd();
  const thTag = `t${week}f`;
  const exTag = `e${week}f`;

  sql += `-- Semana ${week}\n`;
  sql += `UPDATE public.modules SET\n`;
  sql += `  theory_content = $${thTag}$${theory}\n$${thTag}$,\n`;
  sql += `  exercise_content = $${exTag}$${exercise}\n$${exTag}$\n`;
  sql += `WHERE week_number = ${week};\n\n`;
}

writeFileSync(OUT_PATH, sql, "utf-8");
console.log(`Escrito ${OUT_PATH} (${sql.length} chars).`);
