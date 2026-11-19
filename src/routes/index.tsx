import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  Flame,
  Gauge,
  Infinity as InfinityIcon,
  ListChecks,
  Mountain,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";

import { CookieSettingsLink } from "@/components/CookieBanner";
import { LegalLinks } from "@/components/LegalLinks";
import people800 from "@/assets/landing-people-800.webp";
import people1600 from "@/assets/landing-people-1600.webp";
import step1Small from "@/assets/landing-step-1-560.webp";
import step1Large from "@/assets/landing-step-1-1104.webp";
import step2Small from "@/assets/landing-step-2-560.webp";
import step2Large from "@/assets/landing-step-2-1104.webp";
import step3Small from "@/assets/landing-step-3-560.webp";
import step3Large from "@/assets/landing-step-3-1104.webp";

const SITE_URL = "https://tunuevavida.eu";
const SEO_TITLE = "Programa online de reinvención profesional | Tu nueva vida";
const SEO_DESCRIPTION =
  "Reinvéntate profesionalmente con un programa online de 8 módulos y un coach IA: claridad, valores y un plan a 90 días. 399 €, acceso de por vida.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: SEO_TITLE },
      { name: "description", content: SEO_DESCRIPTION },
      { property: "og:title", content: SEO_TITLE },
      { property: "og:description", content: SEO_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:site_name", content: "Tu nueva vida" },
      { property: "og:locale", content: "es_ES" },
      { property: "og:image", content: `${SITE_URL}/og-image.jpg` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "Tu nueva vida, programa online de reinvención profesional",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE_URL}/og-image.jpg` },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/` },
      // La imagen del hero es el LCP en escritorio: se descarga con prioridad.
      {
        rel: "preload",
        as: "image",
        href: people1600,
        imageSrcSet: `${people800} 800w, ${people1600} 1600w`,
        imageSizes: "(max-width: 1024px) 100vw, 1024px",
        fetchPriority: "high",
      },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(structuredData()) }],
  }),
  component: Landing,
});

const NAV = [
  { label: "El método", href: "#metodo" },
  { label: "Módulos", href: "#modulos" },
  { label: "Precio", href: "#precio" },
  { label: "Preguntas", href: "#preguntas" },
  { label: "Blog", href: "/blog" },
];

const PRICE = "399 €";
const CHECKOUT_HREF = "/comprar";
const SUPPORT_EMAIL = "hola@tunuevavida.eu";

const FEATURES = [
  {
    icon: PlayCircle,
    title: "Vídeo y teoría en cada módulo",
    text: "Cada módulo empieza con un vídeo que explica el concepto de la semana y la teoría completa por escrito.",
  },
  {
    icon: BrainCircuit,
    title: "Un coach IA que revisa tu trabajo",
    text: "Haces el ejercicio en la plataforma, lo envías y tu coach IA lo revisa y te devuelve feedback. Y está disponible en cada módulo cuando te atascas.",
  },
  {
    icon: ListChecks,
    title: "Metodología estructurada",
    text: "8 módulos en 4 fases, de mirar de frente dónde estás a tener un plan de 90 días con hitos medibles. Sin teoría genérica de autoayuda.",
  },
  {
    icon: Gauge,
    title: "A tu ritmo",
    text: "Sin horarios ni llamadas. Cada módulo se desbloquea al completar el anterior, desde cualquier dispositivo.",
  },
  {
    icon: InfinityIcon,
    title: "Acceso de por vida",
    text: "Pagas una vez y es tuyo para siempre: los módulos, tus ejercicios, tu informe final y las mejoras futuras del programa.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Descubre tu punto de partida",
    text: "Completa el primer módulo y los ejercicios de diagnóstico: dónde estás, qué duele de verdad y qué te está costando seguir igual.",
    image: { small: step1Small, large: step1Large },
    alt: "Persona reflexionando sobre su situación profesional actual al empezar el programa",
  },
  {
    number: "02",
    title: "Construye tus opciones reales",
    text: "Semana a semana trabajas tus valores, tus creencias limitantes y lo que estás dispuesto a arriesgar, hasta tener direcciones concretas sobre la mesa.",
    image: { small: step2Small, large: step2Large },
    alt: "Profesional trabajando sus valores y opciones de cambio de carrera",
  },
  {
    number: "03",
    title: "Da el primer paso",
    text: "Sales con una hoja de ruta a 90 días con hitos medibles, un informe final de todo tu recorrido y check-ins automáticos que te ayudan a sostenerlo.",
    image: { small: step3Small, large: step3Large },
    alt: "Persona dando el primer paso de su plan de reinvención profesional a 90 días",
  },
];

const MODULES = [
  {
    phase: "Fase 1 · Confrontación",
    question: "¿De dónde vienes de verdad?",
    items: [
      {
        n: 1,
        title: "Auditoría vital honesta",
        text: "Recorres cuatro terrenos —carrera, energía, relaciones y lo que no te acaba de encajar— para ver tu punto de partida real, no la versión que cuentas cuando te preguntan.",
        outcome: "Tu auditoría y tu nivel de energía vital.",
      },
      {
        n: 2,
        title: "El coste de no cambiar",
        text: "Describes un día cualquiera dentro de cinco años si nada cambia y le pones cifra al coste emocional, relacional e identitario.",
        outcome: "El precio real de seguir igual.",
      },
    ],
  },
  {
    phase: "Fase 2 · Claridad",
    question: "¿Qué es importante de verdad?",
    items: [
      {
        n: 3,
        title: "Mapa de valores",
        text: "Descubres tus valores de verdad: eliges y ordenas cinco y mides cuánta atención real recibe cada uno hoy, con ejemplos de tu última semana.",
        outcome: "La distancia entre lo que dices que importa y lo que vives.",
      },
      {
        n: 4,
        title: "Tu hoguera personal",
        text: "Contrastas tu mejor versión con el valor que más desatiendes: dónde está vivo y dónde, exactamente, no lo está.",
        outcome: "La contradicción que te frena, nombrada con tus palabras.",
      },
    ],
  },
  {
    phase: "Fase 3 · Diseño",
    question: "¿Hacia dónde?",
    items: [
      {
        n: 5,
        title: "Generación de opciones",
        text: "Al menos quince direcciones posibles para tu vida o tu carrera, sin «peros» y sin filtrar todavía por viabilidad.",
        outcome: "Un mapa amplio de opciones reales.",
      },
      {
        n: 6,
        title: "Filtro por restricciones reales",
        text: "Aplicas tus límites innegociables y separas las restricciones reales de las que son miedo con otro nombre.",
        outcome: "Una dirección elegida y ratificada por escrito.",
      },
    ],
  },
  {
    phase: "Fase 4 · Acción",
    question: "¿Cuál es el primer paso real?",
    items: [
      {
        n: 7,
        title: "Plan a 90 días",
        text: "Entre tres y cinco hitos con fecha y un criterio de cumplimiento que se responde con sí o no.",
        outcome: "Un plan medible, no una lista de intenciones.",
      },
      {
        n: 8,
        title: "Seguimiento y cierre",
        text: "Configuras tus check-ins automáticos y recibes el informe final de todo tu recorrido.",
        outcome: "Tu informe final y 90 días de seguimiento.",
      },
    ],
  },
];

const INCLUDED = [
  "8 módulos con vídeo explicativo y teoría completa",
  "8 ejercicios prácticos dentro de la plataforma",
  "Revisión y feedback del coach IA en cada ejercicio",
  "Coach IA disponible en cada módulo, a cualquier hora",
  "Revisión de fase al cierre de cada una de las 4 fases",
  "Informe final de tu recorrido completo",
  "Check-ins automáticos durante 90 días",
  "Acceso de por vida, con las mejoras futuras incluidas",
];

const FAQS = [
  {
    q: "¿Es para mí si estoy en plena crisis profesional a los 40 o a los 50?",
    a: "Sí. Está pensado para profesionales que llevan tiempo con la sensación de que su trabajo o su vida actual ya no encajan, y que quieren reinventarse profesionalmente con método y no a base de impulsos. No importa la edad: importa que estés dispuesto a mirar tu situación con honestidad.",
  },
  {
    q: "¿Y si no sé qué quiero hacer con mi vida profesional?",
    a: "Es el punto de partida más habitual. El programa no te pide que llegues con una respuesta: primero aclaras de dónde vienes y qué valoras de verdad, después generas opciones sin autocensura y solo al final eliges una dirección y la conviertes en un plan a 90 días.",
  },
  {
    q: "¿Tengo que dejar mi trabajo para hacer el programa?",
    a: "No. Lo haces compatible con tu trabajo actual, a tu ritmo. De hecho, una de las claves del programa es no tomar decisiones drásticas en caliente: antes de dejar un trabajo, sales con una dirección clara y un plan con hitos medibles y de bajo riesgo.",
  },
  {
    q: "¿En qué se diferencia de un coach de vida tradicional?",
    a: "Un proceso de coaching de vida clásico se basa en sesiones con una persona. Aquí sigues un método estructurado de 8 módulos y te acompaña un coach IA que revisa cada ejercicio y te da feedback al momento, a cualquier hora y por un pago único, en lugar de pagar por sesión.",
  },
  {
    q: "¿Cuánto dura el programa?",
    a: "Lo haces a tu ritmo. Recomendamos un módulo por semana, así que el recorrido completo son unas 8 semanas, con 45-60 minutos de trabajo por módulo.",
  },
  {
    q: "¿Cómo se desbloquean los módulos?",
    a: "Al completar el anterior. Ves el vídeo, haces el ejercicio en la plataforma y lo envías: tu coach IA lo revisa y, cuando está aprobado, se abre el siguiente módulo. Si alguna respuesta se queda en lo genérico, te pide que la precises antes.",
  },
  {
    q: "¿Durante cuánto tiempo tengo acceso?",
    a: "De por vida. Pagas una vez y puedes volver a cualquier módulo, a tus ejercicios y a tu informe final siempre que quieras, incluidas las mejoras que hagamos en el programa.",
  },
  {
    q: "¿Y si no me convence?",
    a: `Tienes 14 días de garantía. Si el programa no es para ti, escribe a ${SUPPORT_EMAIL} desde el email con el que compraste dentro de los 14 días siguientes a la compra y te devolvemos el 100 %, sin preguntas.`,
  },
  {
    q: "¿Hay llamadas o sesiones en directo?",
    a: "No. Es un programa 100 % online y autónomo: sin agendas, sin llamadas y sin esperar a nadie. Todo el acompañamiento lo hace tu coach IA dentro de la plataforma.",
  },
  {
    q: "¿Qué hace exactamente el coach IA?",
    a: "Revisa cada ejercicio y te da feedback concreto: qué está bien trabajado, qué precisar y el patrón que detecta en tus respuestas. También puedes hablar con él en cada módulo cuando te atascas. Usa método socrático: te pregunta y te refleja, no decide por ti ni te da respuestas hechas.",
  },
  {
    q: "¿Sirve si estoy quemado en el trabajo?",
    a: "Puede ayudarte a entender qué está fallando y a decidir qué cambiar. Pero si el agotamiento afecta a tu salud (insomnio, ansiedad, bajas), lo primero es hablar con tu médico o con un profesional de la salud mental: este programa no sustituye ese acompañamiento.",
  },
  {
    q: "¿Es terapia?",
    a: "No. Es un programa de coaching y desarrollo personal y no sustituye la atención psicológica o médica. Si estás pasando por un momento muy difícil, llama al 024 (gratuito, 24 h) o al 112 en caso de emergencia.",
  },
  {
    q: "¿Qué pasa con lo que escribo?",
    a: "Tus respuestas son privadas: no se publican ni se comparten con terceros, y solo se usan para que tu coach IA te dé feedback con el contexto de tus módulos anteriores.",
  },
  {
    q: "¿Cómo se paga?",
    a: `Pago único de ${PRICE}, con tarjeta u otros métodos, a través de Lemon Squeezy, que emite tu factura. Al terminar el pago recibes un email para crear tu contraseña y empezar al momento.`,
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
              href={CHECKOUT_HREF}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Empezar · {PRICE}
            </a>
          </div>
        </nav>
      </header>

      <section id="inicio" className="landing-hero-bg px-5 pt-20 pb-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent-foreground uppercase">
            Programa online de reinvención profesional
          </p>
          <h1 className="landing-hero-title-gradient mx-auto mt-6 max-w-3xl text-5xl leading-[1.05] font-bold tracking-tight sm:text-6xl md:text-7xl">
            Reinvéntate profesionalmente cuando tu vida actual ya no tiene sentido
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Para profesionales en plena crisis profesional que no saben qué hacer con su vida: ocho
            módulos guiados y un coach IA para pasar de la duda a un plan concreto a 90 días.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href={CHECKOUT_HREF}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Empieza el programa · {PRICE}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </BuyProgramButton>
            <a
              href="#modulos"
              className="inline-flex items-center rounded-full border border-primary/25 px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Ver los 8 módulos
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Pago único · Acceso de por vida · Garantía de 14 días
          </p>
        </div>
        <div className="mx-auto mt-14 max-w-5xl overflow-hidden rounded-[2rem] landing-soft-card">
          <img
            src={people1600}
            srcSet={`${people800} 800w, ${people1600} 1600w`}
            sizes="(max-width: 1024px) 100vw, 1024px"
            alt="Profesionales de distintas edades que se plantean un cambio de vida profesional"
            width={1600}
            height={704}
            fetchPriority="high"
            decoding="async"
            className="h-auto w-full object-cover"
          />
        </div>
      </section>

      <section id="programa" className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Qué incluye el programa de coaching online
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
            <article className="landing-card-gradient rounded-3xl p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-card/25">
                <Flame className="h-5 w-5 text-card" aria-hidden />
              </span>
              <p className="mt-5 text-xl font-bold tracking-tight text-card">Empieza hoy</p>
              <p className="mt-2 text-sm leading-relaxed text-card/90">
                Da el primer paso hacia claridad real sobre tu próximo camino.
              </p>
              <a
                href={CHECKOUT_HREF}
                className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Empieza ahora · {PRICE}
              </a>
            </article>
          </div>
        </div>
      </section>

      <section id="metodo" className="landing-band-mint px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Cómo funciona: de la crisis profesional a un plan de acción
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
                  <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">{step.text}</p>
                </div>
                <figure className="overflow-hidden rounded-[2rem] landing-soft-card">
                  <img
                    src={step.image.large}
                    srcSet={`${step.image.small} 560w, ${step.image.large} 1104w`}
                    sizes="(max-width: 768px) 100vw, 560px"
                    alt={step.alt}
                    loading="lazy"
                    decoding="async"
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

      <section id="modulos" className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Los 8 módulos del programa
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Cada módulo tiene un vídeo, la teoría y un ejercicio práctico que haces en la plataforma
            y revisa tu coach IA. Se abren en orden: el siguiente se desbloquea al completar el
            anterior.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {MODULES.map((phase) => (
              <div key={phase.phase} className="landing-soft-card rounded-3xl p-7">
                <p className="text-xs font-semibold tracking-[0.2em] text-ember-strong uppercase">
                  {phase.phase}
                </p>
                <p className="mt-1 text-sm text-muted-foreground italic">{phase.question}</p>
                <ol className="mt-6 space-y-6">
                  {phase.items.map((m) => (
                    <li key={m.n} className="flex gap-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold">
                        {m.n}
                      </span>
                      <div>
                        <h3 className="text-lg font-bold tracking-tight">{m.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {m.text}
                        </p>
                        <p className="mt-2 text-sm font-medium">
                          <span className="text-ember-strong">Te llevas:</span> {m.outcome}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="precio" className="landing-band-pink px-5 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="landing-soft-card rounded-[2.5rem] p-8 sm:p-12">
            <p className="text-xs font-semibold tracking-[0.2em] text-accent-foreground uppercase">
              Tu nueva vida · Programa completo
            </p>
            <div className="mt-4 flex items-end gap-3">
              <p className="text-6xl font-bold tracking-tight">{PRICE}</p>
              <p className="pb-2 text-sm text-muted-foreground">pago único · impuestos incluidos</p>
            </div>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {INCLUDED.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-relaxed">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-ember" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href={CHECKOUT_HREF}
              className="mt-10 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Comprar el programa · {PRICE}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <p className="mt-4 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-ember" aria-hidden />
              Garantía de 14 días: si no es para ti, te devolvemos el 100 %.
            </p>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Al comprar aceptas las{" "}
              <Link to="/legal/$slug" params={{ slug: "condiciones" }} className="underline">
                condiciones de venta
              </Link>{" "}
              y la{" "}
              <Link to="/legal/$slug" params={{ slug: "privacidad" }} className="underline">
                política de privacidad
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section id="preguntas" className="px-5 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Preguntas frecuentes sobre el programa
          </h2>
          <div className="mt-10 divide-y divide-border/70 border-y border-border/70">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold">
                  {f.q}
                  <span
                    className="text-xl text-ember-strong transition-transform group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-24">
        <div className="mx-auto max-w-5xl rounded-[2.5rem] bg-primary px-8 py-16 text-center text-primary-foreground">
          <Mountain className="mx-auto h-7 w-7 text-gold" aria-hidden />
          <h2 className="mx-auto mt-6 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Tu próximo paso empieza hoy
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-primary-foreground/75">
            Ocho módulos, tu coach IA y un plan de 90 días. Acceso inmediato y de por vida, con
            garantía de 14 días.
          </p>
          <a
            href={CHECKOUT_HREF}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-card px-7 py-3.5 text-sm font-semibold text-card-foreground transition-opacity hover:opacity-90"
          >
            Empieza el programa · {PRICE}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </section>

      <footer className="landing-footer-bg px-5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} Tu nueva vida</p>
            <div className="flex flex-wrap items-center gap-5">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="transition-colors hover:text-foreground"
              >
                {SUPPORT_EMAIL}
              </a>
              <Link to="/blog" className="transition-colors hover:text-foreground">
                Blog
              </Link>
              <Link to="/login" className="font-medium transition-colors hover:text-foreground">
                Acceder al programa
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
            <LegalLinks />
            <CookieSettingsLink />
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Datos estructurados (Schema.org) de la home: organización, web, curso y FAQ. */
function structuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Tu nueva vida",
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/logo.svg`,
        email: SUPPORT_EMAIL,
        areaServed: { "@type": "Country", name: "España" },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: "Tu nueva vida",
        inLanguage: "es-ES",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "Course",
        "@id": `${SITE_URL}/#programa`,
        name: "Tu nueva vida: programa online de reinvención profesional",
        description: SEO_DESCRIPTION,
        inLanguage: "es-ES",
        provider: { "@id": `${SITE_URL}/#organization` },
        image: `${SITE_URL}/og-image.jpg`,
        numberOfCredits: 8,
        syllabusSections: MODULES.flatMap((phase) =>
          phase.items.map((m) => ({
            "@type": "Syllabus",
            name: `Módulo ${m.n}: ${m.title}`,
            description: m.text,
          })),
        ),
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "Online",
          courseWorkload: "PT8H",
          courseSchedule: { "@type": "Schedule", repeatFrequency: "P1W", repeatCount: 8 },
        },
        offers: {
          "@type": "Offer",
          category: "Paid",
          price: "399",
          priceCurrency: "EUR",
          url: `${SITE_URL}/#precio`,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}
