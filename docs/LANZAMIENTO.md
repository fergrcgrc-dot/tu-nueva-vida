# Lanzamiento: programa faceless y autónomo

Checklist para dejar la venta y el programa funcionando sin intervención humana.

## 1. Stripe (pago, factura e IVA) — ✅ HECHO el 19/11/2026

Stripe procesa el cobro; el vendedor es el titular del programa. Stripe Tax calcula el IVA y Stripe Invoicing envía la factura.

- Producto «Tu nueva vida — Programa de 8 semanas» (código fiscal `txcd_20060048`), precio **399 € IVA incluido**, pago único, lookup key **`tnv_programa_8s`** (la app busca el precio por esta clave; para cambiar el precio crea uno nuevo y transfiere la lookup key).
- Stripe Tax: sede en España y registro de IVA en España activos. Comprobado: 399 € → 329,75 € + 69,25 € de IVA (21 %).
- Para vender a consumidores de otros países de la UE por encima del umbral, revisar con el asesor el registro OSS y añadirlo en Tax → Registrations.
- Webhook: `https://tunuevavida.eu/api/stripe/webhook` con `checkout.session.completed`, `checkout.session.async_payment_succeeded` y `charge.refunded`.
- Para probar con claves de test (sandbox): `STRIPE_ALLOW_TEST_MODE=true` y tarjeta `4242 4242 4242 4242`. Quitar después.

## 2. Secretos en Cloudflare (Workers → tu-nueva-vida → Settings → Variables and secrets)

| Nombre | Valor |
|---|---|
| `STRIPE_SECRET_KEY` | Clave restringida live (`rk_live_…`) o secreta |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` del endpoint del webhook |
| `SITE_URL` | `https://tunuevavida.eu` |
| `ANTHROPIC_API_KEY` | (ya existente) coach IA |
| `SUPABASE_SERVICE_ROLE_KEY` | (ya existente) altas automáticas |

Permisos mínimos de la clave restringida: escritura en Checkout Sessions; lectura en Prices, Products, Customers, Charges e Invoices.

## 3. Base de datos (Supabase) — ✅ HECHO el 17/11/2026

Migraciones aplicadas, 8 vídeos subidos y enlazados, URL del sitio y redirecciones configuradas, enlaces de invitación válidos 24 h. Queda pendiente el email (punto 4).

Aplica, en este orden, desde el SQL Editor o con `supabase db push`:

1. `supabase/migrations/20261117100000_faceless_autonomo.sql`: compras, ejercicios con revisión IA, bucket privado `module-videos` y `complete_module` solo desde el servidor.
2. `supabase/migrations/20261117100100_contenido_faceless.sql`: teoría y ejercicios sin coach humano.
3. `supabase/migrations/20261117120000_consentimiento_privacidad.sql`: registro del consentimiento RGPD al crear la cuenta.

## 4. Email de acceso — ✅ HECHO el 17/11/2026

Resend con el dominio `tunuevavida.eu` verificado (región UE; registros DKIM/SPF en el subdominio `send`, sin tocar Email Routing de Cloudflare), SMTP propio configurado en Supabase con remitente `Tu nueva vida <hola@tunuevavida.eu>` y una clave de solo envío, y plantillas de invitación y recuperación en español aplicadas. Límite: 100 emails/hora.

Contexto (por qué hizo falta):

Sin un SMTP propio, Supabase solo envía emails a los miembros del equipo del proyecto y con un límite muy bajo por hora: **los compradores no recibirían el email para crear su contraseña**. Además, en el plan gratuito no deja cambiar las plantillas.

1. Crea una cuenta en un proveedor de email transaccional (recomendado: Resend, gratis hasta 3.000 emails/mes) y verifica el dominio `tunuevavida.eu` (registros DNS en Cloudflare).
2. En Supabase → Authentication → Emails → SMTP Settings: activa *Custom SMTP* con los datos del proveedor y remitente `hola@tunuevavida.eu`.
3. Aplica las plantillas en español: `node scripts/apply-email-templates.mjs` (ya están en `supabase/email-templates/`).

Referencia de la plantilla de invitación:

Es el email que recibe el cliente tras pagar. Recomendado:

- Asunto: `Tu acceso a Tu nueva vida`
- Cuerpo: «Ya tienes acceso al programa. Crea tu contraseña aquí: {{ .ConfirmationURL }}. Empieza por el Módulo 1 cuando tengas 45-60 minutos sin interrupciones.»

Y en Authentication → URL Configuration añade `https://tunuevavida.eu/set-password` a Redirect URLs.

## 5. Despliegue — ✅ automático

El Worker `tu-nueva-vida` está conectado a GitHub (Workers Builds): cada push a **`main`** compila (`npm run build`) y publica (`npx wrangler deploy`) en tunuevavida.eu. `main` es la única rama de referencia (desde el 19/11/2026 `claude/modest-pascal-otdg4e` apunta al mismo commit; no desplegar desde otras ramas).

- `wrangler.jsonc` lleva `keep_vars: true`: las variables definidas en el panel no se borran al desplegar. Aun así, guarda las claves siempre como **Secret**.
- No despliegues con `wrangler` desde entornos con proxy que reescriba la cabecera `Authorization`: la subida de assets falla (401) y queda una versión sin parte de sus ficheros. Si pasa, vuelve a la versión anterior en Deployments o haz un push a `main`.
- Ojo: editar un secreto en el panel crea una versión nueva a partir de la **última versión subida**, no de la desplegada.

Primera publicación de la versión faceless: 17/11/2026, comprobada en producción (landing, 404 de compra, legales, panel, Módulo 1 con vídeo, chat y revisión del coach IA).

## 5 bis. Vídeos de los módulos

Pipeline: guion de slides + teoría → narración (Claude vía OpenRouter) → voz femenina dulce en español de España (Gemini TTS vía fal.ai, voz Vindemiatrix) → diapositivas con la paleta, el fondo y la fuente de la landing → MP4.

```bash
node scripts/videos/build-video.mjs 1        # un módulo
node scripts/videos/build-video.mjs all      # los 8
```

- La narración queda en `contenido-programa/videos/modulo-0X-narracion.json`: se puede editar a mano y volver a lanzar (solo se regeneran las frases cambiadas).
- Necesita `OPENROUTER_API_KEY` y `FAL_KEY` (con Node ≥ 22.21 tras un proxy, añade `NODE_USE_ENV_PROXY=1`).
- Subida a Supabase y enlace al módulo:

```bash
SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… node scripts/videos/upload-videos.mjs all
```

## 6. Páginas legales

Están en `/legal/aviso-legal`, `/legal/privacidad`, `/legal/condiciones` y `/legal/cookies`, enlazadas en el pie de la landing y junto al botón de compra.

**Antes de publicar, rellena tus datos en `src/lib/legal.ts`:** titular (nombre o razón social), NIF y domicilio. La LSSI obliga a mostrarlos aunque la marca sea faceless. Si facturas a través de una sociedad, el titular puede ser la sociedad.

Al crear la contraseña, el cliente marca una casilla obligatoria de consentimiento explícito para tratar los datos de salud emocional que comparte en los ejercicios (RGPD art. 9). Queda registrado en `profiles.privacy_consent_at`.

Recomendado: que un abogado o asesor revise los textos una vez rellenados.

## 7. Cómo funciona de punta a punta

1. Landing → botón «Empieza el programa · 399 €» → `/comprar` crea una sesión de Stripe Checkout (IVA, NIF opcional y factura automática).
2. Pago → webhook `checkout.session.completed` → se crea la cuenta, el Módulo 1 queda abierto y llega el email para crear la contraseña. Redirección a `/gracias`.
3. Cada módulo: vídeo + teoría → ejercicio en la plataforma (autoguardado, dictado por voz) → **Enviar a revisión** → el coach IA aprueba o pide precisar → al aprobar se guarda el entregable y se abre el siguiente módulo. En las semanas 2, 4, 6 y 8 la revisión incluye la revisión de fase.
4. Semana 8: informe final y check-ins automáticos (semanales o quincenales) durante 90 días.
5. Reembolso total en Stripe (garantía 14 días) → webhook `charge.refunded` → acceso bloqueado. Un reembolso parcial no toca el acceso.
6. Lenguaje de crisis: se pausa el ejercicio, se muestran 024/112 y queda un aviso interno en `/admin`.
