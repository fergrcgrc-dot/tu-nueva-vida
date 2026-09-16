import { useState, type FormEvent } from "react";
import { Plus, ShieldCheck, Flame, X } from "lucide-react";

export type MatrixItem = {
  id: string;
  text: string;
  nonNegotiable: boolean;
};

type Props = {
  items: MatrixItem[];
  onChange: (items: MatrixItem[]) => void;
  readOnly?: boolean;
};

/**
 * Matriz de decisión de 2 columnas: lo que estoy dispuesto a arriesgar y lo
 * innegociable. Se reutiliza en los módulos 4 y 6.
 */
export function DecisionMatrix({ items, onChange, readOnly = false }: Props) {
  const [draft, setDraft] = useState("");

  function addItem(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onChange([
      ...items,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, text, nonNegotiable: false },
    ]);
    setDraft("");
  }

  function move(id: string, nonNegotiable: boolean) {
    onChange(items.map((i) => (i.id === id ? { ...i, nonNegotiable } : i)));
  }

  function remove(id: string) {
    onChange(items.filter((i) => i.id !== id));
  }

  const columns = [
    {
      key: "risk",
      title: "Dispuesto a arriesgar",
      icon: Flame,
      list: items.filter((i) => !i.nonNegotiable),
      target: true,
      actionLabel: "Marcar como innegociable",
    },
    {
      key: "fixed",
      title: "Innegociable",
      icon: ShieldCheck,
      list: items.filter((i) => i.nonNegotiable),
      target: false,
      actionLabel: "Pasar a lo que puedo arriesgar",
    },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {columns.map((col) => (
          <div
            key={col.key}
            onDragOver={readOnly ? undefined : (e) => e.preventDefault()}
            onDrop={
              readOnly
                ? undefined
                : (e) => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData("text/plain");
                    if (id) move(id, !col.target);
                  }
            }
            className="rounded-xl border border-border bg-secondary/40 p-4"
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <col.icon className="h-4 w-4 text-primary" aria-hidden />
              {col.title}
            </p>
            <ul className="mt-3 space-y-2">
              {col.list.length === 0 && (
                <li className="text-xs text-muted-foreground">Sin elementos todavía.</li>
              )}
              {col.list.map((item) => (
                <li
                  key={item.id}
                  draggable={!readOnly}
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", item.id)}
                  className="group flex items-start justify-between gap-2 rounded-lg bg-background/70 px-3 py-2 text-sm text-foreground"
                >
                  <span className="leading-relaxed">{item.text}</span>
                  {!readOnly && (
                    <span className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => move(item.id, col.target)}
                        title={col.actionLabel}
                        aria-label={col.actionLabel}
                        className="rounded p-1 text-muted-foreground transition-colors hover:text-primary"
                      >
                        <ShieldCheck className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        aria-label="Quitar elemento"
                        className="rounded p-1 text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <X className="h-4 w-4" aria-hidden />
                      </button>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {!readOnly && (
        <form onSubmit={addItem} className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Añade un elemento a la matriz…"
            className="flex-1 rounded-lg border border-input bg-secondary px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/50 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Añadir
          </button>
        </form>
      )}
    </div>
  );
}
