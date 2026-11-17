import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Plus, Trash2 } from "lucide-react";

import type {
  ExerciseAnswers,
  ExerciseField,
  ExerciseSchema,
  ListColumn,
  ListRow,
  ScaleValue,
} from "@/lib/exercise-schemas";

type Props = {
  schema: ExerciseSchema;
  answers: ExerciseAnswers;
  onChange: (next: ExerciseAnswers) => void;
  readOnly?: boolean | undefined;
};

const inputClass =
  "w-full rounded-lg border border-input bg-secondary px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring disabled:opacity-70";

/* ------------------------------------------------------------------ */
/* Dictado por voz (Web Speech API, sin coste; oculto si no hay soporte) */
/* ------------------------------------------------------------------ */

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult:
    | ((e: {
        resultIndex: number;
        results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
      }) => void)
    | null;
  onend: (() => void) | null;
};

function getRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

function DictateButton({ onText }: { onText: (text: string) => void }) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => setSupported(getRecognition() !== null), []);
  if (!supported) return null;

  function toggle() {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = getRecognition();
    if (!rec) return;
    rec.lang = "es-ES";
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r?.isFinal) text += r[0].transcript;
      }
      if (text.trim()) onText(text.trim());
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
        listening
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
      aria-pressed={listening}
    >
      {listening ? (
        <MicOff className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <Mic className="h-3.5 w-3.5" aria-hidden />
      )}
      {listening ? "Parar dictado" : "Dictar"}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Campos                                                              */
/* ------------------------------------------------------------------ */

function TextField({
  field,
  value,
  onChange,
  readOnly,
}: {
  field: Extract<ExerciseField, { type: "text" }>;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean | undefined;
}) {
  const min = field.minChars ?? 0;
  const len = value.trim().length;
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <label htmlFor={field.id} className="text-sm font-medium text-foreground">
          {field.label}
        </label>
        {!readOnly && (
          <DictateButton onText={(t) => onChange(value ? `${value.trimEnd()} ${t}` : t)} />
        )}
      </div>
      {field.hint && <p className="mt-1 text-xs text-muted-foreground">{field.hint}</p>}
      <textarea
        id={field.id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        disabled={readOnly}
        className={`mt-2 ${inputClass}`}
      />
      {!readOnly && min > 0 && len < min && (
        <p className="mt-1 text-xs text-muted-foreground">
          {len === 0
            ? "Pendiente"
            : "Concreta un poco más: un ejemplo, una fecha, una frase exacta."}
        </p>
      )}
    </div>
  );
}

function ScaleField({
  field,
  value,
  onChange,
  readOnly,
}: {
  field: Extract<ExerciseField, { type: "scale" }>;
  value: ScaleValue;
  onChange: (v: ScaleValue) => void;
  readOnly?: boolean | undefined;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground">{field.label} (1-10)</p>
      <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label={field.label}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value.value === n}
            disabled={readOnly}
            onClick={() => onChange({ ...value, value: n })}
            className={`h-9 w-9 rounded-lg border text-sm font-semibold transition-colors ${
              value.value === n
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground hover:border-primary/50"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {field.withReason && (
        <input
          value={value.reason ?? ""}
          onChange={(e) => onChange({ ...value, reason: e.target.value })}
          disabled={readOnly}
          placeholder="Una frase que explique la cifra"
          className={`mt-2 ${inputClass}`}
        />
      )}
    </div>
  );
}

function Cell({
  column,
  value,
  onChange,
  readOnly,
}: {
  column: ListColumn;
  value: ListRow[string];
  onChange: (v: ListRow[string]) => void;
  readOnly?: boolean | undefined;
}) {
  if (column.kind === "bool") {
    return (
      <div className="flex gap-1.5">
        {[true, false].map((b) => (
          <button
            key={String(b)}
            type="button"
            disabled={readOnly}
            onClick={() => onChange(b)}
            className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              value === b
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground hover:border-primary/50"
            }`}
          >
            {b ? column.yes : column.no}
          </button>
        ))}
      </div>
    );
  }
  if (column.kind === "number") {
    return (
      <input
        type="number"
        min={column.min}
        max={column.max}
        value={typeof value === "number" ? value : ""}
        disabled={readOnly}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        className={inputClass}
      />
    );
  }
  return (
    <input
      type={column.kind === "date" ? "date" : "text"}
      value={typeof value === "string" ? value : ""}
      placeholder={column.kind === "text" ? column.placeholder : undefined}
      disabled={readOnly}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
    />
  );
}

function ListField({
  field,
  rows,
  onChange,
  readOnly,
}: {
  field: Extract<ExerciseField, { type: "list" }>;
  rows: ListRow[];
  onChange: (rows: ListRow[]) => void;
  readOnly?: boolean | undefined;
}) {
  const update = (i: number, col: string, v: ListRow[string]) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, [col]: v } : r)));

  return (
    <div>
      <p className="text-sm font-medium text-foreground">
        {field.label}{" "}
        <span className="font-normal text-muted-foreground">
          ({rows.length}
          {field.min === field.max ? ` de ${field.max}` : `, mínimo ${field.min}`})
        </span>
      </p>
      {field.hint && <p className="mt-1 text-xs text-muted-foreground">{field.hint}</p>}
      <ol className="mt-3 space-y-3">
        {rows.map((row, i) => (
          <li key={i} className="rounded-xl border border-border p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">#{i + 1}</span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => onChange(rows.filter((_, j) => j !== i))}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={`Eliminar fila ${i + 1}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {field.columns.map((c) => (
                <label key={c.id} className={c.kind === "text" ? "sm:col-span-2" : ""}>
                  <span className="mb-1 block text-xs text-muted-foreground">{c.label}</span>
                  <Cell
                    column={c}
                    value={row[c.id] ?? null}
                    onChange={(v) => update(i, c.id, v)}
                    readOnly={readOnly}
                  />
                </label>
              ))}
            </div>
          </li>
        ))}
      </ol>
      {!readOnly && rows.length < field.max && (
        <button
          type="button"
          onClick={() => onChange([...rows, {}])}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50"
        >
          <Plus className="h-4 w-4" aria-hidden /> Añadir
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Formulario                                                          */
/* ------------------------------------------------------------------ */

export function ExerciseForm({ schema, answers, onChange, readOnly }: Props) {
  const set = (id: string, v: ExerciseAnswers[string]) => onChange({ ...answers, [id]: v });

  return (
    <div className="space-y-8">
      {schema.sections.map((section) => (
        <fieldset key={section.title} className="space-y-5">
          <legend className="font-display text-base font-semibold text-foreground">
            {section.title}
          </legend>
          {section.intro && <p className="text-sm text-muted-foreground">{section.intro}</p>}
          {section.fields.map((field) => {
            const v = answers[field.id];
            if (field.type === "text")
              return (
                <TextField
                  key={field.id}
                  field={field}
                  value={typeof v === "string" ? v : ""}
                  onChange={(x) => set(field.id, x)}
                  readOnly={readOnly}
                />
              );
            if (field.type === "scale")
              return (
                <ScaleField
                  key={field.id}
                  field={field}
                  value={(v as ScaleValue) ?? { value: null }}
                  onChange={(x) => set(field.id, x)}
                  readOnly={readOnly}
                />
              );
            if (field.type === "select")
              return (
                <div key={field.id}>
                  <label htmlFor={field.id} className="text-sm font-medium text-foreground">
                    {field.label}
                  </label>
                  <select
                    id={field.id}
                    value={typeof v === "string" ? v : ""}
                    disabled={readOnly}
                    onChange={(e) => set(field.id, e.target.value)}
                    className={`mt-2 ${inputClass}`}
                  >
                    <option value="">Elige…</option>
                    {field.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            return (
              <ListField
                key={field.id}
                field={field}
                rows={Array.isArray(v) ? v : []}
                onChange={(x) => set(field.id, x)}
                readOnly={readOnly}
              />
            );
          })}
        </fieldset>
      ))}
    </div>
  );
}
