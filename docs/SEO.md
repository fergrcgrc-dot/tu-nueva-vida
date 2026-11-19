# Auditoría SEO — 19/11/2026

**Sitio:** https://tunuevavida.eu · **Negocio:** Tu nueva vida · **Sector:** coaching y desarrollo personal online (programa de reinvención profesional con coach IA) · **Ubicación:** 100 % online, mercado España, sin local ni dirección pública · **Servicio:** programa de 8 módulos, 399 €.

> Al ser un negocio online sin atención presencial, el SEO local clásico (Google Business Profile, NAP, «servicio + ciudad») no aplica. El foco es SEO nacional por intención de búsqueda.

## 1. Google Analytics 4

| Punto | Estado |
|---|---|
| ID de GA4 en el código | ❌ No había ninguno. **Montado y listo**: se activa con la variable `VITE_GA4_MEASUREMENT_ID` |
| Carga sin errores | ✅ Probado con un ID de prueba: no se carga nada hasta aceptar las cookies; tras aceptar, `gtag.js` carga y registra eventos |
| Consentimiento | ✅ Banner de cookies (Aceptar / Rechazar) y enlace «Preferencias de cookies» en el pie. Políticas de cookies y privacidad se adaptan solas cuando GA4 está activo |
| Eventos | ✅ `page_view` (también navegación interna), `begin_checkout` (clic en comprar, 399 €), `contact_email`, `login`, `sign_up`, `exercise_submitted`, `module_completed`. No hay formulario de contacto, teléfono ni WhatsApp en la web |

**Dónde va el ID:** añade `VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX` al archivo `.env` (es un dato público) o pásamelo y lo hago yo; se publica solo al subir el cambio.

## 2. Google Business Profile

No aplica: Google solo admite fichas de negocios con atención presencial (local o desplazamiento al cliente). Un programa 100 % online no es elegible, y crear una ficha con dirección ficticia puede acabar en suspensión. La web muestra como dato de contacto solo `hola@tunuevavida.eu`, de forma coherente en todas las páginas. Alternativa: perfiles de marca (LinkedIn, Instagram, YouTube) enlazados con `sameAs` en los datos estructurados cuando existan.

## 3. Search Console

| Punto | Estado |
|---|---|
| sitemap.xml | ✅ Creado: https://tunuevavida.eu/sitemap.xml (home + 4 legales; la zona privada no se incluye) |
| Verificación | ⏳ Manual (ver pasos abajo) |
| Indexación | ⏳ Manual tras verificar |
| Errores de cobertura | ⏳ Sin acceso a la propiedad. Ya prevenido: `noindex` en login, alta de contraseña, gracias y zona privada; robots.txt bloquea la zona privada |

**Verificar la propiedad (recomendado: tipo Dominio):**
1. https://search.google.com/search-console → *Añadir propiedad* → **Dominio** → `tunuevavida.eu`.
2. Copia el registro TXT `google-site-verification=…`.
3. Cloudflare → `tunuevavida.eu` → DNS → *Add record* → Type **TXT**, Name **@**, Content: el valor copiado → Save. (O pásame el valor y un token de DNS y lo añado yo.)
4. Vuelve a Search Console → *Verificar* (puede tardar unos minutos).

**Enviar sitemap:** Search Console → *Sitemaps* → escribe `sitemap.xml` → *Enviar*.

**Solicitar indexación:** barra superior *Inspeccionar cualquier URL* → `https://tunuevavida.eu/` → *Solicitar indexación*. Repite con cada página nueva que publiques (artículos del blog). No solicites las legales ni la zona privada.

## 4. Encabezados

Solo hay una página de venta (la home); servicios, contacto y «sobre nosotros» no existen como páginas separadas.

| Elemento | Antes | Después |
|---|---|---|
| Antetítulo | Programa de transformación profesional | Programa online de reinvención profesional |
| **H1** | Tu nueva vida empieza cuando la actual ya no tiene sentido | **Reinvéntate profesionalmente cuando tu vida actual ya no tiene sentido** |
| Subtítulo | …profesionales de alto rendimiento que necesitan claridad real… | Para profesionales en plena crisis profesional que no saben qué hacer con su vida: ocho módulos guiados y un coach IA para pasar de la duda a un plan concreto a 90 días |
| H2 | Qué incluye el programa | Qué incluye el programa de coaching online |
| H3 | Empieza hoy (tarjeta de botón) | Pasa a párrafo: no era una sección |
| H2 | Cómo funciona | Cómo funciona: de la crisis profesional a un plan de acción |
| H2 | Los 8 módulos | Los 8 módulos del programa |
| H2 | Preguntas frecuentes | Preguntas frecuentes sobre el programa |

Un único H1 por página; legales con H1 = título de la página. Sin repetición forzada de palabras clave.

## 5. robots.txt

Antes: permitía todo y **no referenciaba el sitemap**. Ahora:

```
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /modulos/
Disallow: /seguimientos/
Disallow: /admin
Disallow: /coach
Disallow: /verificacion-2fa
Disallow: /set-password
Disallow: /login
Disallow: /gracias
Disallow: /comprar
Disallow: /api/

Sitemap: https://tunuevavida.eu/sitemap.xml
```

CSS, JS, imágenes y la home quedan accesibles para Googlebot.

## 6. Intención de búsqueda (España)

Fuente: autocompletado de Google (es-ES), como alternativa a AnswerThePublic, que no tiene API gratuita.

| Búsqueda real | Intención | ¿Cubierta antes? | Acción |
|---|---|---|---|
| reinventarse profesionalmente (a los 40 / a los 50) | Informativa → comercial | ❌ | H1, subtítulo, FAQ, title/description |
| crisis profesional (40), crisis de identidad profesional | Informativa | ❌ | Subtítulo, H2, FAQ |
| no sé qué hacer con mi vida (profesional) | Informativa | ❌ | Subtítulo y FAQ |
| coaching reinvención profesional, coaching de vida online, programa de coaching online | **Comercial** | ❌ | H2, FAQ «¿En qué se diferencia de un coach de vida?» |
| cambiar de vida a los 40 / 50 | Informativa | ❌ | FAQ (crisis a los 40/50); artículo propuesto |
| dejar mi trabajo (sin tener otro) | Informativa | ❌ | FAQ «¿Tengo que dejar mi trabajo?» |
| estoy quemado en el trabajo | Informativa (sensible) | ❌ | FAQ con derivación a profesional sanitario |
| descubrir mis valores / test para descubrir mis valores | Informativa | Parcial (módulo 3) | Texto del módulo 3; lead magnet propuesto |
| cómo encontrar mi propósito (profesional) | Informativa | ❌ | Artículo propuesto |

**Artículos propuestos (fase 2, captación):**
1. Crisis profesional a los 40: señales, causas y cómo salir con un plan
2. Cómo reinventarse profesionalmente a los 50 sin dejar tu trabajo de golpe
3. No sé qué hacer con mi vida profesional: 7 preguntas para encontrar dirección
4. Test para descubrir tus valores (ejercicio práctico gratis) → lead magnet con el ejercicio del módulo 3
5. Estoy quemado en el trabajo: cuándo es momento de cambiar y cuándo de pedir ayuda
6. Dejar mi trabajo sin tener otro: cómo decidirlo con cabeza
7. Cómo encontrar tu propósito profesional, sin frases motivacionales
8. Coaching de reinvención profesional: qué es, cuánto cuesta y alternativas online
9. Cambiar de vida a los 40: plan de 90 días paso a paso

## 7. Extras técnicos

| Punto | Estado |
|---|---|
| Title y description | ✅ Home: 58 / 145 caracteres con palabra clave principal. Legales con descripción propia (antes duplicaban la genérica) |
| Datos estructurados | ✅ Organization + WebSite + **Course** (8 módulos, online, 399 €) + **FAQPage** (14 preguntas). LocalBusiness no aplica (sin local) |
| Core Web Vitals (Lighthouse, móvil) | ✅ Rendimiento 82 → **99**; LCP 3,7 s → **1,9 s**; CLS 0; TBT 0 ms. Escritorio 96 → 99 |
| Responsive | ✅ Diseño adaptable; Lighthouse sin avisos de móvil |
| Alt de imágenes | ✅ 5/5 con alt; reescritos con contexto («cambio de vida profesional», «plan de reinvención profesional a 90 días») |
| URLs | ✅ Limpias, en minúscula y con guiones (`/legal/privacidad`, `/legal/condiciones`…); `www` redirige al dominio principal |
| HTTPS | ✅ Todo en HTTPS, HSTS, sin contenido mixto |
| Enlazado interno | ✅ Menú con anclas a secciones, pie con legales y acceso; sin páginas de servicio adicionales que enlazar. Mejorará con el blog |
| Duplicados | ✅ Corregida la descripción duplicada en legales; `canonical` en home y legales |
| Accesibilidad | ✅ 95 → 100 (contraste AA del naranja de marca en texto pequeño) |
| Open Graph | ✅ Imagen 1200×630, URL, locale es_ES |

## Cambios en el código

| Archivo | Línea(s) | Cambio |
|---|---|---|
| `src/routes/index.tsx` | 17–30 | Imágenes WebP responsive, `SITE_URL`, `SEO_TITLE`, `SEO_DESCRIPTION` |
| `src/routes/index.tsx` | 32–65 | `head`: title, description, Open Graph, Twitter, canonical, preload de la imagen LCP, JSON-LD |
| `src/routes/index.tsx` | 114, 121, 128 | Alt descriptivos de las imágenes de «Cómo funciona» |
| `src/routes/index.tsx` | 158 | Texto del módulo 3 con «descubres tus valores» |
| `src/routes/index.tsx` | 218–240, 258–262 | 5 FAQ nuevas (crisis 40/50, no sé qué hacer, dejar el trabajo, coach de vida, quemado) |
| `src/routes/index.tsx` | 317, 320, 323 | Antetítulo, **H1** y subtítulo |
| `src/routes/index.tsx` | 345–356 | Imagen del hero: `srcSet`, `sizes`, `fetchPriority`, alt |
| `src/routes/index.tsx` | 363, 379, 397, 434, 519 | H2 reescritos; «Empieza hoy» de H3 a párrafo |
| `src/routes/index.tsx` | 444 y otras | `text-ember-strong` (contraste AA) |
| `src/routes/index.tsx` | 587–final | `structuredData()`: Organization, WebSite, Course, FAQPage |
| `src/routes/index.tsx` | pie | Enlace «Preferencias de cookies» |
| `src/assets/*.webp` | — | 8 imágenes nuevas (2 tamaños × 4); eliminados los 4 JPG originales |
| `public/og-image.jpg` | — | Imagen para redes 1200×630 |
| `src/styles.css` | 4–8, 57–58, 210–215 | Fuentes alojadas (Karla y Lora variables) y utilidad de contraste |
| `src/routes/__root.tsx` | 98–102, 140–152, 156 | Fuera Google Fonts; descripción por defecto; analítica y banner de cookies |
| `public/robots.txt` | todo | Reescrito (zona privada bloqueada + sitemap) |
| `src/routes/sitemap[.]xml.ts` | nuevo | Sitemap dinámico |
| `src/lib/legal.ts` | 24–50 | Descripción única por página legal |
| `src/lib/legal.ts` | 122, 136, 240–262 | Textos de privacidad y cookies condicionados a GA4; fuera Google Fonts |
| `src/routes/legal/$slug.tsx` | 14–27 | Title, description y canonical por página |
| `src/routes/login.tsx` | 22, 73 | `noindex`; evento `login` |
| `src/routes/set-password.tsx` | 15, 81 | `noindex`; evento `sign_up` |
| `src/routes/gracias.tsx` | 8 | `noindex, nofollow` |
| `src/routes/_authenticated/route.tsx` | 12 | `noindex` en toda la zona privada |
| `src/routes/_authenticated/modulos/$moduleId.tsx` | 230–231 | Eventos `exercise_submitted` y `module_completed` |
| `src/lib/analytics.ts` | nuevo | GA4 con consentimiento y eventos |
| `src/components/CookieBanner.tsx` | nuevo | Banner y enlace de preferencias |
| `src/lib/security-headers.ts`, `public/_headers` | CSP | Dominios de GA4 permitidos; fuera Google Fonts |
| `src/routes/comprar.ts` | 10 | Página 404 sin Google Fonts |
| `package.json`, `bun.lock` | — | `@fontsource-variable/karla`, `@fontsource-variable/lora` |
