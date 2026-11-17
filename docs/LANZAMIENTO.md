# Lanzamiento: programa faceless y autónomo

Checklist para dejar la venta y el programa funcionando sin intervención humana.

## 1. Lemon Squeezy (pago, factura e IVA)

1. Crea la cuenta en https://app.lemonsqueezy.com/register y completa la verificación de identidad y los datos de cobro (banco). Lemon Squeezy es *merchant of record*: cobra, factura y liquida el IVA por ti.
2. **Store** → crea la tienda «Tu nueva vida» en EUR.
3. **Products → New product**: «Tu nueva vida · Programa completo».
   - Precio: **399 €**, pago único.
   - Settings → Tax: marca el precio **con impuestos incluidos** (la landing dice «impuestos incluidos»).
   - Confirmation modal / redirect: no hace falta, la app ya manda al cliente a `/gracias`.
4. Copia los ids:
   - **Store ID**: Settings → Stores.
   - **Variant ID**: abre el producto → menú «⋯» → *Copy variant ID*.
5. **Settings → API** → crea una API key.
6. **Settings → Webhooks → +**:
   - URL: `https://tunuevavida.eu/api/lemonsqueezy/webhook`
   - Eventos: `order_created`, `order_refunded`
   - Signing secret: inventa una cadena larga y guárdala.
7. Prueba en **Test mode** con la tarjeta `4242 4242 4242 4242` antes de activar el modo real.

## 2. Secretos en Cloudflare (Workers → tu-nueva-vida → Settings → Variables and secrets)

| Nombre | Valor |
|---|---|
| `LEMONSQUEEZY_API_KEY` | API key del paso 1.5 |
| `LEMONSQUEEZY_STORE_ID` | Store ID |
| `LEMONSQUEEZY_VARIANT_ID` | Variant ID |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Signing secret del webhook |
| `SITE_URL` | `https://tunuevavida.eu` |
| `ANTHROPIC_API_KEY` | (ya existente) coach IA |
| `SUPABASE_SERVICE_ROLE_KEY` | (ya existente) altas automáticas |

Opcional: `LEMONSQUEEZY_CHECKOUT_URL` con un enlace de pago fijo de respaldo si la API falla.

## 3. Base de datos (Supabase)

Aplica, en este orden, desde el SQL Editor o con `supabase db push`:

1. `supabase/migrations/20261117100000_faceless_autonomo.sql`: compras, ejercicios con revisión IA, bucket privado `module-videos` y `complete_module` solo desde el servidor.
2. `supabase/migrations/20261117100100_contenido_faceless.sql`: teoría y ejercicios sin coach humano.

## 4. Email de acceso (Supabase → Authentication → Emails → Invite user)

Es el email que recibe el cliente tras pagar. Recomendado:

- Asunto: `Tu acceso a Tu nueva vida`
- Cuerpo: «Ya tienes acceso al programa. Crea tu contraseña aquí: {{ .ConfirmationURL }}. Empieza por el Módulo 1 cuando tengas 45-60 minutos sin interrupciones.»

Y en Authentication → URL Configuration añade `https://tunuevavida.eu/set-password` a Redirect URLs.

## 5. Vídeos de los módulos

Pipeline: guion de slides + teoría → narración (Claude vía OpenRouter) → voz femenina (ElevenLabs vía fal.ai) → diapositivas con la marca → MP4.

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

## 6. Cómo funciona de punta a punta

1. Landing → botón «Empieza el programa · 399 €» → `/comprar` crea un checkout de Lemon Squeezy.
2. Pago → webhook `order_created` → se crea la cuenta, el Módulo 1 queda abierto y llega el email para crear la contraseña. Redirección a `/gracias`.
3. Cada módulo: vídeo + teoría → ejercicio en la plataforma (autoguardado, dictado por voz) → **Enviar a revisión** → el coach IA aprueba o pide precisar → al aprobar se guarda el entregable y se abre el siguiente módulo. En las semanas 2, 4, 6 y 8 la revisión incluye la revisión de fase.
4. Semana 8: informe final y check-ins automáticos (semanales o quincenales) durante 90 días.
5. Reembolso en Lemon Squeezy (garantía 14 días) → webhook `order_refunded` → acceso bloqueado.
6. Lenguaje de crisis: se pausa el ejercicio, se muestran 024/112 y queda un aviso interno en `/admin`.
