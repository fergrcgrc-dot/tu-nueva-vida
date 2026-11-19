# Revisión de seguridad — 17/11/2026

Revisión completa de la app (código, base de datos Supabase, configuración de autenticación, Cloudflare y dependencias) con pruebas de ataque contra producción.

## Hallazgos críticos corregidos

| # | Riesgo | Impacto | Arreglo |
|---|---|---|---|
| C1 | Registro público abierto y con autoconfirmación | Cualquiera podía crear una cuenta con la API pública de Supabase y leer la teoría de los 8 módulos sin pagar | `disable_signup = true`; las cuentas solo se crean por compra o invitación. El contenido solo lo leen cuentas activas |
| C2 | El cliente podía editar su propio `status` | Un usuario bloqueado (p. ej. tras un reembolso) podía reactivarse solo desde la API | Permisos por columna: el usuario solo puede cambiar `full_name` y su consentimiento |
| C3 | Coaches con acceso a datos de clientes en un programa sin coaches | 2 asignaciones activas, una de ellas de una cuenta de prueba | Asignaciones cerradas y cuenta de coach de prueba desactivada |

## Las 25 protecciones

| # | Protección | Estado | Detalle |
|---|---|---|---|
| 1 | Autenticación | ✅ Arreglado | Registro público cerrado; contraseñas de 10+ caracteres con mayúsculas, minúsculas y números (validado en Supabase y en la web); rotación de tokens de sesión; recuperación de contraseña sin revelar qué emails existen. ⚠️ La comprobación de contraseñas filtradas (HaveIBeenPwned), la caducidad de sesión por inactividad y el CAPTCHA requieren el plan Pro de Supabase o configuración adicional |
| 2 | Claves fuera del navegador | ✅ Verificado | El paquete del navegador solo contiene la URL y la clave publicable de Supabase. Anthropic, service_role, Lemon Squeezy y Resend solo existen como secretos del servidor |
| 3 | Base de datos | ✅ Arreglado | RLS activo en todas las tablas; `anon` sin ningún permiso; `authenticated` solo lectura (filtrada por RLS) y escritura en columnas concretas; sin TRUNCATE; funciones SECURITY DEFINER que ya no permiten consultar roles de terceros; `complete_module` solo desde el servidor |
| 4 | HTTPS | ✅ Arreglado | Redirección 301 de HTTP a HTTPS y de `www` al dominio principal; HSTS de 1 año con subdominios |
| 5 | Contraseñas con hash | ✅ Verificado | Las gestiona Supabase Auth (bcrypt). La app nunca guarda ni registra contraseñas |
| 6 | Validación en el servidor | ✅ Arreglado | Todas las funciones de servidor validan con zod. Nuevo: las respuestas de los ejercicios se reconstruyen en el servidor según el esquema del módulo (campos desconocidos fuera, textos recortados, números en rango); historial del chat acotado a 30 mensajes y 40.000 caracteres |
| 7 | XSS | ✅ Verificado | React escapa todo el texto; el markdown no admite HTML; no hay `dangerouslySetInnerHTML`. Probado: una carga `<img onerror>`/`<script>` guardada en un ejercicio se muestra como texto. CSP como segunda barrera |
| 8 | Registro y vigilancia | ✅ Arreglado | Eventos `security.*` en `audit_logs` (visibles en /admin): límites superados, accesos denegados a admin, firmas de webhook falsas, pedidos rechazados, señales de crisis. Logs del Worker activados en Cloudflare |
| 9 | Rutas de administración | ✅ Arreglado | Rol comprobado en la base de datos, cuenta activa y **2FA obligatorio (TOTP)** en tres capas: interfaz (redirige a /verificacion-2fa), funciones de servidor (exigen `aal2`) y base de datos (`is_platform_admin` solo es verdadero con `aal2`, así que las políticas RLS de admin no se aplican con solo contraseña). Intentos fallidos registrados |
| 10 | Consultas parametrizadas | ✅ Verificado | Todo el acceso a datos usa el cliente de Supabase (parametrizado). El único SQL dinámico (`rls_auto_enable`, de Supabase) usa `format()` con identificadores del propio sistema |
| 11 | Variables de entorno | ✅ Verificado | Solo variables `VITE_` públicas en el cliente; `.env` contiene únicamente valores públicos; secretos en Cloudflare Workers |
| 12 | Límite de peticiones | ✅ Arreglado | Por usuario, en base de datos: chat IA 20/10 min y 150/día; revisión IA 8/hora y 30/día; borradores 60/10 min. Si el limitador falla, se deniega. Auth de Supabase con sus propios límites |
| 13 | CORS | ✅ Verificado | Ninguna respuesta incluye `Access-Control-Allow-Origin`; las peticiones desde otros orígenes reciben 403 |
| 14 | Cabeceras de seguridad | ✅ Arreglado | CSP, HSTS, X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy (micrófono solo para el dictado), COOP; también en archivos estáticos (`public/_headers`) |
| 15 | Cookies de sesión | ✅ Verificado | La app no usa cookies: la sesión de Supabase va en almacenamiento local y viaja como token Bearer, lo que elimina el riesgo CSRF de cookies. Protegida frente a XSS con la CSP |
| 16 | CSRF | ✅ Verificado | Middleware CSRF de TanStack Start en todas las funciones de servidor (probado: 403 desde otro origen); el webhook se autentica por firma HMAC |
| 17 | Caducidad de enlaces | ✅ Arreglado | Enlaces de invitación y recuperación: 1 hora y un solo uso (antes 24 h). Nuevo «¿Has olvidado tu contraseña?» en el login |
| 18 | Subida de archivos | ✅ Arreglado | La app no permite subir archivos a los usuarios. El bucket de vídeos solo acepta MP4 de hasta 100 MB, es privado y no tiene políticas de escritura |
| 19 | Precios y pagos | ✅ Arreglado | El precio lo fija Lemon Squeezy; el acceso solo lo concede el webhook firmado. Nuevo: se exigen producto y tienda configurados, moneda EUR y se rechazan pedidos de prueba en producción (salvo `LEMONSQUEEZY_ALLOW_TEST_MODE=true`) |
| 20 | Modo depuración | ✅ Verificado | Build de producción, sin source maps públicos, sin `console.log`, páginas de error genéricas y errores al usuario sin detalles internos |
| 21 | Dependencias vulnerables | ✅ Arreglado | zod 3.25 → 4.6.7 (agotamiento de memoria en validación), vite 8.1.5 → 8.3.8, nanoid 3.3.20, js-yaml 4.3.2, source-map-js 1.2.2. ⚠️ Quedan avisos solo en herramientas de compilación sin versión corregida (picomatch, brace-expansion/minimatch de ESLint); no llegan a producción |
| 22 | Paquetes sin uso | ✅ Arreglado | Eliminados 46 componentes de interfaz sin usar y 38 paquetes (142 paquetes menos instalados) |
| 23 | Archivos expuestos | ✅ Verificado | `.env`, `.git`, `package.json`, `wrangler.jsonc`, código fuente y source maps devuelven 404 en producción |
| 24 | Secretos en el historial de Git | ✅ Verificado | 145 commits revisados: solo aparece la clave `anon` de Supabase, que es pública por diseño. Ninguna clave privada, token ni contraseña |
| 25 | Claves comprometidas | ✅ Ninguna filtrada | No hay nada que rotar por filtración. Ver «Higiene de claves» |

## Higiene de claves (acciones recomendadas)

Ninguna clave se ha filtrado, pero durante la configuración se crearon accesos amplios que ya no hacen falta:

1. **Resend**: revocar la clave con *Full access* (resend.com/api-keys). Mantener `supabase-smtp-tunuevavida` (solo envío).
2. **Cloudflare**: revocar el token de DNS que se usó para Resend. El de Workers caduca el 17/12/2026.
3. **Supabase**: revocar el *Personal Access Token* cuando no se vaya a usar más (supabase.com/dashboard/account/tokens).
4. **Supabase**: la clave secreta `default` no la usa la app (usa `tu_nueva_vida`); se puede eliminar.

## Pendiente / mejoras opcionales

- CAPTCHA (Cloudflare Turnstile) en login y recuperación de contraseña.
- Plan Pro de Supabase: contraseñas filtradas (HIBP) y caducidad de sesión por inactividad.
- CSP con *nonce* en lugar de `'unsafe-inline'` para scripts cuando TanStack Start lo soporte en este despliegue.

## 2FA de administración

- Alta: entrar en `/admin` → te lleva a `/verificacion-2fa` → escanear el QR con la app de autenticación → introducir el código.
- Cada inicio de sesión de admin pide el código de 6 dígitos.
- **Si pierdes el móvil:** el factor se puede borrar desde Supabase (Authentication → Users → tu usuario → MFA factors → eliminar) o por SQL con acceso de servidor: `delete from auth.mfa_factors where user_id = '<id>';`. Al volver a entrar en `/admin` se pide dar de alta uno nuevo.
- Recomendado: guardar la clave de texto que aparece bajo el QR en un gestor de contraseñas como copia de seguridad.
