/**
 * Formularios de ejercicio por módulo. Fuente: contenido-programa/
 * sesion-0X-ejercicio-v2.md. Cada ejercicio se rellena dentro de la
 * plataforma, se guarda como borrador y se envía a revisión del coach IA.
 *
 * Se comparte entre cliente (render del formulario) y servidor (validación
 * de que el envío está completo y formateo para la IA).
 */

export type ListColumn =
  | { id: string; label: string; kind: "text"; placeholder?: string }
  | { id: string; label: string; kind: "number"; min: number; max: number }
  | { id: string; label: string; kind: "date" }
  | { id: string; label: string; kind: "bool"; yes: string; no: string };

export type ExerciseField =
  | {
      type: "text";
      id: string;
      label: string;
      hint?: string;
      minChars?: number;
    }
  | {
      type: "scale";
      id: string;
      label: string;
      /** Pide una frase que justifique la cifra. */
      withReason?: boolean;
    }
  | {
      type: "list";
      id: string;
      label: string;
      hint?: string;
      min: number;
      max: number;
      columns: ListColumn[];
      /**
       * Precarga las filas con la columna de un ejercicio anterior
       * (p. ej. el filtro de la semana 6 parte de las opciones de la 5).
       */
      prefillFrom?: { week: number; field: string; column: string; into: string };
    }
  | {
      type: "select";
      id: string;
      label: string;
      options: Array<{ value: string; label: string }>;
    };

export type ExerciseSection = {
  title: string;
  intro?: string;
  fields: ExerciseField[];
};

export type ExerciseSchema = {
  week: number;
  sections: ExerciseSection[];
};

/** Valor de una escala: cifra y, si procede, su justificación. */
export type ScaleValue = { value: number | null; reason?: string };
export type ListRow = Record<string, string | number | boolean | null>;
export type ExerciseAnswers = Record<string, string | ScaleValue | ListRow[]>;

const MIN_TEXT = 40;

export const EXERCISE_SCHEMAS: Record<number, ExerciseSchema> = {
  1: {
    week: 1,
    sections: [
      {
        title: "Carrera",
        fields: [
          {
            type: "text",
            id: "carrera_dia",
            label:
              "Describe un día normal de trabajo tal como es, no como lo cuentas cuando alguien pregunta.",
            minChars: MIN_TEXT,
          },
          {
            type: "text",
            id: "carrera_orgullo",
            label:
              "¿Cuándo fue la última vez que sentiste algo parecido a orgullo real por algo que hiciste? Pon fecha o momento aproximado.",
            minChars: MIN_TEXT,
          },
          {
            type: "text",
            id: "carrera_evitas",
            label:
              "¿Qué parte de tu trabajo evitas mencionar cuando hablas de él con gente que no lo conoce?",
            minChars: MIN_TEXT,
          },
        ],
      },
      {
        title: "Energía",
        fields: [
          {
            type: "text",
            id: "energia_momento",
            label:
              "En una semana normal, ¿en qué momento del día notas menos energía? ¿Desde cuándo es así?",
            minChars: MIN_TEXT,
          },
          {
            type: "text",
            id: "energia_recuperar",
            label:
              "¿Qué haces hoy para recuperar energía que, si lo piensas bien, no te funciona realmente?",
            minChars: MIN_TEXT,
          },
        ],
      },
      {
        title: "Relaciones",
        fields: [
          {
            type: "text",
            id: "relaciones_quien",
            label:
              "¿A quién no le cuentas lo que de verdad piensas sobre tu situación actual? ¿Por qué a esa persona en concreto?",
            minChars: MIN_TEXT,
          },
          {
            type: "text",
            id: "relaciones_costumbre",
            label: "¿Qué relación de tu vida actual sostienes más por costumbre que por elección?",
            minChars: MIN_TEXT,
          },
        ],
      },
      {
        title: "Lo que no te acaba de encajar",
        fields: [
          {
            type: "text",
            id: "encaje_evitas",
            label:
              "Si tuvieras que nombrar una sola cosa que llevas tiempo evitando hablar contigo mismo, ¿cuál sería?",
            minChars: MIN_TEXT,
          },
          {
            type: "text",
            id: "encaje_defiendes",
            label:
              "¿Qué parte de tu vida defenderías en voz alta aunque, en privado, no estés tan seguro?",
            minChars: MIN_TEXT,
          },
        ],
      },
      {
        title: "Para cerrar",
        intro: "No le des más de cinco segundos a la respuesta.",
        fields: [
          {
            type: "scale",
            id: "energia_vital",
            label: "Hoy, mi nivel de energía vital en general es de 1 a 10",
          },
        ],
      },
    ],
  },
  2: {
    week: 2,
    sections: [
      {
        title: "La proyección",
        intro:
          "En primera persona y en presente: un día cualquiera dentro de cinco años si nada de lo que nombraste la semana pasada cambia. Sé concreto: la hora, el lugar, con quién estás, qué sientes.",
        fields: [
          {
            type: "text",
            id: "proyeccion_manana",
            label:
              "Una mañana cualquiera dentro de cinco años, si el patrón de tu carrera que nombraste la semana pasada simplemente continúa.",
            minChars: 80,
          },
          {
            type: "text",
            id: "proyeccion_fisico",
            label:
              "Cómo te sientes físicamente un día normal, si tu nivel de energía no ha cambiado.",
            minChars: MIN_TEXT,
          },
          {
            type: "text",
            id: "proyeccion_conversacion",
            label:
              "Una conversación (o la ausencia de ella) con la persona que mencionaste la semana pasada, en esas mismas condiciones.",
            minChars: MIN_TEXT,
          },
          {
            type: "text",
            id: "proyeccion_frase",
            label: "La frase que te dirías a ti mismo esa noche, al acostarte.",
            minChars: 10,
          },
        ],
      },
      {
        title: "Pon una cifra al coste",
        intro: "Valora cada cosa del 1 al 10, con una frase breve que explique el número.",
        fields: [
          {
            type: "scale",
            id: "coste_emocional",
            label: "Imaginar esto me afecta emocionalmente en un grado de",
            withReason: true,
          },
          {
            type: "scale",
            id: "coste_relacional",
            label: "El impacto en mis relaciones, en ese escenario, es de",
            withReason: true,
          },
          {
            type: "scale",
            id: "coste_identitario",
            label:
              "Sentir que esa persona de dentro de cinco años sigue siendo yo, o no, me produce un impacto de",
            withReason: true,
          },
        ],
      },
    ],
  },
  3: {
    week: 3,
    sections: [
      {
        title: "Paso 1 y 2 — Tus 5 valores",
        intro:
          "Elige 5 valores centrales en tu vida y ordénalos del 1 (más prioritario) al 5. Para cada uno: un ejemplo concreto y reciente de por qué lo valoras, y cuánta atención real recibe hoy (1-10) con un ejemplo de la última semana.",
        fields: [
          {
            type: "list",
            id: "valores",
            label: "Tus valores",
            min: 5,
            max: 5,
            columns: [
              { id: "valor", label: "Valor", kind: "text", placeholder: "p. ej. Familia" },
              { id: "prioridad", label: "Prioridad (1-5)", kind: "number", min: 1, max: 5 },
              {
                id: "porque",
                label: "Sé que valoro esto porque…",
                kind: "text",
                placeholder: "Ejemplo concreto y reciente",
              },
              {
                id: "atencion",
                label: "Atención real hoy (1-10)",
                kind: "number",
                min: 1,
                max: 10,
              },
              { id: "ejemplo_semana", label: "Ejemplo de la última semana", kind: "text" },
            ],
          },
        ],
      },
      {
        title: "Paso 3 — Revisa el resultado",
        intro:
          "Al enviar, tu coach IA calcula la distancia entre prioridad y atención real en cada valor y te señala la mayor. Si quieres matizar algo antes, hazlo aquí.",
        fields: [
          {
            type: "text",
            id: "matiz",
            label: "¿Algo que matizar sobre tus valores o tus cifras? (opcional)",
          },
        ],
      },
    ],
  },
  4: {
    week: 4,
    sections: [
      {
        title: "Paso 1 — Tu mejor versión",
        fields: [
          {
            type: "text",
            id: "mejor_version",
            label:
              "¿Qué representas para las personas que te rodean cuando estás en tu mejor momento? Describe una situación concreta y reciente, no adjetivos.",
            minChars: 80,
          },
        ],
      },
      {
        title: "Paso 2 — El impacto",
        fields: [
          {
            type: "text",
            id: "impacto",
            label:
              "¿Qué le daría esa versión de ti a alguien cercano? Piensa en una persona concreta.",
            minChars: MIN_TEXT,
          },
        ],
      },
      {
        title: "Paso 3 — El cruce directo",
        intro:
          "Es obligatorio responder las dos partes. Si te cuesta encontrar dónde no está, ese es exactamente el dato que necesitamos hoy.",
        fields: [
          {
            type: "text",
            id: "valor_donde_si",
            label:
              "¿Dónde está vivo tu valor de mayor distancia en la versión de ti que acabas de describir?",
            minChars: MIN_TEXT,
          },
          {
            type: "text",
            id: "valor_donde_no",
            label: "¿Y dónde, específicamente, no está?",
            minChars: MIN_TEXT,
          },
        ],
      },
      {
        title: "Para cerrar",
        fields: [
          {
            type: "scale",
            id: "parecido_vida_real",
            label:
              "Qué tan parecida es la versión de mí que acabo de describir a mi vida real de hoy",
            withReason: true,
          },
        ],
      },
    ],
  },
  5: {
    week: 5,
    sections: [
      {
        title: "Tu lista",
        intro:
          "Al menos 15 direcciones posibles para tu vida o tu carrera. Una sola regla: nada de «pero». Hoy no se evalúa viabilidad. Si te quedas en blanco, escribe la opción que más miedo te da nombrar. Marca en cada una si atacaría directamente tu valor de mayor distancia.",
        fields: [
          {
            type: "list",
            id: "opciones",
            label: "Tus opciones",
            hint: "Sector actual, cambio de sector, cambio de modalidad, redefinir tu rol, geografía, tu relación con el trabajo…",
            min: 15,
            max: 40,
            columns: [
              { id: "opcion", label: "Opción", kind: "text" },
              {
                id: "ataca_gap",
                label: "¿Ataca tu valor de mayor distancia?",
                kind: "bool",
                yes: "Sí",
                no: "No",
              },
            ],
          },
        ],
      },
    ],
  },
  6: {
    week: 6,
    sections: [
      {
        title: "Paso 1 — Tus restricciones innegociables",
        intro:
          "Entre 2 y 3 restricciones reales: tiempo, dinero, familia, geografía u otra. Para cada una, el límite concreto y verificable que impone.",
        fields: [
          {
            type: "list",
            id: "restricciones",
            label: "Restricciones",
            min: 2,
            max: 3,
            columns: [
              {
                id: "restriccion",
                label: "Restricción",
                kind: "text",
                placeholder: "p. ej. Dinero",
              },
              { id: "limite", label: "Límite concreto y verificable", kind: "text" },
            ],
          },
        ],
      },
      {
        title: "Paso 2 — Aplica el filtro",
        intro:
          "Tu lista de la semana pasada ya está cargada. Marca si cada opción sobrevive a tus restricciones y, si la eliminas, explica por qué en una frase.",
        fields: [
          {
            type: "list",
            id: "filtro",
            label: "Filtro",
            min: 1,
            max: 40,
            prefillFrom: { week: 5, field: "opciones", column: "opcion", into: "opcion" },
            columns: [
              { id: "opcion", label: "Opción", kind: "text" },
              {
                id: "sobrevive",
                label: "¿Sobrevive?",
                kind: "bool",
                yes: "Sobrevive",
                no: "No sobrevive",
              },
              { id: "porque", label: "Si la eliminas, por qué", kind: "text" },
            ],
          },
        ],
      },
      {
        title: "Paso 3 — ¿Son restricciones reales?",
        fields: [
          {
            type: "scale",
            id: "confianza_restricciones",
            label:
              "Qué tan seguro estoy de que estas restricciones son límites reales y no miedo con otro nombre",
            withReason: true,
          },
        ],
      },
      {
        title: "Paso 4 — Tu dirección",
        fields: [
          {
            type: "text",
            id: "direccion",
            label:
              "De las opciones que sobreviven, ¿cuál sientes con más claridad como tu dirección?",
            minChars: 20,
          },
          {
            type: "text",
            id: "miedo_decidir",
            label: "¿Qué miedo te trae elegirla?",
            minChars: MIN_TEXT,
          },
        ],
      },
    ],
  },
  7: {
    week: 7,
    sections: [
      {
        title: "Define entre 3 y 5 hitos",
        intro:
          "Cada hito ejecuta la dirección que ratificaste la semana pasada. El criterio de cumplimiento se tiene que poder responder con sí o no.",
        fields: [
          {
            type: "list",
            id: "hitos",
            label: "Hitos a 90 días",
            min: 3,
            max: 5,
            columns: [
              { id: "hito", label: "Hito", kind: "text" },
              { id: "fecha", label: "Fecha objetivo", kind: "date" },
              { id: "criterio", label: "Criterio de cumplimiento (sí/no)", kind: "text" },
            ],
          },
        ],
      },
      {
        title: "El hito más difícil",
        fields: [
          {
            type: "text",
            id: "hito_dificil",
            label: "¿Cuál de tus hitos te va a costar más sostener, y por qué?",
            minChars: MIN_TEXT,
          },
        ],
      },
      {
        title: "Para cerrar",
        fields: [
          {
            type: "scale",
            id: "confianza_plan",
            label: "Mi confianza en cumplir este plan tal como está escrito",
            withReason: true,
          },
        ],
      },
    ],
  },
  8: {
    week: 8,
    sections: [
      {
        title: "Paso 1 — Configura tus check-ins",
        fields: [
          {
            type: "select",
            id: "frecuencia",
            label: "Frecuencia de tus check-ins durante los próximos 90 días",
            options: [
              { value: "semanal", label: "Semanal (recomendada)" },
              { value: "quincenal", label: "Cada dos semanas" },
            ],
          },
        ],
      },
      {
        title: "Paso 2 — Reflexión de cierre",
        fields: [
          {
            type: "text",
            id: "que_cambio",
            label:
              "¿Qué cambió entre la auditoría que escribiste en la semana 1 y lo que piensas hoy?",
            minChars: MIN_TEXT,
          },
          {
            type: "text",
            id: "que_evitaste",
            label:
              "¿Qué parte de este proceso evitaste más, y qué hiciste cuando apareció esa evitación?",
            minChars: MIN_TEXT,
          },
          {
            type: "text",
            id: "que_temes",
            label: "¿Qué temes que pase si no sostienes el plan que diseñaste la semana pasada?",
            minChars: MIN_TEXT,
          },
          {
            type: "text",
            id: "sin_resolver",
            label: "Si algo quedó sin resolver en semanas anteriores, ¿cómo lo ves ahora?",
            minChars: 20,
          },
        ],
      },
      {
        title: "Para cerrar",
        fields: [
          {
            type: "scale",
            id: "compromiso",
            label: "Mi compromiso real con sostener este plan",
            withReason: true,
          },
        ],
      },
    ],
  },
};

export function getExerciseSchema(week: number): ExerciseSchema | null {
  return EXERCISE_SCHEMAS[week] ?? null;
}

function isScale(v: unknown): v is ScaleValue {
  return typeof v === "object" && v !== null && !Array.isArray(v) && "value" in v;
}

function rowFilled(row: ListRow, columns: ListColumn[]): boolean {
  return columns.every((c) => {
    const v = row[c.id];
    if (c.kind === "bool") return typeof v === "boolean";
    if (c.kind === "number") return typeof v === "number" && v >= c.min && v <= c.max;
    // En el filtro, «por qué» solo es obligatorio si la opción no sobrevive.
    if (c.id === "porque" && row["sobrevive"] === true) return true;
    return typeof v === "string" && v.trim().length > 0;
  });
}

/**
 * Comprueba que el ejercicio está completo antes de enviarlo a revisión.
 * Devuelve la lista de problemas legibles (vacía si está completo).
 */
export function validateAnswers(schema: ExerciseSchema, answers: ExerciseAnswers): string[] {
  const problems: string[] = [];
  for (const section of schema.sections) {
    for (const field of section.fields) {
      const v = answers[field.id];
      if (field.type === "text") {
        const text = typeof v === "string" ? v.trim() : "";
        const min = field.minChars ?? 0;
        if (min > 0 && text.length === 0) problems.push(`Falta responder: «${field.label}»`);
        else if (min > 0 && text.length < min)
          problems.push(`Desarrolla un poco más: «${field.label}»`);
      } else if (field.type === "scale") {
        if (!isScale(v) || typeof v.value !== "number") {
          problems.push(`Falta la cifra: «${field.label}»`);
        } else if (field.withReason && !(v.reason ?? "").trim()) {
          problems.push(`Justifica la cifra: «${field.label}»`);
        }
      } else if (field.type === "select") {
        if (typeof v !== "string" || !v) problems.push(`Elige una opción: «${field.label}»`);
      } else if (field.type === "list") {
        const rows = Array.isArray(v) ? v : [];
        const filled = rows.filter((r) => rowFilled(r, field.columns));
        if (filled.length < field.min) {
          problems.push(
            `«${field.label}»: necesitas al menos ${field.min} filas completas (tienes ${filled.length}).`,
          );
        }
      }
    }
  }
  return problems;
}

/** Texto legible del ejercicio, para la IA y para el entregable. */
export function formatAnswers(schema: ExerciseSchema, answers: ExerciseAnswers): string {
  const out: string[] = [];
  for (const section of schema.sections) {
    out.push(`## ${section.title}`);
    for (const field of section.fields) {
      const v = answers[field.id];
      if (field.type === "text") {
        out.push(
          `**${field.label}**\n${typeof v === "string" && v.trim() ? v.trim() : "(sin responder)"}`,
        );
      } else if (field.type === "scale") {
        const s = isScale(v) ? v : { value: null };
        out.push(
          `**${field.label}:** ${s.value ?? "—"}/10${s.reason ? ` — ${s.reason.trim()}` : ""}`,
        );
      } else if (field.type === "select") {
        const label = field.options.find((o) => o.value === v)?.label ?? "—";
        out.push(`**${field.label}:** ${label}`);
      } else if (field.type === "list") {
        const rows = Array.isArray(v) ? v : [];
        out.push(`**${field.label}**`);
        rows.forEach((row, i) => {
          const parts = field.columns.map((c) => {
            const cell = row[c.id];
            const text =
              c.kind === "bool"
                ? cell === true
                  ? c.yes
                  : cell === false
                    ? c.no
                    : "—"
                : cell === null || cell === undefined || cell === ""
                  ? "—"
                  : String(cell);
            return `${c.label}: ${text}`;
          });
          out.push(`${i + 1}. ${parts.join(" · ")}`);
        });
      }
    }
  }
  return out.join("\n\n");
}

/* ------------------------------------------------------------------ */
/* Saneado en servidor                                                 */
/* ------------------------------------------------------------------ */

const MAX_TEXT = 6000;
const MAX_CELL = 1000;

/**
 * Reconstruye las respuestas solo con los campos y tipos que define el
 * esquema del módulo: descarta claves desconocidas, recorta textos y filas
 * y fuerza números dentro de rango. Se aplica en el servidor antes de
 * guardar o enviar a la IA, nunca se confía en lo que manda el navegador.
 */
export function sanitizeAnswers(schema: ExerciseSchema, raw: unknown): ExerciseAnswers {
  const input = (raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {}) as Record<
    string,
    unknown
  >;
  const out: ExerciseAnswers = {};
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

  for (const section of schema.sections) {
    for (const field of section.fields) {
      const v = input[field.id];
      if (field.type === "text") {
        out[field.id] = str(v, MAX_TEXT);
      } else if (field.type === "select") {
        const s = str(v, 100);
        out[field.id] = field.options.some((o) => o.value === s) ? s : "";
      } else if (field.type === "scale") {
        const obj = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
        const n =
          typeof obj["value"] === "number" && Number.isInteger(obj["value"]) ? obj["value"] : null;
        const scale: ScaleValue = { value: n !== null && n >= 1 && n <= 10 ? n : null };
        if (field.withReason) scale.reason = str(obj["reason"], MAX_CELL);
        out[field.id] = scale;
      } else if (field.type === "list") {
        const rows = Array.isArray(v) ? v.slice(0, field.max) : [];
        out[field.id] = rows.map((r) => {
          const row = (r && typeof r === "object" ? r : {}) as Record<string, unknown>;
          const clean: ListRow = {};
          for (const c of field.columns) {
            const cell = row[c.id];
            if (c.kind === "bool") clean[c.id] = typeof cell === "boolean" ? cell : null;
            else if (c.kind === "number")
              clean[c.id] =
                typeof cell === "number" && Number.isFinite(cell) && cell >= c.min && cell <= c.max
                  ? Math.round(cell)
                  : null;
            else if (c.kind === "date")
              clean[c.id] =
                typeof cell === "string" && /^\d{4}-\d{2}-\d{2}$/.test(cell) ? cell : "";
            else clean[c.id] = str(cell, MAX_CELL);
          }
          return clean;
        });
      }
    }
  }
  return out;
}
