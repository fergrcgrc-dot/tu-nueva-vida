/**
 * Datos del titular para las páginas legales (LSSI art. 10 y RGPD art. 13).
 * Aunque la marca sea faceless, la ley exige identificar al titular.
 * ⚠️ Pendiente: rellena titular, NIF y domicilio (obligatorios por la LSSI).
 */
import { ANALYTICS_ENABLED } from "@/lib/analytics";

export const LEGAL = {
  // Pendientes: mientras estén vacíos, las líneas correspondientes no se muestran.
  titular: "",
  nif: "",
  domicilio: "",
  /** Solo si es una sociedad: datos registrales. Déjalo vacío si eres autónomo. */
  registro: "",
  email: "hola@tunuevavida.eu",
  dominio: "tunuevavida.eu",
  marca: "Tu nueva vida",
  precio: "399 €",
  actualizado: "17 de noviembre de 2026",
};

export type LegalSlug = "aviso-legal" | "privacidad" | "condiciones" | "cookies";

export const LEGAL_PAGES: Array<{ slug: LegalSlug; title: string; description: string }> = [
  {
    slug: "aviso-legal",
    title: "Aviso legal",
    description:
      "Aviso legal de Tu nueva vida: titular del sitio, condiciones de uso, propiedad intelectual y naturaleza del programa online de reinvención profesional.",
  },
  {
    slug: "privacidad",
    title: "Política de privacidad",
    description:
      "Cómo trata Tu nueva vida tus datos personales: qué datos, para qué, proveedores, conservación y cómo ejercer tus derechos según el RGPD.",
  },
  {
    slug: "condiciones",
    title: "Condiciones de venta",
    description:
      "Condiciones de compra del programa Tu nueva vida: precio de 399 €, acceso de por vida, garantía de 14 días y derecho de desistimiento.",
  },
  {
    slug: "cookies",
    title: "Política de cookies",
    description:
      "Qué cookies y tecnologías de almacenamiento usa tunuevavida.eu, para qué sirven y cómo puedes gestionarlas desde tu navegador.",
  },
];

const L = LEGAL;

/** Línea de lista «- **Etiqueta:** valor» solo si hay valor. */
const line = (label: string, value: string) => (value ? `- **${label}:** ${value}\n` : "");
/** Nombre del titular para usar en frases; genérico mientras esté vacío. */
const titular = L.titular || `el titular de ${L.dominio}`;

const avisoLegal = `
## 1. Titular del sitio web

En cumplimiento del artículo 10 de la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI), te informamos de que el sitio web **${L.dominio}** y el programa **${L.marca}** son titularidad de:

${line("Titular", L.titular)}${line("NIF", L.nif)}${line("Domicilio", L.domicilio)}- **Email de contacto:** ${L.email}
${line("Datos registrales", L.registro)}

## 2. Objeto

Este sitio web ofrece información sobre ${L.marca}, un programa online de desarrollo personal en ocho módulos, y da acceso a la plataforma en la que se realiza el programa. La compra se rige por las [Condiciones de venta](/legal/condiciones) y el tratamiento de datos por la [Política de privacidad](/legal/privacidad).

## 3. Condiciones de uso

El acceso a la web es libre. Al usarla te comprometes a hacerlo de forma lícita, sin dañar el sitio ni a terceros, y a no intentar acceder a zonas restringidas o a cuentas de otras personas. El acceso a la plataforma del programa es personal e intransferible.

## 4. Naturaleza del servicio

${L.marca} es un programa de coaching y desarrollo personal acompañado por un asistente de inteligencia artificial («coach IA»). **No es un servicio de psicología, psicoterapia ni atención médica, y no sustituye a ningún profesional sanitario.** Las respuestas del coach IA se generan de forma automática y pueden contener errores; las decisiones que tomes a partir del programa son tuyas.

Si estás pasando por un momento muy difícil o tienes pensamientos de hacerte daño, llama al **024** (gratuito, 24 horas) o al **112** en caso de emergencia.

## 5. Propiedad intelectual e industrial

Todos los contenidos del sitio y del programa (textos, vídeos, diapositivas, ejercicios, diseño, marca y código) pertenecen al titular o se usan con licencia, y están protegidos por la normativa de propiedad intelectual e industrial. No está permitido reproducirlos, distribuirlos, comunicarlos públicamente ni transformarlos sin autorización expresa, salvo para tu uso personal dentro del programa.

Lo que escribes en tus ejercicios es tuyo.

## 6. Responsabilidad

El titular trabaja para que la web esté disponible y libre de errores, pero no puede garantizarlo en todo momento. No se responsabiliza de interrupciones por causas técnicas ajenas, de los contenidos de webs de terceros enlazadas ni del uso indebido del sitio por parte de los usuarios.

## 7. Legislación aplicable

Este aviso legal se rige por la legislación española. Si eres consumidor, para cualquier controversia serán competentes los juzgados y tribunales de tu domicilio.

*Última actualización: ${L.actualizado}.*
`;

const privacidad = `
Esta política explica qué datos personales tratamos cuando visitas ${L.dominio} y cuando haces el programa ${L.marca}, para qué, con qué base legal y qué derechos tienes. Cumple el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD).

## 1. Responsable del tratamiento

${line("Responsable", L.titular)}${line("NIF", L.nif)}${line("Domicilio", L.domicilio)}- **Contacto para privacidad:** ${L.email}

## 2. Qué datos tratamos

1. **Datos de cuenta:** nombre y email.
2. **Datos de compra y facturación:** los que introduces en la página de pago y nos comunica Stripe al confirmarlo (nombre, email, dirección de facturación, NIF si lo indicas, número de pedido, importe, impuestos y estado). **No recibimos ni guardamos los datos de tu tarjeta.**
3. **Datos del programa:** tu progreso, las respuestas de tus ejercicios, el feedback del coach IA, tus entregables, tus conversaciones con el coach IA y tus check-ins de seguimiento.
4. **Datos especialmente protegidos:** en los ejercicios puedes contar cosas sobre tu estado emocional, tu salud o tus relaciones. Estos datos pertenecen a categorías especiales (art. 9 RGPD) y **solo los tratamos con tu consentimiento explícito**, que te pedimos al crear tu cuenta.
5. **Datos técnicos:** dirección IP, tipo de navegador y registros de acceso necesarios para la seguridad del servicio.

## 3. Para qué los usamos y con qué base legal

| Finalidad | Base legal |
|---|---|
| Crear tu cuenta y darte acceso al programa tras la compra | Ejecución del contrato (art. 6.1.b RGPD) |
| Que el coach IA revise tus ejercicios, te dé feedback y converse contigo | Ejecución del contrato y, para los datos especiales, tu consentimiento explícito (art. 9.2.a RGPD) |
| Enviarte los emails del servicio (acceso, recuperación de contraseña, recordatorios de check-in) | Ejecución del contrato |
| Detectar señales de riesgo grave en lo que escribes para mostrarte recursos de ayuda (024, 112) y registrar un aviso interno | Tu consentimiento explícito y el interés vital de la persona afectada (art. 9.2.c RGPD) |
| Gestionar compras, reembolsos y obligaciones contables y fiscales | Obligación legal (art. 6.1.c RGPD) |
| Mantener la seguridad de la plataforma y prevenir fraudes | Interés legítimo (art. 6.1.f RGPD) |
${ANALYTICS_ENABLED ? "| Medir de forma agregada cómo se usa la web (Google Analytics) | Tu consentimiento, que puedes retirar en «Preferencias de cookies» (art. 6.1.a RGPD) |\n" : ""}
No usamos tus datos para publicidad ni los vendemos. Si algún día quisiéramos enviarte comunicaciones comerciales, te pediríamos antes tu consentimiento.

## 4. El coach IA y las decisiones automatizadas

Tus ejercicios los revisa un modelo de inteligencia artificial, que decide si el ejercicio está completo o si te pide precisar alguna respuesta antes de abrir el siguiente módulo. Su criterio es si las respuestas son concretas y responden a lo que se pregunta, nunca un juicio sobre ti. Esta decisión no tiene efectos jurídicos ni te afecta de forma significativa, pero si no estás de acuerdo con una revisión puedes escribir a ${L.email} y una persona la revisará.

## 5. Con quién compartimos tus datos

Solo con los proveedores necesarios para prestar el servicio, que actúan como encargados del tratamiento con contrato y garantías:

- **Supabase:** base de datos, autenticación y almacenamiento de vídeos, en servidores de la Unión Europea (Irlanda).
- **Cloudflare:** alojamiento y entrega de la web.
${ANALYTICS_ENABLED ? "- **Google Analytics (Google Ireland Ltd.):** solo si aceptas las cookies de análisis. Mide de forma agregada las visitas (páginas vistas, origen del tráfico, clics en botones); no recibe el contenido de tus ejercicios ni conversaciones.\n" : ""}- **Anthropic:** modelo de IA que genera el feedback y las respuestas del coach IA. Recibe el texto de tus ejercicios y conversaciones solo para generar la respuesta y, según sus condiciones comerciales, no lo usa para entrenar sus modelos.

**Stripe Payments Europe, Ltd.** procesa el pago y emite la factura en nuestro nombre. Trata los datos de tu medio de pago como **responsable independiente** (por sus obligaciones de prevención del fraude y del blanqueo de capitales), según su propia política de privacidad.

También podremos comunicar datos a autoridades cuando lo exija la ley.

## 6. Transferencias internacionales

Algunos de estos proveedores están en Estados Unidos o pueden acceder a los datos desde allí. Estas transferencias se amparan en el Marco de Privacidad de Datos UE-EE. UU. cuando el proveedor está adherido o, en su defecto, en las cláusulas contractuales tipo aprobadas por la Comisión Europea.

## 7. Cuánto tiempo los conservamos

- **Cuenta y datos del programa:** mientras tu cuenta esté activa (el acceso es de por vida) o hasta que nos pidas suprimirla.
- **Datos de compra:** el tiempo exigido por la normativa fiscal y mercantil (hasta 6 años).
- **Registros técnicos:** un máximo de 12 meses.

Si retiras el consentimiento para los datos especialmente protegidos, borraremos tus ejercicios y conversaciones, y no podrás seguir usando el coach IA.

## 8. Tus derechos

Puedes ejercer en cualquier momento tus derechos de **acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad**, y **retirar tu consentimiento** sin que afecte a la licitud del tratamiento anterior. Escribe a ${L.email} indicando qué derecho quieres ejercer, desde el email de tu cuenta.

Si consideras que no hemos atendido correctamente tu solicitud, puedes reclamar ante la **Agencia Española de Protección de Datos** (www.aepd.es).

## 9. Edad mínima

El programa está dirigido a personas mayores de 18 años.

## 10. Seguridad

Aplicamos medidas técnicas y organizativas adecuadas: conexión cifrada (HTTPS), acceso a tus datos restringido a tu propia cuenta, claves de los proveedores guardadas solo en el servidor y vídeos accesibles únicamente mediante enlaces temporales.

*Última actualización: ${L.actualizado}.*
`;

const condiciones = `
Estas condiciones regulan la compra y el uso del programa online **${L.marca}**. Léelas antes de comprar: al completar el pago las aceptas.

## 1. Quién presta el servicio y quién cobra

- **Prestador del programa:** ${[titular, L.nif && `NIF ${L.nif}`, L.domicilio && `con domicilio en ${L.domicilio}`].filter(Boolean).join(", ")}. Contacto: ${L.email}.
- **Pago:** el vendedor es el prestador del programa. El cobro se procesa de forma segura con **Stripe**, y recibirás por email la factura con el IVA correspondiente.

## 2. Qué compras

Acceso individual a ${L.marca}, que incluye:

- 8 módulos con vídeo explicativo y teoría.
- 8 ejercicios prácticos dentro de la plataforma, con revisión y feedback del coach IA.
- Acceso al coach IA dentro de cada módulo.
- Revisión de fase al cierre de cada una de las 4 fases.
- Informe final y check-ins automáticos durante 90 días.

Los módulos se desbloquean en orden: el siguiente se abre cuando el coach IA aprueba el ejercicio del anterior.

**Naturaleza del servicio:** es un programa de coaching y desarrollo personal acompañado por inteligencia artificial. No incluye sesiones con personas, no es terapia ni atención sanitaria y no sustituye a ningún profesional. Necesitas ser mayor de 18 años.

## 3. Precio y pago

El precio es de **${L.precio}, pago único, impuestos incluidos**. No hay suscripciones ni cargos recurrentes. Puedes pagar con los métodos que aparezcan en la página de pago de Stripe en el momento de la compra. Si compras como profesional o empresa, puedes indicar tu NIF para que figure en la factura.

## 4. Acceso

Al confirmarse el pago recibes un email para crear tu contraseña y empezar al momento. Si no te llega en unos minutos, revisa la carpeta de spam o escribe a ${L.email}.

**Acceso de por vida:** tu acceso no caduca mientras el programa siga en funcionamiento, incluidas las mejoras que hagamos en él. Si algún día el servicio dejara de prestarse, te avisaríamos con al menos 90 días de antelación para que puedas descargar tus entregables.

## 5. Garantía de 14 días

Si el programa no es para ti, escribe a ${L.email} desde el email con el que compraste **dentro de los 14 días naturales siguientes a la compra** y te devolveremos el **100 % del importe**, sin preguntas y aunque ya hayas empezado los módulos. El reembolso se hace a través de Stripe al mismo medio de pago y, una vez tramitado, se desactiva el acceso al programa.

## 6. Derecho de desistimiento

Como consumidor, la ley te reconoce un derecho de desistimiento de 14 días naturales desde la compra (art. 102 y siguientes del Real Decreto Legislativo 1/2007). Para contenidos digitales, este derecho puede perderse cuando empieza el acceso. **Nosotros no te pedimos que renuncies a él:** la garantía del apartado anterior te permite desistir durante esos 14 días aunque ya hayas empezado. Para ejercerlo basta con un email a ${L.email} indicando que quieres desistir; también puedes usar este modelo:

> A la atención de ${[titular, L.domicilio, L.email].filter(Boolean).join(", ")}: por la presente le comunico que desisto de mi contrato de compra del programa ${L.marca}, adquirido el [fecha], con el email [email de compra]. Nombre: [nombre]. Fecha: [fecha].

## 7. Uso permitido

El acceso es personal e intransferible. No está permitido compartir tu cuenta, ceder el acceso ni descargar, copiar o redistribuir los contenidos del programa. Si detectamos un uso fraudulento, podremos suspender la cuenta.

## 8. Disponibilidad y cambios

Trabajamos para que la plataforma esté disponible siempre, pero puede haber interrupciones puntuales por mantenimiento o causas técnicas. Podemos mejorar y actualizar los contenidos del programa sin reducir lo que has comprado.

## 9. Responsabilidad

El coach IA genera sus respuestas de forma automática y puede equivocarse. Las decisiones que tomes a partir del programa son tuyas. En la medida en que la ley lo permita, la responsabilidad del prestador se limita al importe pagado. Nada de lo anterior limita los derechos que te reconoce la normativa de consumidores.

## 10. Atención al cliente y reclamaciones

Para cualquier duda, incidencia o reclamación, escribe a ${L.email}. Respondemos en un plazo máximo de 7 días. Tienes a tu disposición hojas de reclamaciones solicitándolas en ese mismo email.

## 11. Legislación aplicable

Estas condiciones se rigen por la legislación española. Si eres consumidor, son competentes los juzgados y tribunales de tu domicilio.

*Última actualización: ${L.actualizado}.*
`;

const cookies = `
## 1. Qué son las cookies

Las cookies y tecnologías similares (como el almacenamiento local del navegador) son pequeños archivos que una web guarda en tu dispositivo para funcionar o para recordar información.

## 2. Qué usamos en ${L.dominio}

${ANALYTICS_ENABLED ? "Usamos elementos **técnicos**, necesarios para que la web funcione, y cookies de **análisis**, que solo se activan si las aceptas en el aviso de cookies. No usamos cookies de publicidad ni de redes sociales." : "**Solo usamos elementos técnicos estrictamente necesarios.** No usamos cookies de análisis, de publicidad ni de redes sociales."}

| Elemento | Tipo | Para qué sirve | Duración |
|---|---|---|---|
| Sesión de la plataforma (almacenamiento local) | Técnica, propia | Mantener tu sesión iniciada en el programa y la opción «recordarme» | Hasta que cierras sesión |
${ANALYTICS_ENABLED ? "| Preferencia de cookies (almacenamiento local) | Técnica, propia | Recordar si aceptaste o rechazaste las cookies de análisis | Hasta que la cambies |\n| `_ga`, `_ga_*` | Análisis, de terceros (Google) | Distinguir visitas de forma anónima para medir el uso de la web. Solo con tu consentimiento | 2 años |\n" : ""}
${ANALYTICS_ENABLED ? "Los elementos técnicos están exentos de consentimiento según el artículo 22.2 de la LSSI. Las cookies de análisis solo se instalan si pulsas «Aceptar» en el aviso; si pulsas «Rechazar», no se carga Google Analytics. Puedes cambiar tu elección cuando quieras desde «Preferencias de cookies», al pie de la web." : "Estos elementos están exentos de consentimiento según el artículo 22.2 de la LSSI, porque son necesarios para prestar el servicio que pides. Por eso esta web no muestra un banner de cookies."}

## 3. Servicios de terceros

- **Stripe:** al pagar, sales a la página de pago de Stripe, que usa sus propias cookies (necesarias para el pago y la prevención del fraude) según su política.

## 4. Cómo gestionarlas

Puedes borrar o bloquear las cookies y el almacenamiento local desde la configuración de tu navegador. Si lo haces, tendrás que volver a iniciar sesión en el programa.

${ANALYTICS_ENABLED ? "" : "Si en el futuro incorporamos cookies que requieran tu consentimiento (por ejemplo, de análisis), actualizaremos esta política y te lo pediremos antes."}

*Última actualización: ${L.actualizado}.*
`;

export const LEGAL_CONTENT: Record<LegalSlug, string> = {
  "aviso-legal": avisoLegal,
  privacidad,
  condiciones,
  cookies,
};
