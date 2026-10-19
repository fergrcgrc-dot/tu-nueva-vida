export type Slide = {
  title: string;
  bullets: string[];
  note?: string | null;
};

/** Apoyo visual del guion de slides (PDF) de un módulo. */
export function SlideDeck({ slides }: { slides: Slide[] }) {
  if (slides.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {slides.map((slide, i) => (
        <article
          key={i}
          className="rounded-xl border border-border bg-secondary/40 p-4"
        >
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Slide {i + 1}
          </p>
          <h3 className="mt-1 font-display text-base font-semibold text-foreground">
            {slide.title}
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-foreground">
            {slide.bullets.map((b, j) => (
              <li key={j}>{b}</li>
            ))}
          </ul>
          {slide.note && (
            <p className="mt-3 text-xs italic text-muted-foreground">Nota de diseño: {slide.note}</p>
          )}
        </article>
      ))}
    </div>
  );
}
