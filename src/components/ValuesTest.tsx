import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, RotateCcw } from "lucide-react";

import { track } from "@/lib/analytics";

/**
 * Test de valores personales del blog. Versión reducida del módulo 3 del
 * programa: elegir 5 valores, ordenarlos y puntuar la atención real que
 * reciben. Todo se calcula en el navegador; no se guarda ni se envía nada.
 */
export const VALUES: Array<{ name: string; hint: string }> = [
  { name: "Autonomía", hint: "decidir cómo y cuándo haces las cosas" },
  { name: "Seguridad", hint: "saber que lo básico está cubierto" },
  { name: "Familia", hint: "tiempo y cuidado para los tuyos" },
  { name: "Salud", hint: "cuidar el cuerpo y la cabeza" },
  { name: "Libertad", hint: "no sentirte atado a un sitio o a un horario" },
  { name: "Aprendizaje", hint: "seguir creciendo y entendiendo cosas nuevas" },
  { name: "Creatividad", hint: "crear algo que antes no existía" },
  { name: "Reconocimiento", hint: "que se vea y se valore lo que haces" },
  { name: "Honestidad", hint: "decir lo que piensas y actuar en coherencia" },
  { name: "Lealtad", hint: "estar ahí para la gente que confía en ti" },
  { name: "Justicia", hint: "que las cosas sean equitativas" },
  { name: "Amistad", hint: "relaciones cercanas fuera de la familia" },
  { name: "Aventura", hint: "experiencias nuevas, salir de lo conocido" },
  { name: "Estabilidad económica", hint: "dinero suficiente para vivir tranquilo" },
  { name: "Ayudar a los demás", hint: "que tu trabajo mejore la vida de alguien" },
  { name: "Excelencia", hint: "hacer las cosas muy bien hechas" },
  { name: "Tiempo libre", hint: "espacio para descansar y para ti" },
  { name: "Pareja", hint: "cuidar y disfrutar tu relación" },
  { name: "Espiritualidad", hint: "sentido y conexión con algo mayor" },
  { name: "Naturaleza", hint: "estar al aire libre, lejos del ruido" },
  { name: "Humor", hint: "reírte y no tomártelo todo tan en serio" },
  { name: "Respeto", hint: "tratar y ser tratado con consideración" },
  { name: "Influencia", hint: "poder cambiar las cosas a tu alrededor" },
  { name: "Belleza", hint: "rodearte de cosas, lugares y obras bonitas" },
  { name: "Tradición", hint: "mantener costumbres y raíces" },
  { name: "Responsabilidad", hint: "cumplir con lo que te comprometes" },
  { name: "Comunidad", hint: "pertenecer a un grupo, a un barrio, a algo" },
  { name: "Curiosidad", hint: "preguntarte el porqué de las cosas" },
  { name: "Logro", hint: "proponerte metas y alcanzarlas" },
  { name: "Paz interior", hint: "vivir con calma y sin ruido mental" },
];

type Step = "choose" | "rank" | "rate" | "result";

export function ValuesTest() {
  const [step, setStep] = useState<Step>("choose");
  const [chosen, setChosen] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [attention, setAttention] = useState<Record<string, number>>({});

  const toggle = (name: string) =>
    setChosen((c) =>
      c.includes(name) ? c.filter((x) => x !== name) : c.length < 5 ? [...c, name] : c,
    );

  const addCustom = () => {
    const v = custom.trim().slice(0, 40);
    if (v && !chosen.includes(v) && chosen.length < 5) setChosen([...chosen, v]);
    setCustom("");
  };

  const move = (i: number, dir: -1 | 1) =>
    setChosen((c) => {
      const j = i + dir;
      if (j < 0 || j >= c.length) return c;
      const next = [...c];
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });

  // Importancia esperada según el puesto: el 1.º merecería un 10, el 5.º un 6.
  const results = useMemo(
    () =>
      chosen
        .map((name, i) => {
          const expected = 10 - i;
          const real = attention[name] ?? 0;
          return { name, rank: i + 1, expected, real, gap: Math.max(0, expected - real) };
        })
        .sort((a, b) => b.gap - a.gap || a.rank - b.rank),
    [chosen, attention],
  );
  const top = results[0];

  const reset = () => {
    setChosen([]);
    setAttention({});
    setStep("choose");
  };

  const btn =
    "rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40";

  return (
    <section
      aria-label="Test de valores personales"
      className="not-prose my-10 rounded-3xl border border-border bg-card p-6 text-base shadow-sm sm:p-8"
    >
      <p className="text-xs font-semibold tracking-[0.2em] text-ember-strong uppercase">
        Test de valores · paso{" "}
        {step === "choose" ? 1 : step === "rank" ? 2 : step === "rate" ? 3 : 4} de 4
      </p>

      {step === "choose" && (
        <>
          <p className="mt-3 text-xl font-bold tracking-tight">
            Elige los 5 valores que más te importan
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            No pienses en lo que queda bien. Piensa en lo que te dolería perder. Llevas{" "}
            {chosen.length} de 5.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {VALUES.map((v) => {
              const on = chosen.includes(v.name);
              return (
                <button
                  key={v.name}
                  type="button"
                  title={v.hint}
                  aria-pressed={on}
                  disabled={!on && chosen.length >= 5}
                  onClick={() => toggle(v.name)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors disabled:opacity-40 ${
                    on
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {v.name}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustom()}
              maxLength={40}
              placeholder="¿Falta alguno? Escríbelo"
              className="min-w-0 flex-1 rounded-full border border-input bg-secondary px-4 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={addCustom}
              disabled={!custom.trim() || chosen.length >= 5}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium disabled:opacity-40"
            >
              Añadir
            </button>
          </div>
          <button
            type="button"
            className={`${btn} mt-6`}
            disabled={chosen.length !== 5}
            onClick={() => setStep("rank")}
          >
            Siguiente: ordenarlos
          </button>
        </>
      )}

      {step === "rank" && (
        <>
          <p className="mt-3 text-xl font-bold tracking-tight">
            Ordénalos del más al menos importante
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Si tuvieras que renunciar a uno, ¿cuál sería? Ese va el último.
          </p>
          <ol className="mt-5 space-y-2">
            {chosen.map((name, i) => (
              <li
                key={name}
                className="flex items-center justify-between rounded-xl border border-border px-4 py-2.5"
              >
                <span>
                  <span className="mr-3 font-bold text-ember-strong">{i + 1}</span>
                  {name}
                </span>
                <span className="flex gap-1">
                  <button
                    type="button"
                    aria-label={`Subir ${name}`}
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                    className="rounded-md p-1.5 hover:bg-secondary disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label={`Bajar ${name}`}
                    disabled={i === chosen.length - 1}
                    onClick={() => move(i, 1)}
                    className="rounded-md p-1.5 hover:bg-secondary disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden />
                  </button>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className={btn} onClick={() => setStep("rate")}>
              Siguiente: puntuar
            </button>
            <button type="button" className="text-sm underline" onClick={() => setStep("choose")}>
              Volver
            </button>
          </div>
        </>
      )}

      {step === "rate" && (
        <>
          <p className="mt-3 text-xl font-bold tracking-tight">
            ¿Cuánta atención real les has dado esta última semana?
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Del 1 al 10. No lo que te gustaría: lo que ha pasado de verdad, en horas y en
            decisiones.
          </p>
          <div className="mt-5 space-y-5">
            {chosen.map((name) => (
              <div key={name}>
                <p className="text-sm font-medium">{name}</p>
                <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label={name}>
                  {Array.from({ length: 10 }, (_, k) => k + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={attention[name] === n}
                      onClick={() => setAttention((a) => ({ ...a, [name]: n }))}
                      className={`h-9 w-9 rounded-lg border text-sm font-semibold ${
                        attention[name] === n
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className={btn}
              disabled={chosen.some((n) => !attention[n])}
              onClick={() => {
                setStep("result");
                track("values_test_completed");
              }}
            >
              Ver mi resultado
            </button>
            <button type="button" className="text-sm underline" onClick={() => setStep("rank")}>
              Volver
            </button>
          </div>
        </>
      )}

      {step === "result" && top && (
        <>
          <p className="mt-3 text-xl font-bold tracking-tight">Tu mapa de valores</p>
          <p className="mt-1 text-sm text-muted-foreground">
            La barra clara es la atención que merecería cada valor según el lugar que ocupa en tu
            lista. La oscura, la que le das hoy.
          </p>
          <div className="mt-5 space-y-4">
            {results.map((r) => (
              <div key={r.name}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">
                    {r.rank} · {r.name}
                  </span>
                  <span className="text-muted-foreground">
                    {r.gap > 0 ? `distancia ${r.gap}` : "en equilibrio"}
                  </span>
                </div>
                <div className="relative mt-1.5 h-3 rounded-full bg-secondary">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-accent"
                    style={{ width: `${r.expected * 10}%` }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-primary"
                    style={{ width: `${r.real * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-secondary p-5 text-sm leading-relaxed">
            {top.gap >= 3 ? (
              <p>
                Tu mayor distancia está en <strong>{top.name}</strong>: lo tienes en el número{" "}
                {top.rank} de tu lista y le das un {top.real} sobre 10. Tómatelo como un dato sobre
                tu semana, no como una nota sobre ti. Y suele explicar bastante del malestar que se
                siente cuando el trabajo o el día a día no encajan.
              </p>
            ) : top.gap > 0 ? (
              <p>
                Tus valores y tu semana se parecen bastante. La distancia más grande, en{" "}
                <strong>{top.name}</strong>, es pequeña. Si aun así sientes que algo no encaja,
                quizá el problema no esté en tus valores, sino en cómo los vives en el trabajo.
              </p>
            ) : (
              <p>
                Según tus respuestas, das a cada valor la atención que le corresponde. Antes de
                quedarte con eso, repasa las notas de esta semana: es muy habitual puntuar lo que
                nos gustaría y no lo que ha pasado.
              </p>
            )}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Tus respuestas no se guardan ni se envían a ningún sitio.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <a href="/#modulos" className={btn}>
              Trabajarlo a fondo en el programa
            </a>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 text-sm underline"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Repetir el test
            </button>
          </div>
        </>
      )}
    </section>
  );
}
