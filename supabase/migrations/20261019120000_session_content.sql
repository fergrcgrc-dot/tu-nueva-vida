-- Contenido real de las 8 sesiones del programa "Tu nueva vida"
-- Reemplaza los nombres de fase/módulo provisionales y añade teoría, slides y ejercicio por módulo.

ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS theory_content TEXT,
  ADD COLUMN IF NOT EXISTS slides_content JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS exercise_content TEXT;

-- Semana 1: Auditoría vital honesta
UPDATE public.modules SET
  phase_name = 'Confrontación',
  title = 'Auditoría vital honesta',
  objective = 'Confrontar con honestidad la situación actual en carrera, energía, relaciones e insatisfacciones, sin editar la respuesta para que suene razonable.',
  theory_content = $th1$# Sesión 1 · Semana 1 · Módulo 1.1 — Auditoría vital honesta

**Fase:** 1. Confrontación · **Pregunta que responde:** ¿De dónde vienes de verdad?

## De dónde viene / hacia dónde empuja

Esta sesión recoge directamente el contrato de compromiso de la Fase 0: el usuario ya aceptó, por escrito, que el proceso incluirá momentos incómodos y no solo insights agradables. La Sesión 1 cobra ese cheque de inmediato. No hay rampa de calentamiento, no hay ejercicio de "visualiza tu futuro ideal" antes de mirar el presente. Lo que esta sesión deja preparado es el material crudo —insatisfacciones nombradas, patrones de lenguaje detectados, nivel de energía declarado— que la Sesión 2 usará para construir la proyección a 5 años. Si esta auditoría se queda corta o suavizada, la proyección de la semana siguiente será una ficción construida sobre otra ficción.

## Concepto central: inventario no es confesión

La mayoría de ejercicios de "reflexión" que circulan en desarrollo personal piden un inventario: cargo, salario, estado civil, número de proyectos activos. Un inventario es cómodo porque es verificable y no compromete nada emocionalmente. La auditoría vital honesta es otra cosa: no pregunta qué tienes, pregunta qué sientes respecto a lo que tienes, y exige que la respuesta no esté editada para sonar razonable.

La diferencia no es semántica. Un inventario te permite decir "tengo un buen trabajo, una pareja estable y hago deporte tres veces por semana" y quedarte ahí, satisfecho con la lista. Una confesión honesta te obliga a continuar: "tengo un buen trabajo y llevo dieciocho meses sintiendo que cada lunes es una pequeña muerte". Ambas frases pueden ser ciertas sobre la misma persona. Solo la segunda sirve para este programa.

Este programa parte de una premisa incómoda: la mayoría de personas que llegan a un punto de transición vital no tienen un problema de información —ya saben, en el fondo, que algo no encaja— sino un problema de honestidad con ellas mismas. Han construido, durante años, un relato que hace tolerable seguir igual. La auditoría vital honesta no busca información nueva; busca desmontar ese relato el tiempo suficiente para ver lo que ya estaba ahí.

## Los cuatro dominios

La entrevista socrática de esta semana recorre cuatro dominios: carrera, energía, relaciones e insatisfacciones generales. No son categorías arbitrarias: son los cuatro lugares donde el relato protector suele instalarse con más fuerza, precisamente porque son los que más fácil es racionalizar ("es una mala racha", "todos los trabajos tienen días así", "es que ahora mismo no tengo tiempo para los amigos"). El rol de la IA en estos cuatro dominios es exclusivamente socrático: pregunta, refleja el patrón que detecta en la respuesta, y vuelve a preguntar. No valida ("qué bien que te atrevas a decir esto"), no diagnostica ("eso suena a burnout") y no aconseja ("deberías hablar con tu jefe"). Si lo hiciera, estaría devolviendo al usuario exactamente el tipo de consuelo barato que el relato protector ya le ofrece gratis todos los días.

Esta restricción no es un capricho de diseño conversacional: es el principio de apalancamiento de todo el programa, explicitado en el documento de estructura —el mayor punto de valor no está en el contenido ni en la IA, sino en saber exactamente cuándo la IA se aparta y entra el coach humano. En la Sesión 1 ese momento de apartarse ocurre cuando aparece lenguaje de crisis real o un bloqueo sostenido: ahí la IA no insiste, marca y cede el paso.

## Por qué el posicionamiento exige esto

Este no es un diario online ni una app de bienestar genérico. Es un programa high ticket que exige de 3 a 4 horas semanales de trabajo real, y esa exigencia solo se justifica si lo que se pide a cambio es fricción auténtica, no comodidad empaquetada como introspección. Un usuario que completa esta sesión con respuestas cortas, generales y libres de riesgo emocional no ha hecho el ejercicio: ha simulado haberlo hecho. Por eso el diseño de la entrevista incluye preguntas de seguimiento específicamente calibradas para detectar generalidad y pedir el ejemplo concreto, la fecha, el momento exacto en que algo dejó de sentirse bien.

## Qué significa "de verdad" en la pregunta de fase

La pregunta que responde la Fase 1 es "¿de dónde vienes de verdad?", no "¿de dónde vienes?". Esa palabra final no es relleno: señala que el punto de partida que la mayoría de personas describirían de forma espontánea —su currículum emocional de cara a la galería— no es el punto de partida real. El trabajo de esta sesión es la diferencia entre esas dos versiones. Todo lo que el programa construye después —valores, opciones, plan de acción— parte de aquí. Si el punto de partida está inflado o suavizado, cada fase posterior hereda esa distorsión y el plan final de 90 días terminará siendo un plan razonable para una vida que no es exactamente la que el usuario vive.

## Lo que esta sesión no es

No es terapia y no sustituye ninguna intervención clínica. No es un test de personalidad del que sale una etiqueta. No es la primera llamada con el coach: es, precisamente, el material que el coach va a leer antes de esa llamada, cuando corresponda. El usuario debe saber, antes de empezar, que lo que escriba o diga aquí no desaparece en el vacío de una app: alimenta un resumen que un humano revisará si hay señales de bloqueo o crisis, y alimenta, en todo caso, el entendimiento acumulado que el propio bot usará semana a semana para dejar de hacerle preguntas genéricas y empezar a hacerle las preguntas que a él, específicamente, le cuesta responder.
$th1$,
  exercise_content = $ex2$# Sesión 1 · Ejercicio práctico — Auditoría vital honesta

**Tiempo estimado:** 45–60 minutos, sin interrupciones.
**Formato de respuesta:** texto libre o nota de voz (transcrita automáticamente). Al cierre, una escala numérica.
**Objetivo de fase que ejecuta:** Fase 1, Confrontación — generar el punto de partida honesto ("¿de dónde vienes de verdad?") sobre el que se construye todo lo demás.

## Instrucciones para el usuario

Vas a mantener una entrevista guiada por IA en cuatro bloques: carrera, energía, relaciones e insatisfacciones generales. No hay respuesta correcta ni incorrecta. Hay una sola regla: responde lo que es verdad, no lo que suena razonable. Si tu primera respuesta es general ("bien, cansado pero bien"), la IA te va a pedir un ejemplo concreto. No es un fallo del sistema: es el ejercicio.

No edites tu respuesta para que quede mejor. No respondas pensando en que un coach la va a leer. Si usas voz, habla como lo harías si nadie más fuera a escucharlo.

## Estructura de la entrevista (orientativa, la IA adapta el orden según tus respuestas)

**Bloque Carrera**
1. Describe un día normal de trabajo tal como es, no como lo cuentas cuando alguien pregunta.
2. ¿Cuándo fue la última vez que sentiste algo parecido a orgullo real por lo que hiciste? Fecha o momento aproximado.
3. ¿Qué parte de tu trabajo evitas mencionar cuando hablas de él con gente que no lo conoce?

**Bloque Energía**
4. En una semana normal, ¿en qué momento del día te sientes con menos energía? ¿Desde cuándo es así?
5. ¿Qué haces hoy para recuperar energía que, si lo piensas, no funciona realmente?

**Bloque Relaciones**
6. ¿A quién no le cuentas lo que de verdad piensas sobre tu situación actual? ¿Por qué a esa persona en concreto?
7. ¿Qué relación de tu vida actual sostienes más por costumbre que por elección?

**Bloque Insatisfacciones generales**
8. Si tuvieras que nombrar una sola cosa que llevas aplazando hablar contigo mismo, ¿cuál sería?
9. ¿Qué parte de tu vida actual defenderías en voz alta aunque, en privado, no estés tan seguro?

## Cierre del ejercicio

Al final, valora: **"Hoy, mi nivel de energía vital general es de 1 a 10: ___"**. No pienses la respuesta más de cinco segundos.

## Qué recibes al terminar

Un resumen breve generado por la IA, visible para ti, con los temas que aparecieron (sin juicio ni consejo). Un resumen distinto y más detallado queda guardado para tu coach, visible solo si hay una llamada programada o si se activa una señal de aviso.
$ex2$,
  slides_content = $sl3$[{"title": "Portada", "bullets": ["Semana 1 · Auditoría vital honesta", "Fase 1: Confrontación", "\"¿De dónde vienes de verdad?\""], "note": "fondo oscuro, una sola llama pequeña como punto de luz (identidad \"la hoguera\")."}, {"title": "El punto de partida", "bullets": ["Antes de cambiar algo, hay que verlo.", "No vas a diseñar tu próximo paso esta semana.", "Vas a mirar, sin editar, dónde estás hoy."], "note": "tipografía grande, sin iconografía motivacional."}, {"title": "Inventario ≠ Confesión", "bullets": ["Inventario: \"tengo un buen trabajo.\"", "Confesión: \"tengo un buen trabajo y cada lunes es una pequeña muerte.\"", "Esta semana trabajamos con la segunda frase."], "note": "dos columnas, contraste visual fuerte."}, {"title": "Los 4 dominios", "bullets": ["Carrera", "Energía", "Relaciones", "Insatisfacciones generales"], "note": "cuatro bloques iguales, sin jerarquía visual entre ellos."}, {"title": "Cómo funciona la entrevista", "bullets": ["La IA pregunta.", "Tú respondes, sin pulir la respuesta.", "La IA refleja el patrón que detecta.", "Vuelve a preguntar.", "No hay respuesta correcta."], "note": null}, {"title": "Lo que la IA no va a hacer", "bullets": ["No te va a decir qué hacer.", "No va a diagnosticar nada.", "No va a decirte \"qué bien que lo compartas\".", "Su trabajo es preguntar y reflejar, no aconsejar."], "note": null}, {"title": "Por qué así", "bullets": ["El valor de este programa no está en el contenido.", "Está en saber cuándo la IA se aparta y entra tu coach.", "Esta semana, ese límite se activa si aparecen señales serias."], "note": "frase ancla, tipografía destacada."}, {"title": "Qué cuenta como \"de verdad\"", "bullets": ["General: \"las cosas están bien, aunque cansado.\"", "De verdad: ejemplo concreto, fecha, momento exacto.", "Si tu respuesta es general, te lo van a volver a preguntar."], "note": null}, {"title": "Qué pasa con lo que compartes", "bullets": ["Se guarda en tu perfil acumulado.", "Tu coach revisa un resumen antes de vuestra llamada.", "Solo se escala antes de tiempo si hay una señal seria."], "note": null}, {"title": "Señales que activan aviso al coach", "bullets": ["Lenguaje de crisis o desesperanza real.", "Bloqueo sostenido (misma respuesta repetida)."], "note": "tono informativo, no alarmista."}, {"title": "Lo que te llevas a la semana 2", "bullets": ["Esta auditoría no se cierra aquí.", "La semana 2 usa exactamente lo que digas hoy.", "Cuanto más honesto hoy, más preciso lo que viene."], "note": null}, {"title": "Cierre", "bullets": ["Tiempo estimado: 45–60 min.", "Sin interrupciones, sin editar tus respuestas.", "Empieza cuando estés listo."], "note": "CTA único hacia el ejercicio, sin más texto."}]$sl3$::jsonb
WHERE week_number = 1;

-- Semana 2: El coste de no cambiar
UPDATE public.modules SET
  phase_name = 'Confrontación',
  title = 'El coste de no cambiar',
  objective = 'Proyectar el coste real de seguir igual durante 5 años, generando la fricción emocional que sostiene el compromiso con el cambio.',
  theory_content = $th4$# Sesión 2 · Semana 2 · Módulo 1.2 — El coste de no cambiar

**Fase:** 1. Confrontación · **Pregunta que responde:** ¿De dónde vienes de verdad?

## De dónde viene / hacia dónde empuja

Esta sesión recoge directamente `insatisfacciones_declaradas` y `patrones_lenguaje_detectados_s1` de la Sesión 1. No es una casualidad de secuencia: el bot usa específicamente los dominios donde detectó mayor carga emocional o evasión en la auditoría para dirigir la proyección de esta semana. Si en la Sesión 1 el usuario evadió sistemáticamente el dominio "relaciones", esta semana la proyección a 5 años presiona explícitamente ahí, porque es el punto donde más probablemente se esconde algo que todavía no se ha nombrado.

Lo que esta sesión deja preparado es doble. Primero, `resumen_fase1_cierre`, la síntesis que el coach humano usará en el checkpoint de contención emocional al final de esta misma semana: esa llamada no es una sesión de contenido más, es el punto donde un humano contiene lo que la IA ha estado, deliberadamente, removiendo durante dos semanas. Segundo, los tres costes declarados (emocional, relacional, identitario) funcionan como pista inicial de qué valores están probablemente desatendidos, material que la Sesión 3 retomará al construir el mapa de valores.

## Concepto central: la proyección como mecanismo de fricción, no de motivación

Existe una versión blanda de este ejercicio que circula en coaching genérico: "visualiza dónde quieres estar en 5 años". Esta sesión hace exactamente lo contrario. No se proyecta el futuro deseado; se proyecta el futuro que ocurre si nada cambia y la inercia actual simplemente continúa. La diferencia es deliberada y no es un matiz estilístico: proyectar lo deseado genera motivación cómoda y desconectada de la acción; proyectar la continuidad sin cambios genera el tipo de incomodidad que efectivamente mueve a alguien a actuar, porque hace tangible un coste que hasta ahora era abstracto.

Esto conecta directamente con el posicionamiento high ticket del programa: la propuesta de valor no es "te ayudamos a soñar en grande", es "te obligamos a mirar de frente lo que cuesta no decidir". Un programa que evitara este ejercicio, o lo suavizara con lenguaje de "no te preocupes, esto es solo un ejercicio mental", estaría devolviendo al usuario el mismo relato protector que la Sesión 1 empezó a desmontar.

## Por qué este ejercicio va después de la auditoría y no antes

Proyectar el coste de no cambiar sin haber hecho primero la auditoría honesta de la Sesión 1 produciría una proyección genérica, construida sobre el mismo relato editado que el usuario ya usa en su vida diaria. La auditoría proporciona el material crudo —los dominios específicos, el lenguaje específico, las fechas y ejemplos concretos— que esta sesión necesita para que la proyección no sea un ejercicio abstracto de "imagina que las cosas van mal", sino una extrapolación directa y nombrada de patrones que el propio usuario ya reconoció hace siete días. Por eso el bot abre esta sesión citando literalmente fragmentos de lo que el usuario dijo en la Sesión 1 antes de pedir la proyección: no es un recordatorio cordial, es la materia prima del ejercicio.

## Los tres costes

La proyección se descompone en tres dimensiones de coste: emocional (cómo te sientes al imaginarlo), relacional (qué pasa con las personas de tu vida) e identitario (qué parte de ti se pierde o se confirma). Separar estas tres dimensiones impide que el usuario resuelva el ejercicio con una única frase vaga ("sería triste"). Cada dimensión exige su propia cifra y su propia justificación, lo que multiplica la probabilidad de que aparezca una contradicción útil: es habitual que alguien declare un coste emocional alto y, en la misma respuesta, minimice el coste identitario, sugiriendo que todavía no ha conectado del todo las dos cosas. Esa discrepancia —calculada automáticamente contra lo declarado en la Sesión 1— es precisamente lo que el bot marca para que el coach la trabaje en la llamada de contención.

## El rol de la IA y el límite de esta sesión

La IA sostiene el espacio: pregunta, deja espacio para la respuesta completa, refleja el patrón sin suavizarlo y sin amplificarlo artificialmente. No introduce dramatismo que el usuario no haya puesto él mismo, pero tampoco lo retira cuando aparece. Si el usuario describe su proyección con palabras que indican desesperanza real y no solo malestar proyectado, la IA no continúa el guion de preguntas: marca la señal y el sistema prioriza esa sesión para el coach antes de la llamada programada, exactamente como define el principio de apalancamiento del programa —el valor no está en que la IA complete el módulo, está en que sepa cuándo dejar de hacerlo.

## Qué cierra esta sesión y qué abre

Esta sesión cierra la Fase 1 de Confrontación. El checkpoint de fin de semana 2 existe específicamente para contener lo que estas dos semanas han removido, no para analizarlo más. Por eso el resumen que el bot entrega al coach no es un informe interpretativo: es una síntesis fiel de lo dicho, con las discrepancias señaladas, para que sea el humano —no la IA— quien decida cómo sostener esa conversación. A partir de aquí, el programa deja de preguntar "de dónde vienes" y empieza a preguntar "qué es importante de verdad": pero esa pregunta solo puede hacerse con honestidad porque estas dos semanas ya pusieron un precio real a seguir igual.
$th4$,
  exercise_content = $ex5$# Sesión 2 · Ejercicio práctico — El coste de no cambiar

**Tiempo estimado:** 45 minutos.
**Formato de respuesta:** texto (recomendado para poder releerlo) o voz transcrita. Cierre con tres escalas numéricas.
**Objetivo de fase que ejecuta:** Fase 1, Confrontación — poner precio tangible a la inercia, cerrando el ciclo de "¿de dónde vienes de verdad?".

## Instrucciones para el usuario

Antes de empezar, la IA te recordará 2 o 3 fragmentos literales de lo que dijiste en la Sesión 1. Vas a escribir, en primera persona y en presente, un día cualquiera de tu vida dentro de 5 años **si nada de lo que nombraste la semana pasada cambia**. No es un ejercicio de pesimismo gratuito: es una extrapolación directa de los patrones que tú mismo ya identificaste. Sé específico: hora del día, lugar, con quién estás, qué sientes.

## Guion de la proyección (la IA te guía bloque a bloque)

1. Describe una mañana cualquiera dentro de 5 años, si el patrón de carrera que nombraste la semana pasada simplemente continúa.
2. Describe cómo te sientes físicamente un día normal, si el patrón de energía que nombraste no ha cambiado.
3. Describe una conversación (o la ausencia de ella) con la persona que mencionaste en la Sesión 1, dentro de 5 años, en las mismas condiciones.
4. Escribe la frase que te dirías a ti mismo esa noche, al acostarte, en ese escenario.

## Cierre del ejercicio — tres escalas

Después de escribir la proyección, valora cada una de 1 a 10:

- **Coste emocional**: "Imaginar esto me afecta emocionalmente en un grado de ___ / 10."
- **Coste relacional**: "El impacto en mis relaciones, en ese escenario, es de ___ / 10."
- **Coste identitario**: "Sentir que esa persona de dentro de 5 años sigue siendo 'yo', o no, me produce un impacto de ___ / 10."

Para cada escala, añade una frase corta explicando el número (no vale solo poner la cifra).

## Qué recibes al terminar

Un resumen breve para ti, sin interpretación añadida. El resumen más completo —incluyendo cualquier discrepancia entre lo que dijiste la semana pasada y lo que acabas de describir— se incorpora al informe que tu coach revisa antes de la llamada de esta semana.
$ex5$,
  slides_content = $sl6$[{"title": "Portada", "bullets": ["Semana 2 · El coste de no cambiar", "Fase 1: Confrontación (cierre)", "\"¿De dónde vienes de verdad?\""], "note": null}, {"title": "Lo que ya dijiste", "bullets": ["La semana pasada nombraste dominios concretos.", "Esta semana no empezamos de cero.", "Vamos a proyectar exactamente eso, no una versión genérica."], "note": "referencia visual a \"semana 1\" como punto de partida del gráfico."}, {"title": "No es visualización de futuro ideal", "bullets": ["No vas a imaginar dónde quieres estar.", "Vas a imaginar dónde estás si nada cambia.", "Esa es la proyección que realmente mueve a decidir."], "note": null}, {"title": "Por qué incomoda a propósito", "bullets": ["Un insight cómodo no cambia nada.", "Este programa exige fricción real, no inspiración.", "El coste de hoy es abstracto. El ejercicio lo hace concreto."], "note": null}, {"title": "Tres dimensiones de coste", "bullets": ["Emocional: cómo te sientes al imaginarlo.", "Relacional: qué pasa con las personas de tu vida.", "Identitario: qué parte de ti se pierde o se confirma."], "note": "tres columnas con una escala 1–10 bajo cada una."}, {"title": "Una cifra no es suficiente", "bullets": ["\"Sería triste\" no es una respuesta completa.", "Cada dimensión necesita su propia justificación.", "Las contradicciones entre dimensiones son información, no errores."], "note": null}, {"title": "El rol de la IA aquí", "bullets": ["Sostiene el espacio, no lo suaviza.", "No añade dramatismo que tú no hayas puesto.", "Tampoco lo retira si tú lo pones."], "note": null}, {"title": "El límite", "bullets": ["Si aparece desesperanza real, no desánimo puntual, el sistema avisa a tu coach.", "No espera a la llamada programada."], "note": "tono informativo, sin alarmismo visual."}, {"title": "Lo que cierra esta semana", "bullets": ["Esta sesión cierra la Fase 1: Confrontación.", "Dos semanas de mirar de frente, sin editar."], "note": null}, {"title": "Tu llamada de esta semana", "bullets": ["Checkpoint con tu coach: contención, no análisis.", "Tu coach ya tiene el resumen antes de hablar contigo."], "note": null}, {"title": "Lo que viene", "bullets": ["Semana 3: de \"de dónde vienes\" a \"qué es importante de verdad\".", "El coste que acabas de nombrar apunta ya hacia ello."], "note": null}]$sl6$::jsonb
WHERE week_number = 2;

-- Semana 3: Mapa de valores
UPDATE public.modules SET
  phase_name = 'Claridad',
  title = 'Mapa de valores',
  objective = 'Identificar y priorizar 5 valores centrales, calculando la distancia real entre lo que se declara importante y lo que efectivamente se atiende hoy.',
  theory_content = $th7$# Sesión 3 · Semana 3 · Módulo 2.1 — Mapa de valores

**Fase:** 2. Claridad · **Pregunta que responde:** ¿Qué es importante de verdad?

## De dónde viene / hacia dónde empuja

Esta sesión recoge los tres costes declarados en la Sesión 2 —emocional, relacional, identitario— y los dominios donde esos costes fueron más altos. No son casualidad: el bot los usa como candidatos iniciales al construir la lista de valores a explorar, porque es razonable asumir que el coste más alto señala, casi siempre, el valor más desatendido. Lo que esta sesión deja preparado es un único dato que concentra todo el trabajo de las dos semanas anteriores: `valor_mayor_gap`, el valor con mayor diferencia entre lo que el usuario dice priorizar y lo que realmente atiende en su vida hoy. Ese valor se convierte, en la Sesión 4, en el sujeto de la pregunta central: ¿la mejor versión de ti vive ese valor, o solo lo menciona?

## Concepto central: valor declarado no es valor vivido

Casi cualquier persona, si se le pide que nombre cinco valores importantes, puede hacerlo sin esfuerzo: familia, salud, honestidad, crecimiento, libertad. La lista en sí no aporta información útil porque es, en gran medida, culturalmente heredada —son los valores que "se supone" que hay que tener. El dato que sí aporta información es la brecha entre esa lista y la atención real que cada valor recibe en la vida cotidiana del usuario. Esta sesión no pregunta qué valoras; pregunta cuánto de tu tiempo, energía y decisiones reales está efectivamente alineado con lo que dices valorar.

Esa brecha se calcula de forma mecánica y transparente: el usuario prioriza sus cinco valores del 1 al 5, y después se autoevalúa, del 1 al 10, cuánta atención real recibe cada uno hoy. La diferencia entre prioridad y atención es el gap. No hace falta interpretación psicológica para calcularlo; hace falta honestidad para completarlo, que es exactamente lo que las dos sesiones anteriores han estado entrenando.

## Por qué los valores se trabajan ahora y no en la semana 1

Pedir a alguien que ranquee sus valores antes de haber confrontado el coste real de su vida actual produce un ranking aspiracional, desconectado de la experiencia vivida: la gente tiende a declarar como prioritario aquello que cree que debería priorizar, no lo que efectivamente organiza sus decisiones. Dos semanas de auditoría honesta y proyección de coste cambian la base desde la que se responde este ejercicio: el usuario ya ha nombrado, en sus propias palabras, qué le duele y cuánto le cuesta seguir igual. El ranking de valores de esta semana no parte de cero: parte de material ya confrontado, lo que hace mucho más difícil que la respuesta sea puramente aspiracional.

## La fórmula del gap como espejo, no como veredicto

Es importante que tanto el contenido como el bot comuniquen esto con claridad: un gap alto no es un fallo moral ni un diagnóstico. Es, simplemente, una descripción matemática de una discrepancia que probablemente el usuario ya sentía de forma difusa y que esta sesión convierte en un dato concreto y nombrado. El objetivo no es que el usuario se sienta mal por el número; es que ese número se convierta en el ancla de todo el trabajo de diseño que viene en la Fase 3. Por eso el bot presenta el gap sin juicio, como una observación, y deja que sea el propio usuario quien decida qué significa.

## El rol de la IA en este módulo

Aquí el rol de la IA es más estructural que en las sesiones anteriores: guía el proceso de selección y ranking, y calcula los gaps automáticamente a partir de las cifras que el usuario proporciona. Pero sigue siendo socrática en el terreno cualitativo: cuando el usuario justifica por qué valora algo o por qué le da la puntuación de atención que le da, la IA puede pedir el ejemplo concreto detrás de la justificación, de la misma manera que en la Sesión 1 pedía el ejemplo detrás de la generalidad. Un valor justificado con una frase abstracta ("la familia es lo más importante") sin ningún ejemplo reciente de decisión tomada en función de ese valor es una señal de que el ranking, en ese punto, puede ser más aspiracional que real.

## Anclaje al marco del programa

Este módulo es el corazón de la Fase 2: Claridad, y responde directamente a la pregunta "¿qué es importante de verdad?" —de nuevo, con ese "de verdad" que distingue lo declarado de lo vivido. No se trata de descubrir valores nuevos ni exóticos; la mayoría de personas ya conocen, en abstracto, cuáles son sus cinco valores centrales. El trabajo real de este módulo es cuantificar honestamente la distancia entre esos valores y la vida que efectivamente se está viviendo, sin que el coach humano tenga que intervenir todavía: su momento llega en la Sesión 4, cuando toque resolver la contradicción entre lo que el mapa de valores revela y cómo el usuario se describe a sí mismo en su mejor versión.
$th7$,
  exercise_content = $ex8$# Sesión 3 · Ejercicio práctico — Mapa de valores

**Tiempo estimado:** 40 minutos.
**Formato de respuesta:** selección + ranking (escala) + justificación breve en texto por valor.
**Objetivo de fase que ejecuta:** Fase 2, Claridad — identificar con precisión qué es importante "de verdad", cuantificando la distancia entre valor declarado y valor vivido.

## Instrucciones para el usuario

La IA te mostrará, a partir de lo que dijiste en las Sesiones 1 y 2, dos o tres dominios donde detectó más carga emocional. Tenlos en mente, pero no te limites a ellos: elige con libertad.

## Paso 1 — Selección y ranking

Elige **5 valores** que consideres centrales en tu vida (puedes partir de una lista orientativa o escribir los tuyos). Ordénalos del 1 (más prioritario) al 5 (menos prioritario). Para cada uno, escribe una frase: "sé que valoro esto porque..." con un ejemplo concreto y reciente, no una afirmación general.

## Paso 2 — Autoevaluación de atención real

Para cada uno de los 5 valores, responde: **"Hoy, la atención real que le doy a este valor en mi vida es de 1 a 10: ___"**. De nuevo, justifica con un ejemplo concreto de la última semana, no con una impresión general.

## Paso 3 — Revisión del gap

La IA calculará automáticamente la diferencia entre tu prioridad declarada y tu atención real para cada valor, y te mostrará cuál tiene el gap mayor. No se te pedirá que lo arregles ni que lo expliques todavía: solo que lo confirmes o lo matices si sientes que el cálculo no refleja bien tu situación.

## Qué recibes al terminar

Tu mapa de valores completo con los 5 gaps calculados, y una indicación clara de cuál es tu `valor_mayor_gap`. Este dato es el que trabajarás en profundidad la próxima semana.
$ex8$,
  slides_content = $sl9$[{"title": "Portada", "bullets": ["Semana 3 · Mapa de valores", "Fase 2: Claridad", "\"¿Qué es importante de verdad?\""], "note": null}, {"title": "Lo que trae esta semana", "bullets": ["Las dos semanas anteriores pusieron precio a seguir igual.", "Esta semana convertimos ese precio en datos concretos."], "note": null}, {"title": "Cualquiera puede nombrar valores", "bullets": ["Familia, salud, honestidad, libertad, crecimiento.", "Casi todos dirían lo mismo si se lo preguntas.", "Esa lista, sola, no dice nada todavía."], "note": null}, {"title": "La pregunta que sí importa", "bullets": ["No es \"qué valoras\".", "Es \"cuánto de tu vida real está alineado con eso\"."], "note": "frase ancla, slide con mucho espacio en blanco."}, {"title": "El ejercicio en dos pasos", "bullets": ["Paso 1: elige 5 valores y ordénalos por prioridad (1–5).", "Paso 2: valora del 1 al 10 cuánta atención real recibe cada uno hoy."], "note": null}, {"title": "El gap", "bullets": ["Gap = prioridad declarada − atención real.", "Un gap alto no es un fallo. Es un dato."], "note": "ilustración simple tipo balanza o barra comparativa, sin nombres reales."}, {"title": "Por qué ahora y no en la semana 1", "bullets": ["Rankear valores sin confrontar antes el coste real produce una lista aspiracional.", "Después de dos semanas de honestidad, el ranking parte de otro lugar."], "note": null}, {"title": "El rol de la IA aquí", "bullets": ["Guía el proceso y calcula los gaps.", "Si justificas un valor sin un ejemplo concreto, te lo va a preguntar.", "Sigue sin aconsejarte ni validarte."], "note": null}, {"title": "Esto no es un veredicto", "bullets": ["El valor con mayor gap no te define.", "Es el punto que vamos a examinar más de cerca la próxima semana."], "note": null}, {"title": "Formato del ejercicio", "bullets": ["Selección + ranking + autoevaluación.", "Una justificación corta por valor.", "~40 minutos."], "note": null}, {"title": "Lo que esta sesión no resuelve", "bullets": ["No vamos a resolver el gap esta semana.", "Vamos a nombrarlo con precisión."], "note": null}, {"title": "Lo que viene", "bullets": ["Semana 4: tu \"hoguera personal\".", "Vamos a poner ese valor de mayor gap frente al espejo."], "note": null}]$sl9$::jsonb
WHERE week_number = 3;

-- Semana 4: Tu hoguera personal
UPDATE public.modules SET
  phase_name = 'Claridad',
  title = 'Tu hoguera personal',
  objective = 'Contrastar la autoimagen en su mejor versión contra el valor de mayor gap, para ver si esa versión lo vive o solo lo evita.',
  theory_content = $th10$# Sesión 4 · Semana 4 · Módulo 2.2 — Tu hoguera personal

**Fase:** 2. Claridad · **Pregunta que responde:** ¿Qué es importante de verdad?

## De dónde viene / hacia dónde empuja

Esta sesión recoge directamente `valor_mayor_gap` y el ranking completo de la Sesión 3. No es un ejercicio nuevo de autoimagen desconectado de lo anterior: es, explícitamente, una prueba de ese dato concreto. Lo que esta sesión deja preparado es `resumen_fase2_cierre`, el contraste entre valores declarados y vida real que alimenta el checkpoint de fin de semana 4, y el brief de diseño para la Sesión 5: el valor de mayor gap se convierte en el criterio con el que, la próxima semana, se juzgará si las opciones generadas son reales o cosméticas.

## Concepto central: la autoimagen como coartada

"Hoguera personal" no pregunta qué piensas de ti de forma genérica. Pregunta, muy específicamente, qué representas —en tu mejor versión— para las personas que te rodean. Es una pregunta que casi todo el mundo puede responder con soltura, y ahí está el riesgo: la facilidad con la que se responde suele ser inversamente proporcional a cuánto se ha verificado contra la realidad. Es fácil decir "soy alguien en quien la gente confía" o "inspiro a los que me rodean". Es mucho más difícil decir cuándo fue la última vez que eso ocurrió de forma verificable, y en qué dominio concreto.

El propósito de esta sesión no es que el usuario describa una imagen bonita de sí mismo. Es cruzar esa imagen, de forma explícita y sin rodeos, contra el dato que la Sesión 3 ya calculó: `valor_mayor_gap`. La pregunta real de este módulo no es "¿qué representas?" sino "¿esa versión de ti vive el valor que tú mismo identificaste como más desatendido, o es precisamente la versión idealizada que te permite seguir sin atenderlo?".

## Por qué esto no se hace antes del mapa de valores

Si este ejercicio se hiciera en la Semana 1 o 2, sin el gap ya calculado, produciría exactamente el tipo de autodescripción halagadora y genérica que el programa busca evitar: una narrativa flatteringa sin ningún punto de contraste objetivo contra el que medirse. El mapa de valores de la Sesión 3 proporciona ese punto de contraste. Ahora, cuando el usuario describe su mejor versión, el bot puede preguntar directamente: "has descrito que inspiras a tu equipo con tu disponibilidad. Tu valor de mayor gap es 'tiempo con tu familia', con una atención real de 3 sobre 10. ¿Dónde está ese valor en esta versión de ti que acabas de describir?". Esa pregunta solo es posible porque el gap ya existe como dato concreto, no como intuición vaga.

## El checkpoint de fin de semana 4

Este módulo cierra la Fase 2: Claridad, y lo hace generando literalmente el contenido del checkpoint de esa semana: "contraste valores vs. vida actual". Esto no es una coincidencia de calendario: el diseño del módulo está pensado para que su output sea directamente utilizable por el coach humano en la llamada, sin que la IA tenga que interpretar nada de más. El rol del coach aquí, tal como está definido en el documento base, es resolver las contradicciones entre lo que el usuario dice valorar y cómo vive realmente — y esa resolución requiere un ser humano porque implica juicio, matiz y la capacidad de sostener una conversación incómoda sin la rigidez de un guion conversacional. La IA prepara el material; no intenta cerrar la contradicción ella misma.

## Qué hace la IA, y qué deliberadamente no hace

La IA pide la descripción de la mejor versión, pide el impacto declarado en otros, y después formula explícitamente la pregunta de contraste contra el valor de mayor gap. Si el usuario reconoce la discrepancia sin rodeos, la IA lo registra y continúa; no felicita la honestidad ni la trata como un logro especial, porque hacerlo sería exactamente el tipo de validación complaciente que el rol de la IA tiene prohibido. Si el usuario evita la pregunta de contraste, insiste en la descripción idealizada o la reformula sin tocar realmente el valor señalado, la IA lo marca como contradicción no resuelta y cede el terreno al coach, sin presionar más allá de una repregunta directa.

## Anclaje al posicionamiento del programa

Este es, probablemente, el módulo donde el posicionamiento high ticket se pone a prueba con mayor claridad: es fácil para cualquier programa de desarrollo personal generar una sesión de "visualiza tu mejor versión" que haga sentir bien al usuario. Es mucho menos común, y mucho más valioso, cruzar esa visualización contra un dato ya verificado de desatención real. El resultado de esta sesión no es una imagen inspiradora: es un contraste nombrado, con o sin resolución, que entra directamente en la conversación con el coach. A partir de aquí, el programa deja la Fase de Claridad y entra en Diseño: ya no se trata de nombrar qué importa, sino de generar opciones reales que, específicamente, no eludan el valor que esta sesión acaba de poner en evidencia.
$th10$,
  exercise_content = $ex11$# Sesión 4 · Ejercicio práctico — Tu hoguera personal

**Tiempo estimado:** 40–45 minutos.
**Formato de respuesta:** texto o voz (narrativa) + una escala de coherencia al cierre.
**Objetivo de fase que ejecuta:** Fase 2, Claridad (cierre) — generar el contraste explícito entre valores declarados y vida real que alimentará el checkpoint 1:1 de esta semana.

## Instrucciones para el usuario

La IA te recordará tu `valor_mayor_gap` de la semana pasada antes de empezar. Tenlo presente durante todo el ejercicio: vas a necesitarlo en la última parte.

## Paso 1 — Tu mejor versión

Describe, en el mayor detalle posible, qué representas para las personas que te rodean cuando estás en tu mejor momento. No te limites a adjetivos ("soy generoso, soy fiable"): describe una situación concreta y reciente donde esa versión de ti se mostró.

## Paso 2 — El impacto declarado

¿Qué le daría esa versión de ti a alguien cercano, si tuviera que nombrarlo con precisión? Piensa en una persona concreta, no en "la gente" de forma abstracta.

## Paso 3 — El cruce directo (obligatorio)

Ahora responde sin rodear la pregunta: **¿dónde está vivo tu valor de mayor gap —[valor_mayor_gap]— en la versión de ti que acabas de describir? ¿Y dónde, específicamente, no está?**

No vale responder solo a la primera mitad de la pregunta. Si te cuesta encontrar dónde no está, ese es exactamente el dato que esta sesión necesita.

## Cierre del ejercicio

Valora: **"Qué tan parecida es la versión de mí que acabo de describir a mi vida real de hoy, del 1 al 10: ___"**. Justifica brevemente la cifra.

## Qué recibes al terminar

Un resumen del contraste entre tu autoimagen y tu valor de mayor gap, que se incorpora directamente al informe que tu coach revisa antes de la llamada de esta semana — el checkpoint que cierra la Fase 2.
$ex11$,
  slides_content = $sl12$[{"title": "Portada", "bullets": ["Semana 4 · Tu hoguera personal", "Fase 2: Claridad (cierre)", "\"¿Qué es importante de verdad?\""], "note": null}, {"title": "La pregunta fácil", "bullets": ["\"¿Qué representas en tu mejor versión?\"", "Casi cualquiera puede responder esto con soltura.", "Esa facilidad es la señal de alerta, no la respuesta."], "note": null}, {"title": "Lo que ya sabemos de ti", "bullets": ["La semana pasada calculamos tu valor de mayor gap.", "Hoy esa imagen bonita se cruza con ese dato."], "note": "mostrar el valor_mayor_gap como recordatorio visual."}, {"title": "La pregunta real", "bullets": ["No es \"qué representas\".", "Es \"¿esa versión vive el valor que más desatiendes, o te permite seguir sin atenderlo?\""], "note": "frase ancla, slide limpio."}, {"title": "Un ejemplo del cruce", "bullets": ["\"Inspiro a mi equipo con mi disponibilidad.\"", "Valor de mayor gap: tiempo con tu familia (3/10).", "¿Dónde está ese valor en esta versión de ti?"], "note": null}, {"title": "Por qué ahora", "bullets": ["Sin el gap calculado, esto sería solo una imagen halagadora.", "Con el gap, se convierte en una prueba real."], "note": null}, {"title": "El checkpoint de esta semana", "bullets": ["Esta sesión cierra la Fase 2: Claridad.", "Tu llamada de esta semana trabaja exactamente este contraste."], "note": null}, {"title": "El rol de tu coach aquí", "bullets": ["La IA nombra la contradicción, no la resuelve.", "Resolverla requiere un humano: matiz, juicio, conversación real."], "note": null}, {"title": "Lo que la IA no va a hacer", "bullets": ["No te va a felicitar por ser honesto.", "No va a suavizar la contradicción si la evitas."], "note": null}, {"title": "Formato del ejercicio", "bullets": ["Descripción de tu mejor versión + pregunta de contraste directo.", "~40–45 minutos."], "note": null}, {"title": "Lo que viene", "bullets": ["Semana 5: de la claridad al diseño.", "Las opciones que generemos tendrán que mirar de frente este valor."], "note": null}]$sl12$::jsonb
WHERE week_number = 4;

-- Semana 5: Generación de opciones
UPDATE public.modules SET
  phase_name = 'Diseño',
  title = 'Generación de opciones',
  objective = 'Generar el mayor número posible de direcciones de vida o carrera, sin autocensura, anclando al menos parte de ellas al valor de mayor gap.',
  theory_content = $th13$# Sesión 5 · Semana 5 · Módulo 3.1 — Generación de opciones

**Fase:** 3. Diseño · **Pregunta que responde:** ¿Hacia dónde?

## De dónde viene / hacia dónde empuja

Esta sesión recoge, de forma literal, `valor_mayor_gap` y `resumen_fase2_cierre` de la Sesión 4: el contraste —reconocido o no— entre la autoimagen del usuario y el valor que más desatiende. Ese contraste se convierte aquí en un criterio de diseño explícito: al menos parte de las opciones que se generen esta semana deben abordar directamente ese valor, no rodearlo. Lo que esta sesión deja preparado es un listado bruto de opciones, marcado según si están ancladas al gap o no, que la Sesión 6 someterá a un filtro de restricciones reales. Sin este listado amplio, el filtro de la semana que viene no tendría material suficiente sobre el que trabajar, y correría el riesgo de limitarse a pulir la primera idea que al usuario se le ocurrió, que suele ser la más segura y la menos interesante.

## Concepto central: divergencia antes que convergencia

El error más común al diseñar un cambio de vida es intentar decidir y generar opciones al mismo tiempo. Cuando alguien piensa "¿qué dirección tomo?" ya está, sin darse cuenta, filtrando cada idea que se le ocurre contra sus miedos, sus restricciones asumidas y su imagen de lo que es "razonable". El resultado es una lista corta, prudente y casi siempre idéntica a lo que ya estaba haciendo con pequeñas variaciones cosméticas.

Este módulo invierte deliberadamente el orden: primero cantidad, después filtro. Durante esta sesión está explícitamente prohibido evaluar si una opción es viable, razonable o posible. La única instrucción es generar el mayor número posible de direcciones, sin autocensura. El filtro llega la semana siguiente, con reglas propias. Mezclar ambos procesos en la misma sesión es, estructuralmente, la forma más eficiente de sabotear el ejercicio: la mente humana no genera con libertad y evalúa con rigor al mismo tiempo sin que la evaluación contamine la generación desde el principio.

## Por qué esto no podía hacerse antes de la Fase 2

Generar opciones sin haber pasado antes por la auditoría, la proyección de coste, el mapa de valores y el contraste de la hoguera personal produciría un brainstorming genérico: ideas intercambiables, sacadas de la misma lista de "posibles cambios de vida" que cualquier persona en transición podría escribir sin conocerse en absoluto. Lo que hace que esta sesión sea específica y no genérica es que cada opción generada puede, y debe, ser evaluada contra un dato ya existente: `valor_mayor_gap`. El brainstorming no parte de cero; parte de una pregunta concreta en el fondo: "¿qué direcciones posibles atacan directamente el valor que llevo dos semanas confirmando que desatiendo?".

## La autocensura como señal, no como fallo del ejercicio

Es habitual que, pese a la instrucción explícita de no filtrar, aparezcan frases de autocensura incrustadas en las propias opciones ("podría cambiar de sector, pero no es realista", "me gustaría trabajar menos, aunque sé que no puedo"). Estas frases no son un error del usuario: son información valiosa sobre dónde está operando el miedo antes incluso de llegar al filtro de restricciones de la próxima semana. El rol de la IA aquí es señalar la autocensura sin corregirla ni sermonear sobre ella ("recuerda que esta semana no se filtra"), y simplemente invitar a reformular la idea sin el "pero". Si el patrón se repite de forma sistemática, se registra como señal relevante que la Sesión 6 deberá tener en cuenta al examinar si las restricciones declaradas son reales o son esa misma autocensura con otro nombre.

## El rol de la IA: generador y motor de filtrado, no decisor

El documento de estructura del programa define el rol de la IA en esta fase con precisión: generador de opciones y motor de filtrado. Esto es deliberadamente distinto de "decisor". La IA puede proponer categorías o ángulos que el usuario no haya considerado (cambio de sector, cambio de modalidad dentro del mismo sector, redefinición del rol actual, geografía, relación con el trabajo en sí), pero no sugiere la opción "correcta" ni insinúa cuál debería elegir. El rol de decidir —comprometerse con una o dos direcciones y gestionar el miedo que eso conlleva— pertenece explícitamente al coach humano, y llega en la Sesión 6, no aquí.

## Anclaje al posicionamiento del programa

Un programa de autoayuda genérico cerraría este módulo con una lista de "ideas inspiradoras". Este programa cierra la sesión con una lista de opciones marcadas, sin ambigüedad, según si abordan o evitan el valor que el usuario ya reconoció como desatendido. Esa marca es lo que da a la Sesión 6 su verdadero filo: el filtro de restricciones de la próxima semana no solo pregunta "¿qué es posible dado tu tiempo, tu dinero, tu familia o tu geografía?", sino también, de forma explícita, "¿estás usando esas restricciones para descartar precisamente las opciones que atacan tu gap?". Esta sesión existe para que esa pregunta, la semana próxima, tenga material real sobre el que apoyarse.
$th13$,
  exercise_content = $ex14$# Sesión 5 · Ejercicio práctico — Generación de opciones

**Tiempo estimado:** 40 minutos.
**Formato de respuesta:** lista de texto (o voz transcrita en lista).
**Objetivo de fase que ejecuta:** Fase 3, Diseño — generar el universo amplio de direcciones posibles ("¿hacia dónde?") sin filtrarlo todavía.

## Instrucciones para el usuario

Regla única: nada de "pero". Si al escribir una opción aparece la palabra "pero" seguida de una razón por la que no sería posible, borra esa segunda parte y deja solo la opción. La viabilidad no se evalúa hoy.

La IA te recordará tu valor de mayor gap de la Sesión 4 antes de empezar. No tienes que limitarte a él, pero al menos algunas de tus opciones deben abordarlo directamente.

## Tarea

Escribe una lista de **al menos 15 direcciones posibles** para tu vida o tu carrera en los próximos años. Pueden ser tan amplias o tan específicas como quieras. Algunas categorías que puedes explorar (no es necesario cubrirlas todas):

- Cambios dentro de tu sector actual
- Cambio completo de sector
- Cambio de modalidad (freelance, reducción de jornada, emprendimiento, etc.)
- Redefinición de tu rol actual sin cambiar de empresa
- Cambios de geografía
- Cambios en tu relación con el trabajo en sí (no qué haces, sino cuánto espacio ocupa en tu vida)

Si te atascas, escribe literalmente la opción que te da más miedo nombrar. No tienes que comprometerte con ella; solo escribirla.

## Cierre del ejercicio

Repasa tu lista y marca, junto a cada opción, si crees que esa dirección **atacaría directamente** tu valor de mayor gap (sí/no). No te preocupes si la mayoría son "no": eso también es información.

## Qué recibes al terminar

Tu listado completo, con las opciones ancladas a tu valor de mayor gap señaladas. La semana que viene, este mismo listado se somete a un filtro de restricciones reales.
$ex14$,
  slides_content = $sl15$[{"title": "Portada", "bullets": ["Semana 5 · Generación de opciones", "Fase 3: Diseño", "\"¿Hacia dónde?\""], "note": null}, {"title": "El error más común", "bullets": ["Decidir y generar opciones al mismo tiempo.", "El resultado: una lista corta, prudente, casi idéntica a lo que ya haces."], "note": null}, {"title": "Esta semana: solo cantidad", "bullets": ["No evalúes si una opción es viable.", "No evalúes si es razonable.", "Solo genera. El filtro llega la semana que viene."], "note": null}, {"title": "Por qué separarlo", "bullets": ["Generar con libertad y evaluar con rigor no funcionan bien al mismo tiempo.", "Mezclarlos contamina la generación desde el inicio."], "note": null}, {"title": "Tu criterio de diseño", "bullets": ["Recuerda tu valor de mayor gap de la semana 4.", "Al menos parte de tus opciones deben atacarlo directamente."], "note": "mostrar el valor_mayor_gap como recordatorio."}, {"title": "El \"pero\" como alarma", "bullets": ["\"Podría cambiar de sector, pero no es realista.\"", "Ese \"pero\" es autocensura adelantada. Táchalo.", "Escribe la idea sin la segunda mitad de la frase."], "note": null}, {"title": "Categorías para explorar", "bullets": ["Cambio de sector · Cambio de modalidad · Redefinir el rol actual", "Geografía · Relación con el trabajo en sí"], "note": "cinco bloques iguales, sin orden de preferencia."}, {"title": "El rol de la IA aquí", "bullets": ["Genera categorías y marca si tu opción ataca el gap.", "No decide por ti ni sugiere \"la correcta\"."], "note": null}, {"title": "Lo que no se resuelve hoy", "bullets": ["No vas a elegir dirección esta semana.", "Eso pertenece a la semana 6, con tu coach."], "note": null}, {"title": "Formato del ejercicio", "bullets": ["Lista abierta, mínimo 15 opciones.", "Sin filtrar. ~40 minutos."], "note": null}, {"title": "Lo que viene", "bullets": ["Semana 6: aplicamos restricciones reales a esta lista.", "Y revisamos si esas restricciones son reales, o es el mismo miedo con otro nombre."], "note": null}]$sl15$::jsonb
WHERE week_number = 5;

-- Semana 6: Filtro por restricciones reales
UPDATE public.modules SET
  phase_name = 'Diseño',
  title = 'Filtro por restricciones reales',
  objective = 'Aplicar entre 2 y 3 restricciones reales al listado de opciones y detectar si alguna restricción funciona como excusa para evitar el valor de mayor gap.',
  theory_content = $th16$# Sesión 6 · Semana 6 · Módulo 3.2 — Filtro por restricciones reales

**Fase:** 3. Diseño · **Pregunta que responde:** ¿Hacia dónde?

## De dónde viene / hacia dónde empuja

Esta sesión recoge, de forma directa, `opciones_generadas` y `señal_autocensura_detectada` de la Sesión 5. El listado completo de opciones es el universo sobre el que se aplica el filtro de esta semana; la señal de autocensura detectada la semana pasada determina con qué grado de exigencia el bot examina las restricciones que el usuario declare ahora. Lo que esta sesión deja preparado es `direccion_elegida` (provisional, pendiente de ratificación en el checkpoint) y `resumen_fase3_cierre`, que se convierte en el objeto directo del plan a 90 días de la Sesión 7: no se planifica una dirección en abstracto, se planifica, de forma literal, la dirección que sobrevive al filtro de esta semana.

## Concepto central: restricción real frente a restricción-excusa

El filtro de esta sesión parece, a primera vista, un ejercicio puramente mecánico: elegir 2 o 3 restricciones no negociables (tiempo, dinero, familia, geografía u otra) y aplicarlas contra el listado de opciones de la semana pasada para ver cuáles sobreviven. Pero el verdadero trabajo de este módulo no es aplicar el filtro: es examinar si las restricciones elegidas son límites reales o son la autocensura de la Sesión 5 reapareciendo con un nombre más respetable. Una restricción real impone un límite verificable ("tengo una hipoteca que exige unos ingresos mínimos durante los próximos tres años"). Una restricción-excusa suena igual de razonable mientras elimina, casi siempre, precisamente las opciones que la semana pasada quedaron marcadas como ancladas al valor de mayor gap.

Esta distinción no es un matiz académico: es el punto donde más fácilmente el programa entero podría degradarse en una versión sofisticada de "sigue haciendo lo mismo, pero ahora con un vocabulario de autoconocimiento". Por eso el filtro no se acepta sin más: se examina.

## Por qué el filtro llega después de la generación, y no antes

Si las restricciones se declarasen antes de generar el listado amplio de la Sesión 5, habrían contaminado la generación desde el principio, reduciendo el universo de opciones exactamente de la misma manera que el "pero" contaminaba cada idea en el ejercicio anterior. Al invertir el orden —generar sin restricción, filtrar después—, el programa obtiene dos piezas de información independientes que pueden cruzarse: qué opciones existen en abstracto, y qué opciones sobreviven a los límites reales de la vida del usuario. Si ambas coinciden perfectamente con lo que el usuario ya sospechaba que iba a elegir, es razonable sospechar que el filtro se ha construido a posteriori para justificar una decisión ya tomada por miedo, no por análisis.

## El mecanismo de detección de restricción-excusa

El bot no decide unilateralmente si una restricción es real o es excusa: cruza la justificación de cada restricción con dos datos ya existentes en el perfil —`señal_autocensura_detectada` de la Sesión 5 y `coste_emocional_declarado` de la Sesión 2— y señala la posible restricción-excusa como hipótesis a verificar, nunca como veredicto cerrado. Por ejemplo: si el usuario declara "geografía" como restricción no negociable ("no puedo moverme de ciudad") pero en la Sesión 2 declaró un coste emocional alto asociado precisamente a quedarse donde está, el bot marca esa tensión para que el coach la explore en la llamada, sin decirle al usuario "esto no es una restricción real, es miedo".

## El checkpoint de fin de semana 6: compromiso con una dirección

Este módulo cierra la Fase 3: Diseño, y el checkpoint asociado es, explícitamente, el de comprometerse con una dirección. El rol del coach aquí, tal como está definido en el documento base, es ayudar a comprometerse con una o dos direcciones y gestionar el miedo a decidir. Esto no es un trámite administrativo: decidir, incluso cuando el filtro ya ha hecho su trabajo mecánico, sigue siendo un acto que requiere acompañamiento humano, porque implica cerrar puertas reales, no solo seleccionar una opción de una lista. La IA entrega el resultado del filtro y la posible tensión restricción-excusa detectada; el coach hace el trabajo de sostener la decisión.

## Qué pasa si el filtro elimina todas las opciones ancladas al gap

Este es el escenario que el contenido y el bot deben tratar con más cuidado: si, tras aplicar las restricciones declaradas, ninguna de las opciones marcadas como ancladas a `valor_mayor_gap` sobrevive, esto no se presenta como un resultado neutro del ejercicio. Se marca explícitamente como contradicción no resuelta y se convierte en el tema central, no secundario, del checkpoint de esta semana: el usuario ha llegado, de forma mecánica y con sus propias reglas, a un resultado que elimina sistemáticamente la posibilidad de atender lo que él mismo identificó, hace dos semanas, como lo más desatendido de su vida. Nombrar esto con precisión, sin que la IA lo resuelva ni lo dulcifique, es lo que permite que la Fase 4 —Acción— empiece con un plan a 90 días construido sobre una dirección real, y no sobre la versión más cómoda de "seguir básicamente igual" disfrazada de decisión.
$th16$,
  exercise_content = $ex17$# Sesión 6 · Ejercicio práctico — Filtro por restricciones reales

**Tiempo estimado:** 45 minutos.
**Formato de respuesta:** selección + texto (justificación por eliminación) + escala de confianza.
**Objetivo de fase que ejecuta:** Fase 3, Diseño (cierre) — convergencia hacia una dirección provisional, aplicando límites reales al listado amplio de la Sesión 5.

## Instrucciones para el usuario

La IA te mostrará de nuevo tu listado completo de opciones de la semana pasada, con las que marcaste como ancladas a tu valor de mayor gap destacadas.

## Paso 1 — Define tus restricciones no negociables

Elige entre **2 y 3** restricciones reales de tu vida actual, de estas categorías (o "otra" si no encaja): tiempo, dinero, familia, geografía. Para cada una, escribe una frase que explique el límite concreto y verificable que impone (no una sensación general de dificultad).

## Paso 2 — Aplica el filtro

Revisa cada opción de tu listado de la Sesión 5 y marca: **sobrevive / no sobrevive** a tus restricciones. Para cada opción que elimines, escribe en una frase por qué no sobrevive.

## Paso 3 — Confianza en tus restricciones

Valora: **"Qué tan seguro estoy de que estas restricciones son límites reales, y no miedo con otro nombre, del 1 al 10: ___"**. Justifica brevemente.

## Paso 4 — Resultado

De las opciones que sobreviven, elige la que sientas con más claridad como tu dirección provisional. No tiene que ser definitiva: se confirmará en tu llamada con el coach esta semana.

## Qué recibes al terminar

Tu listado filtrado completo, tu dirección provisional, y si corresponde, una nota indicando que alguna de tus restricciones podría estar funcionando como excusa — este dato se incorpora al informe que tu coach revisa antes del checkpoint de esta semana, el de comprometerte con una dirección.
$ex17$,
  slides_content = $sl18$[{"title": "Portada", "bullets": ["Semana 6 · Filtro por restricciones reales", "Fase 3: Diseño (cierre)", "\"¿Hacia dónde?\""], "note": null}, {"title": "Lo que tienes hoy", "bullets": ["La semana pasada generaste un listado amplio, sin filtrar.", "Hoy aplicamos límites reales a ese listado."], "note": null}, {"title": "Elige 2 o 3 restricciones no negociables", "bullets": ["Tiempo · Dinero · Familia · Geografía · Otra", "No más de 3. Si eliges más, probablemente no son todas reales."], "note": null}, {"title": "Restricción real vs. restricción-excusa", "bullets": ["Real: impone un límite verificable.", "Excusa: suena igual de razonable, y elimina justo lo incómodo."], "note": "dos columnas, sin ejemplos con nombres reales."}, {"title": "Cómo lo revisamos", "bullets": ["La IA cruza tu restricción con cosas que ya dijiste antes.", "No decide por ti si es real o no. Señala la tensión."], "note": null}, {"title": "Un ejemplo del cruce", "bullets": ["Restricción declarada: \"no puedo cambiar de ciudad.\"", "Dato previo: coste emocional alto asociado a quedarte donde estás.", "Esa tensión se marca, no se resuelve aquí."], "note": null}, {"title": "Aplicando el filtro", "bullets": ["Revisa cada opción de tu lista de la semana pasada.", "¿Sobrevive a tus restricciones? Sí / No, con justificación breve."], "note": null}, {"title": "El escenario que más importa", "bullets": ["Si el filtro elimina TODAS las opciones ancladas a tu valor de mayor gap...", "Eso no es un resultado neutro. Es el tema central de tu llamada de esta semana."], "note": null}, {"title": "El checkpoint de esta semana", "bullets": ["Esta sesión cierra la Fase 3: Diseño.", "Tu coach te ayuda a comprometerte con una dirección. Y a gestionar el miedo de decidir."], "note": null}, {"title": "Lo que la IA no hace aquí", "bullets": ["No te dice qué restricción es falsa.", "No elige la dirección por ti."], "note": null}, {"title": "Formato del ejercicio", "bullets": ["Define restricciones + aplica el filtro a tu lista.", "~45 minutos."], "note": null}, {"title": "Lo que viene", "bullets": ["Semana 7: la dirección que sobreviva se convierte en un plan a 90 días.", "Con hitos medibles, no intenciones."], "note": null}]$sl18$::jsonb
WHERE week_number = 6;

-- Semana 7: Plan a 90 días
UPDATE public.modules SET
  phase_name = 'Acción',
  title = 'Plan a 90 días',
  objective = 'Convertir la dirección elegida en hitos medibles a 90 días, con fecha y criterio de cumplimiento verificable.',
  theory_content = $th19$# Sesión 7 · Semana 7 · Módulo 4.1 — Plan a 90 días

**Fase:** 4. Acción · **Pregunta que responde:** ¿Cuál es el primer paso real?

## De dónde viene / hacia dónde empuja

Esta sesión recoge `direccion_elegida`, ratificada en el checkpoint de la Sesión 6, y la trata como un dato cerrado, no como una propuesta más a discutir. El trabajo de esta semana no es volver a preguntar "hacia dónde", sino "con qué paso concreto, verificable y fechado se empieza a ejecutar esa dirección ya decidida". Lo que esta sesión deja preparado son los `hitos_90_dias`: el objeto literal que la Sesión 8 convertirá en sistema de seguimiento semanal y en el núcleo del informe final del programa.

## Concepto central: la diferencia entre intención y hito

"Quiero dedicar más tiempo a explorar el cambio de sector" es una intención. "El 15 de noviembre habré enviado mi CV actualizado a tres empresas del sector X, y lo sabré porque tendré las tres confirmaciones de envío" es un hito. La diferencia no es de ambición, es de verificabilidad: una intención puede sostenerse indefinidamente sin que nadie, ni siquiera el propio usuario, pueda determinar con certeza si se ha cumplido o no. Un hito tiene una fecha y un criterio de cumplimiento tan concreto que la pregunta "¿se cumplió o no?" se responde con un simple sí o no, sin margen de interpretación.

Esta sesión exige que cada uno de los hitos del plan a 90 días pase esa prueba. No se trata de que el usuario sea más ambicioso ni más optimista; se trata de que sea más preciso. Un plan compuesto por intenciones bien formuladas es, en la práctica, indistinguible de no tener plan: ofrece la sensación de avance sin la posibilidad real de verificarlo, lo que a su vez hace invisible cualquier estancamiento hasta que ya ha pasado demasiado tiempo.

## Por qué esto no podía escribirse antes de la Sesión 6

Un plan de 90 días redactado antes de que existiera una dirección filtrada y comprometida sería, en el mejor de los casos, un plan genérico de productividad personal, desconectado del trabajo específico de las seis semanas anteriores. El valor de este módulo depende enteramente de que `direccion_elegida` ya exista como dato fijo: cada hito que se proponga en esta sesión se contrasta explícitamente contra esa dirección, no contra una aspiración vaga de "mejorar" o "avanzar". Si un hito no tiene relación clara con la dirección elegida, no es un hito válido para este plan, por razonable que suene en abstracto.

## El hito más difícil como dato explícito

Además de los hitos en sí, esta sesión pide al usuario que identifique cuál de ellos le resulta más difícil y por qué. Este dato no es un añadido anecdótico: es, con frecuencia, el mejor predictor de dónde aparecerá el primer bloqueo real durante la Fase de Acción. Nombrarlo con antelación, antes de que el bloqueo ocurra, permite que el sistema de accountability de la Sesión 8 preste atención reforzada precisamente a ese hito, en lugar de tratarlo con la misma prioridad genérica que los demás.

## El rol de la IA: contraste de coherencia, no planificación

La IA no diseña el plan por el usuario ni sugiere hitos concretos que luego el usuario simplemente acepte. Su función es doble: primero, examinar cada hito propuesto y determinar si cumple el criterio de verificabilidad (fecha y criterio de cumplimiento concretos), devolviendo al usuario cualquier hito que siga siendo, en el fondo, una intención disfrazada de hito. Segundo, contrastar cada hito contra `direccion_elegida` para detectar desalineaciones —hitos que, aunque bien formulados, en realidad no ejecutan la dirección comprometida la semana anterior, sino una versión más cómoda o tangencial de ella.

## Anclaje al posicionamiento y a la fase

La Fase 4 responde a la pregunta "¿cuál es el primer paso real?", y la palabra "real" cumple aquí la misma función que "de verdad" cumplía en las fases anteriores: distingue el paso que efectivamente se puede verificar del paso que suena bien en una conversación pero no se sostiene bajo escrutinio. El posicionamiento high ticket del programa exige que este plan no sea una lista de buenas intenciones entregada como cierre simbólico de un proceso de autoconocimiento: exige hitos que un tercero, sin conocer al usuario, podría verificar como cumplidos o no cumplidos con solo mirar la fecha y el criterio. Ese nivel de precisión es lo que la Sesión 8 necesita para poder hacer seguimiento real, y es lo que convierte el informe final del programa, dentro de un mes, en un documento con sustancia verificable y no en un resumen motivacional más.
$th19$,
  exercise_content = $ex20$# Sesión 7 · Ejercicio práctico — Plan a 90 días

**Tiempo estimado:** 45–50 minutos.
**Formato de respuesta:** texto estructurado (campos fijos por hito) + escala de confianza.
**Objetivo de fase que ejecuta:** Fase 4, Acción — convertir la dirección elegida y ratificada en hitos medibles ("¿cuál es el primer paso real?").

## Instrucciones para el usuario

La IA te recordará tu `direccion_elegida`, tal como quedó ratificada en tu llamada de la semana pasada. Todo lo que escribas aquí debe ejecutar esa dirección, no una versión alternativa o más cómoda de ella.

## Tarea — define entre 3 y 5 hitos

Para cada hito, completa estos tres campos:

1. **Hito**: la acción o resultado concreto.
2. **Fecha objetivo**: dentro de los próximos 90 días.
3. **Criterio de cumplimiento**: cómo sabrás, sin ambigüedad, que está cumplido (debe poder responderse con sí o no, no con "más o menos").

Si un hito no tiene un criterio claro de cumplimiento, la IA te lo devolverá para que lo precises antes de continuar.

## El hito más difícil

De los hitos que has escrito, señala cuál sientes que te va a costar más sostener, y en una frase, por qué.

## Cierre del ejercicio

Valora: **"Mi confianza en cumplir este plan tal como está escrito, del 1 al 10: ___"**. Si la cifra es baja, añade una frase indicando qué parte del plan es la que menos confianza te genera.

## Qué recibes al terminar

Tu plan completo de hitos, con la verificación de que cada uno es medible y de que se alinea con tu dirección elegida. Este plan es exactamente lo que se usará la próxima semana para configurar tu sistema de seguimiento.
$ex20$,
  slides_content = $sl21$[{"title": "Portada", "bullets": ["Semana 7 · Plan a 90 días", "Fase 4: Acción", "\"¿Cuál es el primer paso real?\""], "note": null}, {"title": "Tu dirección ya está decidida", "bullets": ["La semana pasada la comprometiste con tu coach.", "Esta semana no se vuelve a discutir el \"hacia dónde\"."], "note": null}, {"title": "Intención vs. hito", "bullets": ["Intención: \"quiero explorar un cambio de sector.\"", "Hito: \"15 de noviembre, CV enviado a 3 empresas del sector X.\""], "note": "dos columnas, contraste directo."}, {"title": "La prueba de un hito real", "bullets": ["¿Tiene fecha?", "¿Tiene un criterio de cumplimiento verificable por un sí o un no?", "Si falla cualquiera de las dos, no es un hito todavía."], "note": null}, {"title": "Por qué importa tanto", "bullets": ["Un plan de intenciones se siente como avance sin poder verificarse.", "El estancamiento se vuelve invisible hasta que es tarde."], "note": null}, {"title": "Cada hito, contra tu dirección", "bullets": ["No basta con que el hito esté bien formulado.", "Tiene que ejecutar la dirección que elegiste, no una versión más cómoda de ella."], "note": null}, {"title": "El hito más difícil", "bullets": ["Nómbralo ahora, antes de que aparezca el bloqueo.", "Es, casi siempre, el mejor indicador de dónde vas a necesitar más apoyo."], "note": null}, {"title": "El rol de la IA aquí", "bullets": ["Revisa si tus hitos son verificables.", "Contrasta cada uno contra tu dirección elegida.", "No diseña el plan por ti."], "note": null}, {"title": "Formato del ejercicio", "bullets": ["Entre 3 y 5 hitos, cada uno con fecha y criterio de cumplimiento.", "~45–50 minutos."], "note": null}, {"title": "Esto no es la fase final", "bullets": ["Este plan es el objeto de seguimiento de las próximas semanas.", "La próxima sesión configura cómo se sostiene."], "note": null}, {"title": "Lo que viene", "bullets": ["Semana 8: sistema de accountability y cierre del programa.", "El informe final se construye con todo lo trabajado hasta aquí."], "note": null}]$sl21$::jsonb
WHERE week_number = 7;

-- Semana 8: Sistema de accountability y cierre
UPDATE public.modules SET
  phase_name = 'Acción',
  title = 'Sistema de accountability y cierre',
  objective = 'Configurar el sistema de seguimiento semanal y generar el informe final que cierra el programa y prepara el siguiente paso del embudo.',
  theory_content = $th22$# Sesión 8 · Semana 8 · Módulo 4.2 — Sistema de accountability y cierre

**Fase:** 4. Acción · **Pregunta que responde:** ¿Cuál es el primer paso real?

## De dónde viene / hacia dónde empuja

Esta sesión recoge, de forma literal, `hitos_90_dias` y `hito_mas_dificil_declarado` de la Sesión 7 para configurar la cadencia y el foco del sistema de seguimiento semanal. Pero recoge, además, todo el perfil acumulado construido desde la Sesión 1: no hay un módulo anterior que esta sesión no utilice. Lo que esta sesión deja preparado no es material para una Sesión 9 —el programa termina aquí—, sino `informe_final_generado` y `recomendacion_siguiente_escalon`: el puente explícito hacia el siguiente escalón del embudo, ya sea acompañamiento 1:1 continuado, el retiro presencial en León, o ambos.

## Concepto central: lo que no se mide no se sostiene

Un plan de 90 días sin mecanismo de seguimiento es, en la práctica, una intención con fecha de caducidad disfrazada de plan. Esta sesión instala el sistema de check-ins automáticos semanales que convierte el plan de la Sesión 7 en algo vivo: cada semana, la IA pregunta por el estado de los hitos, no como recordatorio genérico, sino con atención reforzada sobre el hito que el propio usuario identificó como más difícil. Las señales de abandono o bloqueo detectadas en estos check-ins se escalan al coach, exactamente igual que cualquier otra señal del programa, pero con una diferencia de contexto: aquí el coach ya no está ayudando a decidir una dirección, está ayudando a sostenerla.

## El informe final como pieza de venta natural, no como pitch forzado

El documento de estructura del programa es explícito sobre esto: el informe final de la Fase 4 es, en sí mismo, el argumento de venta hacia el siguiente escalón del embudo, sin necesidad de un pitch forzado. Esto cambia por completo cómo debe construirse este informe. No es un resumen motivacional de "mira todo lo que has logrado". Es una síntesis fiel y verificable de ocho semanas de trabajo: la auditoría honesta de la Sesión 1, el coste nombrado en la Sesión 2, el valor de mayor gap de la Sesión 3, el contraste —resuelto o no— de la Sesión 4, el universo de opciones y el filtro de las Sesiones 5 y 6, y el plan concreto de la Sesión 7. Cuando ese recorrido se presenta con precisión, la conclusión natural de que el trabajo merece continuidad —con un coach, en un retiro, o en ambos— no necesita ser argumentada: se desprende sola de la evidencia acumulada.

## Por qué esto no podía escribirse en ninguna sesión anterior

Cada sesión previa ha sido, de forma deliberada, incompleta por sí misma: trabaja un fragmento específico del proceso y deja explícitamente abierto lo que la siguiente sesión retomará. Esta es la única sesión del programa diseñada para mirar hacia atrás en su totalidad en lugar de hacia adelante. Por eso su primera tarea técnica no es generar contenido nuevo, sino recorrer el perfil acumulado completo y verificar que no queda ninguna contradicción marcada como no resuelta sin mencionar explícitamente en el cierre: si en la Sesión 4 o en la Sesión 6 quedó una tensión sin resolver, esta sesión no la ignora ni asume que el paso del tiempo la resolvió sola. La nombra, de nuevo, en el informe final.

## El sistema de accountability y los cuatro triggers, revisados en conjunto

Esta sesión es también la única donde los cuatro triggers de escalado se revisan no de forma aislada, sesión a sesión, sino como patrón histórico completo. La inactividad ya no se mide solo dentro de la semana activa: se mide contra el ritmo general del usuario a lo largo de las ocho semanas. El bloqueo repetido ya no se evalúa módulo a módulo: se revisa si hubo una concentración de bloqueos en una fase concreta, lo cual es, en sí mismo, información valiosa para el coach de cara al cierre. Las contradicciones no resueltas de sesiones anteriores no desaparecen por defecto del sistema: se listan explícitamente como parte del material que el coach debe abordar en la llamada final, incluso si varias semanas han pasado desde que se marcaron.

## El rol de la IA y el límite final

La IA ejecuta el seguimiento y genera el informe. No cierra el ciclo: ese cierre —la conversación final, la lectura emocional de lo que ha significado el proceso, y la conversación sobre el siguiente paso del embudo— pertenece exclusivamente al coach humano, en la última llamada del programa. El mensaje de cierre de la IA, por tanto, no debe sonar a final de programa de autoayuda ("¡enhorabuena, lo has conseguido!"). Debe sonar a lo que realmente es: la entrega de un informe preciso a la persona que va a tener, de aquí en adelante, la conversación que de verdad importa.
$th22$,
  exercise_content = $ex23$# Sesión 8 · Ejercicio práctico — Sistema de accountability y cierre

**Tiempo estimado:** 45 minutos.
**Formato de respuesta:** configuración (selección) + texto reflexivo + escala final.
**Objetivo de fase que ejecuta:** Fase 4, Acción (cierre) — instalar el seguimiento del plan y generar el material del informe final que cierra el programa.

## Paso 1 — Configura tu sistema de check-ins

Elige la frecuencia (semanal recomendada) y el canal preferido (texto o voz) para tus check-ins automáticos. Cada check-in te preguntará específicamente por el estado de tus hitos, con foco en el que marcaste como más difícil la semana pasada.

## Paso 2 — Reflexión de cierre (para el informe final)

Responde con honestidad, en texto o voz:

1. ¿Qué cambió entre la auditoría que escribiste en la Semana 1 y lo que piensas hoy?
2. ¿Qué parte de este proceso evitaste más, y qué hiciste con esa evitación cuando apareció?
3. ¿Qué temes que pase si no sostienes el plan que diseñaste la semana pasada?
4. Si algo quedó sin resolver en las semanas anteriores (tu coach puede haberlo mencionado), ¿cómo lo ves ahora?

## Cierre del ejercicio

Valora: **"Mi compromiso real con sostener este plan, del 1 al 10: ___"**. Justifica la cifra con una frase, no con una afirmación genérica de motivación.

## Qué recibes al terminar

Tu sistema de check-ins activado, y un informe final generado por la IA con el recorrido completo de las 8 semanas: tus valores, tu dirección y tu plan. Este informe es lo que tu coach usa para la última llamada del programa, donde se decide contigo el siguiente paso.
$ex23$,
  slides_content = $sl24$[{"title": "Portada", "bullets": ["Semana 8 · Sistema de accountability y cierre", "Fase 4: Acción (cierre del programa)", "\"¿Cuál es el primer paso real?\""], "note": null}, {"title": "Lo que no se mide no se sostiene", "bullets": ["Tu plan de la semana pasada necesita un sistema, no solo buena voluntad.", "Hoy lo configuramos."], "note": null}, {"title": "Check-ins semanales", "bullets": ["Automáticos, breves, centrados en tus hitos.", "Atención reforzada en el hito que marcaste como más difícil."], "note": null}, {"title": "Qué pasa si te quedas en silencio", "bullets": ["Una ausencia prolongada se escala a tu coach.", "No es vigilancia: es sostener lo que decidiste."], "note": null}, {"title": "Esta sesión mira hacia atrás", "bullets": ["Las siete anteriores construyeron una pieza cada una.", "Hoy las juntamos todas."], "note": null}, {"title": "Tu informe final", "bullets": ["No es un resumen motivacional.", "Es una síntesis fiel de 8 semanas de trabajo verificable."], "note": null}, {"title": "Qué contiene", "bullets": ["Tu auditoría · tu coste nombrado · tu valor de mayor gap", "Tu contraste de hoguera · tu dirección elegida · tu plan de hitos"], "note": "línea de tiempo visual de las 8 semanas."}, {"title": "Si quedó algo sin resolver", "bullets": ["Si hubo una contradicción marcada en semanas anteriores, no desaparece.", "Se nombra de nuevo aquí, para tu coach."], "note": null}, {"title": "El informe no es el pitch", "bullets": ["No hay un argumento de venta forzado.", "El trabajo hecho habla por sí mismo."], "note": null}, {"title": "El siguiente escalón", "bullets": ["1:1 continuado · Retiro en León · Ambos", "Tu coach lo decide contigo en la última llamada."], "note": null}, {"title": "Formato del ejercicio", "bullets": ["Configurar check-ins + reflexión de cierre.", "~45 minutos."], "note": null}, {"title": "El rol de la IA aquí", "bullets": ["Ejecuta el seguimiento y redacta el informe.", "No cierra el ciclo. Eso es de tu coach."], "note": null}, {"title": "Cierre", "bullets": ["Esta es la última sesión guiada por IA del programa.", "Lo que sigue, sigue siendo contigo y con una persona, no con un bot."], "note": null}]$sl24$::jsonb
WHERE week_number = 8;
