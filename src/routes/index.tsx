import { createFileRoute, Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/Reveal";

import heroNight from "@/assets/mountains-under-starry-sky.jpg";
import dayPicos from "@/assets/picos-de-europa-vistos-desde-la-fuente.jpg";
import trail from "@/assets/mountaineering-man-trail-path-mountains.jpg";
import campfire from "@/assets/campfire-flames-at-night.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tu nueva vida, programa de transformación profesional" },
      {
        name: "description",
        content:
          "Ocho semanas para decidir tu próximo paso profesional: módulos guiados, ejercicios con IA y la opción de un retiro con hoguera en las montañas de León, con Fernando García.",
      },
      { property: "og:title", content: "Tu nueva vida, programa de transformación profesional" },
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
  { label: "Programa", href: "#programa" },
  { label: "Método", href: "#metodo" },
  { label: "Testimonios", href: "#testimonios" },
  { label: "Contacto", href: "#contacto" },
];

const FEATURES = [
  {
    title: "Un módulo cada semana",
    text: "Se desbloquea un módulo nuevo cada semana: nada que maratonear, nada que posponer. Solo el ritmo que puedes sostener.",
    image: dayPicos,
    alt: "Vista diurna de los Picos de Europa desde un mirador de montaña",
    imgClass: "aspect-[3/2] sm:w-[22rem]",
    position: "object-center",
  },
  {
    title: "Ejercicios con IA",
    text: "Un acompañante conversacional te ayuda a nombrar lo que te está costando seguir igual, a tu ritmo y en tus palabras.",
    image: campfire,
    alt: "Primer plano de las llamas de una hoguera de noche",
    imgClass: "aspect-square sm:w-[14rem]",
    position: "object-center",
  },
  {
    title: "Un método, no una teoría",
    text: "Viene de un proceso real de reinvención profesional, no de una lista genérica de consejos de autoayuda.",
    image: trail,
    alt: "Persona caminando de espaldas por un sendero de montaña",
    imgClass: "aspect-[4/5] sm:w-[15rem]",
    position: "object-top",
  },
  {
    title: "Termina con un plan a 90 días",
    text: "No sales con buenas intenciones: sales con una hoja de ruta concreta y la opción de seguir con acompañamiento 1:1.",
    image: heroNight,
    alt: "Cresta de montaña de noche con una cumbre nevada iluminada bajo las estrellas",
    imgClass: "aspect-[3/2] sm:w-[20rem]",
    position: "object-[center_30%]",
  },
];

const STAGES = [
  {
    verb: "Descubre",
    text: "Completa el diagnóstico: qué te duele de verdad y qué te está costando seguir ignorando.",
    image: dayPicos,
    alt: "Vista diurna de los Picos de Europa desde un mirador de montaña",
  },
  {
    verb: "Decide",
    text: "Semana a semana trabajas tus valores y tus creencias limitantes, hasta tener opciones reales sobre la mesa.",
    image: trail,
    alt: "Persona caminando de espaldas por un sendero de montaña",
  },
  {
    verb: "Avanza",
    text: "Sales con una hoja de ruta a 90 días y, si quieres, un retiro con hoguera en las montañas de León.",
    image: campfire,
    alt: "Primer plano de las llamas de una hoguera de noche",
  },
];

const FEATURED_TESTIMONIAL = {
  quote:
    "Llevaba dos años dándole vueltas a lo mismo. En ocho semanas dejé de rumiar y empecé a probar cosas de verdad.",
  name: "Marta R.",
  role: "Directora de operaciones",
};

const OTHER_TESTIMONIALS = [
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
  const year = new Date().getFullYear();

  return (
    <div className="landing min-h-dvh">
      {/* ───────── Hero: una foto, el nombre en el raíl, nada más ───────── */}
      <section id="inicio" className="relative h-[100svh] min-h-[640px] overflow-hidden">
        <img
          src={heroNight}
          alt="Cresta de montaña de noche con una cumbre nevada iluminada bajo un cielo estrellado"
          className="landing-drift absolute inset-0 h-full w-full object-cover object-[center_28%]"
        />
        <div className="landing-scrim-b pointer-events-none absolute inset-0" />

        <div className="relative flex h-full flex-col">
          <div className="landing-rail">
            <div className="mx-auto flex w-full max-w-[1800px] flex-wrap items-center gap-x-8 gap-y-3 px-5 py-5 sm:px-8">
              <a
                href="#inicio"
                className="landing-load flex items-center gap-3"
                style={{ "--load-delay": "0ms" } as CSSProperties}
              >
                <img src="/logo.svg" alt="" width={28} height={28} className="h-7 w-7" aria-hidden />
                {/* Tamaño propio (32–40px): el nombre vive en el raíl de navegación, no a tamaño de titular de sección. */}
                <h1 className="text-[clamp(2rem,2.8vw,2.5rem)] font-medium tracking-tight">
                  Tu nueva vida
                </h1>
              </a>

              <p
                className="landing-load order-3 w-full max-w-[44ch] text-[var(--l-step-body)] sm:order-none sm:ml-4 sm:w-auto"
                style={{ "--load-delay": "120ms" } as CSSProperties}
              >
                Ocho semanas para decidir tu próximo paso profesional.
              </p>

              <nav className="ml-auto hidden items-center gap-7 md:flex" aria-label="Secciones">
                {NAV.map((item, i) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="landing-load landing-link landing-muted text-sm hover:text-[var(--l-ink)]"
                    style={{ "--load-delay": `${220 + i * 30}ms` } as CSSProperties}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              <div
                className="landing-load ml-auto flex items-center gap-5 md:ml-0"
                style={{ "--load-delay": "300ms" } as CSSProperties}
              >
                <Link
                  to="/login"
                  className="landing-link landing-muted hidden text-sm hover:text-[var(--l-ink)] sm:block"
                >
                  Acceder
                </Link>
                <a href="#contacto" className="landing-btn px-5 py-2.5 text-sm">
                  Reserva tu llamada
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Qué incluye: el único campo de día de la página ───────── */}
      <section id="programa" className="landing-day px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-[1800px]">
          <Reveal as="h2" className="text-[var(--l-step-head)] font-medium tracking-tight">
            Qué incluye
          </Reveal>

          <div className="mt-16 flex flex-col gap-20 sm:mt-24 sm:gap-28">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className="grid grid-cols-1 items-center gap-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-16"
              >
                <Reveal delay={i * 70} className="max-w-[34ch]">
                  <h3 className="text-[var(--l-step-lead)] font-medium tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-[var(--l-step-body)] leading-relaxed">{feature.text}</p>
                </Reveal>
                <Reveal delay={i * 70 + 90} className="w-full sm:w-auto">
                  <img
                    src={feature.image}
                    alt={feature.alt}
                    loading="lazy"
                    className={`${feature.imgClass} ${feature.position} block w-full object-cover`}
                  />
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Cómo funciona: un verbo a pantalla completa por etapa ───────── */}
      <section aria-label="Cómo funciona">
        {STAGES.map((stage, i) => (
          <div key={stage.verb} className="relative h-[100svh] min-h-[560px] overflow-hidden">
            <img
              src={stage.image}
              alt={stage.alt}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="landing-scrim-t pointer-events-none absolute inset-0" />

            <div className="relative flex h-full items-center justify-center px-5 py-8">
              <Reveal
                as="p"
                delay={i * 40}
                className="pointer-events-none text-center leading-[1.1] font-medium tracking-tight text-[var(--l-ink)] [font-size:clamp(4.5rem,16vw,13rem)]"
              >
                {stage.verb}
              </Reveal>
            </div>

            <div className="landing-scrim-corner absolute inset-x-0 bottom-0">
              <p className="max-w-[46ch] p-5 text-[17px] text-[var(--l-ink)] sm:p-8">{stage.text}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ───────── Testimonios ───────── */}
      <section id="testimonios" className="px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-[1800px]">
          <Reveal as="h2" className="text-[var(--l-step-head)] font-medium tracking-tight">
            Lo que cuentan
          </Reveal>

          <div className="mt-16 grid gap-12 sm:mt-24 sm:grid-cols-12 sm:gap-8">
            <Reveal className="sm:col-span-7">
              <blockquote className="max-w-[42ch] text-[clamp(1.375rem,2.2vw,2.25rem)] leading-[1.3] font-normal text-[var(--l-ink)]">
                “{FEATURED_TESTIMONIAL.quote}”
              </blockquote>
              <footer className="mt-8 text-[var(--l-step-body)]">
                <p className="font-medium">{FEATURED_TESTIMONIAL.name}</p>
                <p className="landing-muted">{FEATURED_TESTIMONIAL.role}</p>
              </footer>
            </Reveal>

            <Reveal delay={120} className="sm:col-span-4 sm:col-start-9">
              <img
                src={heroNight}
                alt="Cresta de montaña de noche bajo un cielo estrellado"
                loading="lazy"
                className="aspect-square w-full max-w-[280px] object-cover object-[center_20%]"
              />
            </Reveal>
          </div>

          <div className="mt-20 grid gap-12 sm:mt-28 sm:grid-cols-2 sm:gap-16">
            {OTHER_TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 80}>
                <blockquote className="text-[var(--l-step-lead)] leading-snug text-[var(--l-ink)]">
                  “{t.quote}”
                </blockquote>
                <footer className="mt-5 text-[var(--l-step-body)]">
                  <p className="font-medium">{t.name}</p>
                  <p className="landing-muted">{t.role}</p>
                </footer>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Contacto: la última foto, el texto al lado ───────── */}
      <section id="contacto" className="relative h-[90svh] min-h-[600px] overflow-hidden">
        <img
          src={campfire}
          alt="Hoguera encendida de noche durante el retiro en las montañas de León"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover [filter:brightness(0.82)]"
        />
        <div className="landing-scrim-corner relative flex h-full items-end sm:items-center">
          <div className="mx-auto w-full max-w-[1800px] px-5 pb-16 sm:px-8 sm:pb-0">
            <div className="sm:ml-auto sm:max-w-[46ch] sm:text-right">
              <Reveal as="h2" className="text-[var(--l-step-head)] leading-[1.05] font-medium tracking-tight">
                Hablemos de tu próximo paso
              </Reveal>
              <Reveal as="p" delay={90} className="mt-4 text-[17px] text-[var(--l-ink)]/90">
                Una llamada con Fernando García para ver si el programa encaja contigo. Sin
                compromiso y sin discurso de ventas.
              </Reveal>
              <Reveal delay={180}>
                <a
                  href="mailto:hola@tunuevavida.com?subject=Reserva%20de%20llamada%2C%20Tu%20nueva%20vida"
                  className="landing-btn mt-8 px-7 py-3.5 text-sm"
                >
                  Reserva tu llamada
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Footer: la foto a un lado, el menú al otro ───────── */}
      <footer className="landing-surface grid sm:grid-cols-2">
        <div className="relative h-[46svh] sm:h-auto sm:min-h-[560px]">
          <img
            src={trail}
            alt="Persona caminando de espaldas por un sendero de montaña"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <div className="px-5 py-16 sm:px-12 sm:py-20">
          <p className="text-[var(--l-step-lead)] font-medium tracking-tight">Tu nueva vida</p>

          <nav className="mt-10 flex flex-col items-start gap-4" aria-label="Pie de página">
            {NAV.map((item, i) => (
              <Reveal
                key={item.href}
                as="a"
                href={item.href}
                delay={i * 50}
                className="landing-link text-[var(--l-step-lead)] font-medium tracking-tight hover:text-[var(--l-accent)]"
              >
                {item.label}
              </Reveal>
            ))}
            <Link
              to="/login"
              className="landing-link text-[var(--l-step-lead)] font-medium tracking-tight hover:text-[var(--l-accent)]"
            >
              Acceder al programa
            </Link>
          </nav>

          <div className="mt-16 grid gap-8 text-[var(--l-step-small)] sm:grid-cols-2">
            <div>
              <p className="text-[var(--l-ink)]">Contacto</p>
              <a href="mailto:hola@tunuevavida.com" className="landing-link landing-muted">
                hola@tunuevavida.com
              </a>
            </div>
          </div>

          <p className="landing-muted mt-14 text-[var(--l-step-small)] leading-relaxed">
            Fotografías:{" "}
            <a
              className="landing-link"
              href="https://commons.wikimedia.org/wiki/File:Mountains_under_starry_sky.jpg"
            >
              “Mountains under starry sky”
            </a>{" "}
            de Yueser656,{" "}
            <a className="landing-link" href="https://creativecommons.org/licenses/by/4.0">
              CC BY 4.0
            </a>
            ; {" "}
            <a
              className="landing-link"
              href="https://commons.wikimedia.org/wiki/File:Picos_de_Europa_vistos_desde_la_Fuente_del_Chivo.jpg"
            >
              “Picos de Europa vistos desde la Fuente del Chivo”
            </a>{" "}
            de Teofrasto820,{" "}
            <a className="landing-link" href="https://creativecommons.org/licenses/by-sa/4.0">
              CC BY-SA 4.0
            </a>
            ; {" "}
            <a
              className="landing-link"
              href="https://commons.wikimedia.org/wiki/File:Mountaineering_Man_Trail_Path_Mountains.jpg"
            >
              “Mountaineering Man Trail Path Mountains”
            </a>{" "}
            de Hermann, dominio público;{" "}
            <a
              className="landing-link"
              href="https://commons.wikimedia.org/wiki/File:Campfire_flames_at_night.jpg"
            >
              “Campfire flames at night”
            </a>{" "}
            de Marc-Lautenbacher,{" "}
            <a className="landing-link" href="https://creativecommons.org/licenses/by-sa/4.0">
              CC BY-SA 4.0
            </a>
            , vía Wikimedia Commons.
          </p>

          <p className="landing-muted mt-6 text-[var(--l-step-small)]">
            © {year} Tu nueva vida. Programa de Fernando García.
          </p>
        </div>
      </footer>
    </div>
  );
}
