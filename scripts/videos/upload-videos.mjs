// Sube videos-out/modulo-0X.mp4 al bucket privado «module-videos» de
// Supabase y guarda la ruta en modules.video_path. La app firma una URL
// temporal solo para clientes con el módulo desbloqueado.
//
// Uso: SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node scripts/videos/upload-videos.mjs [1-8|all]
import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !KEY) {
  console.error("Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
const isNewKey = KEY.startsWith("sb_secret_");
const admin = createClient(SUPABASE_URL, KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: {
    fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (isNewKey && headers.get("Authorization") === `Bearer ${KEY}`) headers.delete("Authorization");
      headers.set("apikey", KEY);
      return fetch(input, { ...init, headers });
    },
  },
});

const arg = process.argv[2] ?? "all";
const weeks = arg === "all" ? [1, 2, 3, 4, 5, 6, 7, 8] : [Number(arg)];

for (const week of weeks) {
  const n = String(week).padStart(2, "0");
  const file = `videos-out/modulo-${n}.mp4`;
  if (!existsSync(file)) {
    console.log(`Semana ${week}: no hay ${file}, se omite.`);
    continue;
  }
  const path = `modulo-${n}.mp4`;
  const { error: upErr } = await admin.storage
    .from("module-videos")
    .upload(path, readFileSync(file), { contentType: "video/mp4", upsert: true });
  if (upErr) throw new Error(`Semana ${week}: ${upErr.message}`);
  const { error: dbErr } = await admin.from("modules").update({ video_path: path }).eq("week_number", week);
  if (dbErr) throw new Error(`Semana ${week}: ${dbErr.message}`);
  console.log(`Semana ${week}: subido ${path}`);
}
