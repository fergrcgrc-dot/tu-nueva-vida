import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BrainCircuit,
  CalendarClock,
  Flame,
  Gauge,
  ListChecks,
  MessageCircleHeart,
  Mountain,
} from "lucide-react";

import people from "@/assets/landing-people.jpg";
import step1 from "@/assets/landing-step-1.jpg";
import step2 from "@/assets/landing-step-2.jpg";
import step3 from "@/assets/landing-step-3.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tu nueva vida — Programa de transformación profesional" },
      {
        name: "description",
        content:
          "Programa online guiado semana a semana para profesionales de alto rendimiento que necesitan claridad real antes de dar el siguiente paso.",
      },
      { property: "og:title", content: "Tu nueva vida — Programa de transformación profesional" },
      {
        property: "og:description",
        content:
          "Ocho semanas, un módulo nuevo cada semana y ejercicios guiados por IA para decidir tu próximo paso profesional con claridad.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const NAV = [
  { label: "Inicio", href: "#inicio" },
  { label: "El método", href: "#metodo" },
  { label: "Programa", href: "#programa" },
  { label: "Testimonios", href: "#testimonios" },
  { label: "Contacto", href: "#contacto" },
];

const FEATURES = [
  {
    icon: CalendarClock,
    title: "Contenido semanal",
    text: "Cada semana se desbloquea un módulo nuevo, sin agobios ni maratones de contenido.",
  },
  {
    icon: BrainCircuit,
    title: "Ejercicios guiados por IA",
    text: "Un acompañante conversacional te ayuda a explorar tus valores, deseos y convicciones a tu ritmo.",
  },
  {
    icon: ListChecks,
    title: "Metodología estructurada",
    text: "Basado en un proceso real de reinvención profesional, no en teoría genérica de autoayuda.",
  },
  {
    icon: Gauge,
    title: "A tu ritmo",
    text: "Accede desde cualquier dispositivo y avanza cuando tengas tiempo real.",
  },
  {
    icon: MessageCircleHeart,
    title: "Del programa a lo personal",
    text: "Tu nueva vida es la puerta de entrada al acompañamiento 1:1 si decides ir más profundo.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Descubre tu punto de partida",
    text: "Completa el primer módulo y los ejercicios de diagnóstico: dónde estás, qué duele de verdad y qué te está costando seguir igual.",
    image: step1,
  },
  {
    number: "02",
    title: "Construye tus opciones reales",
    text: "Semana a semana trabajas tus valores, tus creencias limitantes y lo que estás dispuesto a arriesgar, hasta tener direcciones concretas sobre la mesa.",
    image: step2,
  },
  {
    number: "03",
    title: "Da el primer paso",
    text: "Sales con una hoja de ruta a 90 días, experimentos de bajo riesgo y la opción de seguir con acompañamiento 1:1 o el retiro en León.",
    image: step3,
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Llevaba dos años dándole vueltas a lo mismo. En ocho semanas dejé de rumiar y empecé a probar cosas de verdad.",
    name: "Marta R.",
    role: "Directora de operaciones",
  },
  {
    quote:
      "No es contenido motivacional. Son preguntas incómodas en el momento justo, y eso es exactamente lo que necesitaba.",
    name: "Javier L.",
    role: "Consultor tecnológico",
  },
  {
    quote:
      "Salí con un plan concreto y con la tranquilidad de haberlo decidido yo, no de haberlo copiado de nadie.",
    name: "Elena S.",
    role: "Responsable de producto",
  },
];

function Landing() {
  return (
    <div className="landing min-h-screen font-body">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="#inicio" className="flex items-center gap-2">
            <img src="/logo.svg" alt="" width={32} height={32} className="h-8 w-8" aria-hidden />
            <span className="text-lg font-bold tracking-tight">Tu nueva vida</span>
          </a>
          <div className="hidden items-center gap-7 md:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Acceder
            </Link>
            <a
              href="#contacto"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Reserva tu llamada
            </a>
          </div>
        </nav>
      </header>

      <section id="inicio" className="landing-hero-bg px-5 pt-20 pb-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent-foreground uppercase">
            Programa de transformación profesional
          </p>
          <h1 className="landing-hero-title-gradient mx-auto mt-6 max-w-3xl text-5xl leading-[1.05] font-bold tracking-tight sm:text-6xl md:text-7xl">
            Tu nueva vida empieza cuando la actual ya no tiene sentido
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Un programa guiado semana a semana para profesionales de alto rendimiento que
            necesitan claridad real antes de dar el siguiente paso.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#contacto"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Empieza tu nueva vida
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <a
              href="#contacto"
              className="inline-flex items-center rounded-full border border-primary/25 px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Habla con Fernando
            </a>
          </div>
        </div>
        <div className="mx-auto mt-14 max-w-5xl overflow-hidden rounded-[2rem] landing-soft-card">
          <img
            src={people}
            alt="Profesionales de distintas edades y orígenes que han pasado por el programa"
            width={1600}
            height={704}
            className="h-auto w-full object-cover"
          />
        </div>
      </section>

      <section id="programa" className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Qué incluye el programa
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <article key={f.title} className="landing-soft-card rounded-3xl p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent">
                  <f.icon className="h-5 w-5 text-ember" aria-hidden />
                </span>
                <h3 className="mt-5 text-xl font-bold tracking-tight">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              </article>
            ))}
            <article
              className="landing-card-gradient rounded-3xl p-7"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-card/25">
                <Flame className="h-5 w-5 text-card" aria-hidden />
              </span>
              <h3 className="mt-5 text-xl font-bold tracking-tight text-card">Empieza hoy</h3>
              <p className="mt-2 text-sm leading-relaxed text-card/90">
                Da el primer paso hacia claridad real sobre tu próximo camino.
              </p>
              <a
                href="#contacto"
                className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Empieza ahora
              </a>
            </article>
          </div>
        </div>
      </section>

      <section id="metodo" className="landing-band-mint px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Cómo funciona
          </h2>
          <div className="mt-14 space-y-16">
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                className={`grid items-center gap-10 md:grid-cols-2 ${
                  i % 2 === 1 ? "md:[&>figure]:order-first" : ""
                }`}
              >
                <div>
                  <p className="text-5xl font-bold text-ember/40">{step.number}</p>
                  <h3 className="mt-4 text-3xl font-bold tracking-tight">{step.title}</h3>
                  <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">
                    {step.text}
                  </p>
                </div>
                <figure className="overflow-hidden rounded-[2rem] landing-soft-card">
                  <img
                    src={step.image}
                    alt={step.title}
                    loading="lazy"
                    width={1104}
                    height={912}
                    className="h-full w-full object-cover"
                  />
                </figure>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonios" className="landing-band-pink px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Lo que cuentan quienes ya lo han hecho
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <blockquote key={t.name} className="landing-soft-card rounded-3xl p-7">
                <Flame className="h-5 w-5 text-ember" aria-hidden />
                <p className="mt-4 text-base leading-relaxed">“{t.quote}”</p>
                <footer className="mt-6">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section id="contacto" className="px-5 pb-24">
        <div className="mx-auto max-w-5xl rounded-[2.5rem] bg-primary px-8 py-16 text-center text-primary-foreground">
          <Mountain className="mx-auto h-7 w-7 text-gold" aria-hidden />
          <h2 className="mx-auto mt-6 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Hablemos de tu próximo paso
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-primary-foreground/75">
            Una llamada con Fernando García para ver si el programa encaja contigo. Sin
            compromiso y sin discurso de ventas.
          </p>
          <a
            href="mailto:hola@tunuevavida.com?subject=Reserva%20de%20llamada%20—%20Tu%20nueva%20vida"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-card px-7 py-3.5 text-sm font-semibold text-card-foreground transition-opacity hover:opacity-90"
          >
            Reserva tu llamada
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </section>

      <footer className="landing-footer-bg px-5 py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>Tu nueva vida — por Fernando García.</p>
          <Link to="/login" className="font-medium transition-colors hover:text-foreground">
            Acceder al programa
          </Link>
        </div>
      </footer>
    </div>
  );
}
