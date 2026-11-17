// Pipeline de vídeo faceless por módulo (opción B):
//   guion de slides (contenido-programa) + teoría
//   → narración por diapositiva (Claude vía OpenRouter) [editable, se guarda en git]
//   → voz femenina (ElevenLabs multilingual v2 vía fal.ai)
//   → diapositivas 1920x1080 con la identidad de la marca (Playwright)
//   → MP4 H.264 + AAC (ffmpeg)
//
// Uso:
//   node scripts/videos/build-video.mjs 1            # módulo 1
//   node scripts/videos/build-video.mjs 1 --renarrate # rehace la narración
//   node scripts/videos/build-video.mjs all
//
// Variables: OPENROUTER_API_KEY, FAL_KEY (en este entorno las inyecta el proxy).
// Salida: videos-out/modulo-0X.mp4 (no se sube a git; ver upload-videos.mjs).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";

const require = createRequire(import.meta.url);
const ROOT = resolve(new URL("../..", import.meta.url).pathname);
const CONTENT = join(ROOT, "contenido-programa");
const NARRATION_DIR = join(CONTENT, "videos");
const OUT = join(ROOT, "videos-out");

const VOICE = process.env.VIDEO_VOICE ?? "Laura"; // voz femenina de ElevenLabs
const NARRATION_MODEL = process.env.NARRATION_MODEL ?? "anthropic/claude-sonnet-4.5";
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY ?? "proxy";
const FAL_KEY = process.env.FAL_KEY ?? "proxy";

const MODULES = {
  1: { phase: "Fase 1 · Confrontación", title: "Auditoría vital honesta" },
  2: { phase: "Fase 1 · Confrontación", title: "El coste de no cambiar" },
  3: { phase: "Fase 2 · Claridad", title: "Mapa de valores" },
  4: { phase: "Fase 2 · Claridad", title: "Tu hoguera personal" },
  5: { phase: "Fase 3 · Diseño", title: "Generación de opciones" },
  6: { phase: "Fase 3 · Diseño", title: "Filtro por restricciones reales" },
  7: { phase: "Fase 4 · Acción", title: "Plan a 90 días" },
  8: { phase: "Fase 4 · Acción", title: "Seguimiento y cierre" },
};

const pad = (n) => String(n).padStart(2, "0");

/* ---------------------------- 1. Guion -------------------------------- */

function parseSlides(week) {
  const md = readFileSync(join(CONTENT, `sesion-${pad(week)}-slides-guion-v2.md`), "utf-8");
  const slides = [];
  const re = /\*\*Diapositiva\s+(\d+)\s+—\s+([^*]+)\*\*\n([\s\S]*?)(?=\n---|\s*$)/g;
  let m;
  while ((m = re.exec(md))) {
    const lines = m[3]
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    slides.push({ n: Number(m[1]), heading: m[2].trim(), lines });
  }
  if (slides.length === 0) throw new Error(`No se encontraron diapositivas en la semana ${week}`);
  return slides;
}

/* ---------------------------- 2. Narración ---------------------------- */

async function narrate(week, slides) {
  const file = join(NARRATION_DIR, `modulo-${pad(week)}-narracion.json`);
  if (existsSync(file) && !process.argv.includes("--renarrate")) {
    const saved = JSON.parse(readFileSync(file, "utf-8"));
    if (saved.length === slides.length) return saved.map((s) => s.narracion);
  }
  const theory = readFileSync(join(CONTENT, `sesion-${pad(week)}-teoria-v2.md`), "utf-8");
  const prompt = [
    `Escribe la locución de un vídeo explicativo del módulo ${week} del programa online «Tu nueva vida» (${MODULES[week].title}).`,
    "El vídeo es faceless: solo diapositivas y una voz femenina en off. No hay coach humano ni llamadas en el programa: no los menciones. El acompañamiento es un coach IA dentro de la plataforma.",
    "Reglas: español de España, tuteo, frases cortas y naturales para ser dichas en voz alta, tono cálido, sereno y directo, sin jerga de autoayuda ni frases grandilocuentes. No leas la diapositiva literalmente: explícala y amplíala con la teoría. Entre 25 y 60 palabras por diapositiva (la portada, 15-25). Nada de emojis, listas, comillas tipográficas raras ni acotaciones.",
    "La voz es femenina, pero el oyente puede ser hombre o mujer: no marques nunca su género (evita «bienvenida/o», «lista/o», «cansada/o», «a ti misma/o»; usa construcciones neutras como «te damos la bienvenida», «cuando quieras», «a ti»). Llama al acompañante «tu coach IA» y escríbelo así: «tu coach i a».",
    "La última diapositiva invita a hacer el ejercicio práctico que está justo debajo del vídeo y a enviarlo a revisión al coach IA.",
    `Devuelve SOLO un JSON: un array de ${slides.length} strings, una locución por diapositiva, en el mismo orden.`,
    "",
    "## Teoría del módulo",
    theory,
    "",
    "## Diapositivas",
    ...slides.map((s) => `${s.n}. ${s.heading}: ${s.lines.join(" / ")}`),
  ].join("\n");

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENROUTER_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: NARRATION_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const text = json.choices[0].message.content.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
  const arr = JSON.parse(text.slice(text.indexOf("["), text.lastIndexOf("]") + 1));
  if (arr.length !== slides.length) throw new Error("La narración no cuadra con las diapositivas");
  mkdirSync(NARRATION_DIR, { recursive: true });
  writeFileSync(
    file,
    JSON.stringify(
      slides.map((s, i) => ({ diapositiva: s.n, titulo: s.heading, narracion: arr[i] })),
      null,
      2,
    ) + "\n",
  );
  console.log(`  narración guardada en ${file} (puedes editarla y volver a lanzar)`);
  return arr;
}

/* ---------------------------- 3. Voz ---------------------------------- */

async function tts(text, outFile) {
  if (existsSync(outFile)) return;
  const submit = await fetch("https://queue.fal.run/fal-ai/elevenlabs/tts/multilingual-v2", {
    method: "POST",
    headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      voice: VOICE,
      stability: 0.55,
      similarity_boost: 0.75,
      style: 0.15,
      speed: 0.95,
      language_code: "es",
    }),
  });
  if (!submit.ok) throw new Error(`fal ${submit.status}: ${await submit.text()}`);
  const { status_url, response_url } = await submit.json();
  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const st = await (await fetch(status_url, { headers: { Authorization: `Key ${FAL_KEY}` } })).json();
    if (st.status === "COMPLETED") break;
    if (st.status === "FAILED" || st.status === "ERROR") throw new Error("TTS falló");
  }
  const result = await (await fetch(response_url, { headers: { Authorization: `Key ${FAL_KEY}` } })).json();
  const audio = await fetch(result.audio.url);
  writeFileSync(outFile, Buffer.from(await audio.arrayBuffer()));
}

/* ---------------------------- 4. Diapositivas ------------------------- */

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function slideHtml(week, slide, index, total) {
  const meta = MODULES[week];
  const isCover = index === 0;
  const body = isCover
    ? `<p class="eyebrow">${esc(meta.phase)} · Módulo ${week} de 8</p>
       <h1 class="cover">${esc(meta.title)}</h1>
       ${slide.lines
         .filter((l) => l.startsWith('"') || l.startsWith("“"))
         .map((l) => `<p class="question">${esc(l.replace(/^["“]|["”]$/g, ""))}</p>`)
         .join("")}`
    : `<p class="eyebrow">Módulo ${week} · ${esc(meta.title)}</p>
       <h2>${esc(slide.heading)}</h2>
       <div class="lines">${slide.lines.map((l) => `<p>${esc(l)}</p>`).join("")}</div>`;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;1,400&family=Karla:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1920px; height: 1080px; overflow: hidden; font-family: Karla, system-ui, sans-serif;
         background: radial-gradient(1200px 700px at 85% 110%, #FBE3CC 0%, transparent 60%),
                     radial-gradient(900px 600px at 0% -10%, #FCE9EE 0%, transparent 55%), #FBF7F1;
         color: #1E1A16; display: flex; flex-direction: column; justify-content: center; padding: 0 180px; }
  .eyebrow { font-size: 26px; letter-spacing: .22em; text-transform: uppercase; color: #C2562B; font-weight: 600; }
  h1.cover { font-family: Lora, Georgia, serif; font-size: 128px; line-height: 1.04; font-weight: 600; margin-top: 36px; max-width: 1400px; }
  .question { font-family: Lora, Georgia, serif; font-style: italic; font-size: 52px; color: #6B5E52; margin-top: 44px; }
  h2 { font-family: Lora, Georgia, serif; font-size: 92px; line-height: 1.08; font-weight: 600; margin-top: 30px; max-width: 1500px; }
  .lines { margin-top: 56px; border-left: 6px solid #E07A45; padding-left: 44px; max-width: 1450px; }
  .lines p { font-size: 46px; line-height: 1.38; color: #3A322B; }
  .lines p + p { margin-top: 18px; }
  .foot { position: absolute; left: 180px; right: 180px; bottom: 70px; display: flex; justify-content: space-between;
          font-size: 24px; color: #8A7C6F; }
  .flame { display: inline-block; width: 18px; height: 18px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
           background: linear-gradient(135deg, #F2A65A, #C2562B); margin-right: 14px; vertical-align: -2px; }
  .bar { position: absolute; left: 0; bottom: 0; height: 8px; background: #E07A45; width: ${Math.round(((index + 1) / total) * 100)}%; }
</style></head><body>
${body}
<div class="foot"><span><span class="flame"></span>Tu nueva vida</span><span>${index + 1} / ${total}</span></div>
<div class="bar"></div>
</body></html>`;
}

async function renderSlides(week, slides, dir) {
  const { chromium } = require("playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  for (let i = 0; i < slides.length; i++) {
    const file = join(dir, `slide-${pad(i + 1)}.png`);
    await page.setContent(slideHtml(week, slides[i], i, slides.length), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: file });
  }
  await browser.close();
}

/* ---------------------------- 5. Montaje ------------------------------ */

function ffmpeg(args) {
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });
}

function duration(file) {
  return Number(
    execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file])
      .toString()
      .trim(),
  );
}

function assemble(week, dir, audios) {
  const segments = [];
  for (let i = 1; i <= audios.length; i++) {
    const img = join(dir, `slide-${pad(i)}.png`);
    const audio = audios[i - 1];
    const seg = join(dir, `seg-${pad(i)}.mp4`);
    const lead = 0.5;
    const tail = 0.9;
    const total = duration(audio) + lead + tail;
    ffmpeg([
      "-loop", "1", "-framerate", "30", "-t", total.toFixed(2), "-i", img,
      "-i", audio,
      "-filter_complex",
      `[0:v]fade=t=in:st=0:d=0.35,fade=t=out:st=${(total - 0.35).toFixed(2)}:d=0.35,format=yuv420p[v];` +
        `[1:a]adelay=${lead * 1000}|${lead * 1000},apad=whole_dur=${total.toFixed(2)},aresample=48000[a]`,
      "-map", "[v]", "-map", "[a]",
      "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-tune", "stillimage",
      "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2",
      "-t", total.toFixed(2),
      seg,
    ]);
    segments.push(seg);
  }
  const list = join(dir, "lista.txt");
  writeFileSync(list, segments.map((s) => `file '${s}'`).join("\n"));
  const out = join(OUT, `modulo-${pad(week)}.mp4`);
  ffmpeg(["-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-movflags", "+faststart", out]);
  return out;
}

/* ---------------------------- Principal ------------------------------- */

async function build(week) {
  console.log(`Módulo ${week}: ${MODULES[week].title}`);
  const dir = join(OUT, `work-${pad(week)}`);
  mkdirSync(dir, { recursive: true });
  const slides = parseSlides(week);
  console.log(`  ${slides.length} diapositivas`);
  const narration = await narrate(week, slides);
  // El nombre del audio lleva un hash del texto + voz: si editas la narración,
  // solo se regeneran las diapositivas cambiadas.
  const audios = narration.map((t, i) => {
    const h = createHash("sha1").update(`${VOICE}|${t}`).digest("hex").slice(0, 8);
    return join(dir, `voz-${pad(i + 1)}-${h}.mp3`);
  });
  for (let i = 0; i < audios.length; i += 4) {
    await Promise.all(audios.slice(i, i + 4).map((file, j) => tts(narration[i + j], file)));
  }
  console.log("  voz generada");
  await renderSlides(week, slides, dir);
  console.log("  diapositivas renderizadas");
  const out = assemble(week, dir, audios);
  console.log(`  ✔ ${out} (${Math.round(duration(out))} s)`);
}

const arg = process.argv[2];
const weeks = arg === "all" ? [1, 2, 3, 4, 5, 6, 7, 8] : [Number(arg)];
if (!weeks.every((w) => MODULES[w])) {
  console.error("Uso: node scripts/videos/build-video.mjs <1-8|all> [--renarrate]");
  process.exit(1);
}
for (const w of weeks) await build(w);
