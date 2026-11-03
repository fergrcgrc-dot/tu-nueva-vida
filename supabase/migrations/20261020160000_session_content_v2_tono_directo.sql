-- Reescritura del contenido de las 8 sesiones: tono directo ("tú a tú"),
-- español de España, sin jerga interna de diseño del programa.
-- Sustituye theory_content y exercise_content aplicados en
-- 20261019120000_session_content.sql. No toca slides_content: los slides
-- ahora se generan en NotebookLM a partir de contenido-programa/sesion-0X-slides-guion-v2.md.

-- Semana 1
UPDATE public.modules SET
  theory_content = $t1v2$# Semana 1 · Auditoría vital honesta

Hoy no vas a rellenar un formulario sobre tu vida. Vas a contar la verdad sobre ella, aunque no suene bien.

Es fácil responder "¿cómo estás?" con un resumen que queda decente: trabajo estable, pareja, algo de deporte cuando se puede. Esa respuesta no es mentira, pero tampoco es la respuesta completa. Debajo de ese resumen suele haber otra frase que no sueles decir en voz alta: *"llevo meses sintiendo que cada lunes es una pequeña muerte"*, o algo parecido, con tus propias palabras. Las dos frases pueden ser ciertas sobre la misma persona. Hoy solo nos interesa la segunda.

## Un inventario no es una confesión

Casi cualquiera puede hacer un inventario de su vida: cargo, salario, estado civil, cuántas veces a la semana hace deporte. Es cómodo porque es verificable y no compromete nada. No te vamos a pedir eso.

Te vamos a preguntar, en cuatro terrenos distintos, qué sientes de verdad respecto a lo que tienes — no qué tienes. Y vamos a pedirte el ejemplo concreto detrás de cada respuesta: la fecha, el momento, la frase exacta que te dijiste a ti mismo ese día. Si tu primera respuesta es general ("bien, cansado pero bien"), te vamos a pedir que la precises. No es que algo haya ido mal: es exactamente el ejercicio.

## Por qué hoy y no más adelante

Es tentador empezar por lo bonito: a dónde quieres llegar, qué versión de ti te gustaría ser. Aquí hacemos lo contrario a propósito. Todo lo que construyamos las próximas semanas — tus valores, tus opciones, tu plan — parte de lo que digas hoy. Si hoy suavizas la respuesta para que suene razonable, dentro de unas semanas vas a estar diseñando un plan para una vida que no es exactamente la que vives. Mejor evitarlo desde el principio.

## Los cuatro terrenos

Vamos a recorrer cuatro áreas: tu carrera, tu energía, tus relaciones y, en general, lo que no te acaba de encajar. No es casualidad que sean estas cuatro: son los sitios donde más fácil resulta explicarse a uno mismo por qué todo sigue igual — *"es una mala racha"*, *"todos los trabajos tienen días así"*, *"ahora mismo no tengo tiempo para los amigos"*. Hoy vamos a mirar cada una sin esa excusa delante.

Te vamos a hacer preguntas, y a partir de lo que respondas, te vamos a devolver el patrón que veamos — sin decirte qué hacer con él, sin decirte si está bien o mal. Solo para que lo veas con claridad. Si en algún punto aparece algo serio — no cansancio, sino una desesperanza que se sostiene en el tiempo — vamos a avisar a tu coach de inmediato, sin esperar a que termines la semana. Eso no es un fallo del proceso: es parte de él.

## Lo que significa "de verdad"

La pregunta de esta primera fase es "¿de dónde vienes, de verdad?" — y esa última palabra importa. La versión que sueles contar cuando alguien pregunta no es, casi nunca, el punto de partida real. El trabajo de hoy es la distancia entre esas dos versiones.

## Qué pasa con lo que cuentes

Nada de lo que escribas o digas hoy desaparece en el vacío. Si hay algo que tu coach debería saber antes de hablar contigo, lo va a saber. Y lo que cuentes hoy es también la base que usaremos la semana que viene, para que las preguntas dejen de ser genéricas y empiecen a ser, específicamente, las que a ti te cuesta responder.

No hace falta que te prepares nada. Solo que, durante los próximos 45 minutos, respondas lo que es verdad y no lo que suena mejor.
$t1v2$,
  exercise_content = $e1v2$# Semana 1 · Ejercicio — Auditoría vital honesta

**Tiempo:** 45–60 minutos, sin interrupciones.
**Cómo responder:** por escrito, o grabando tu voz si lo prefieres (lo transcribimos automáticamente). Al final, una valoración numérica.

## Antes de empezar

No hay respuesta correcta. Hay una sola regla: cuenta lo que es verdad, no lo que suena razonable. Si tu primera respuesta es general ("bien, cansado pero bien"), te vamos a pedir un ejemplo concreto — no porque algo haya fallado, sino porque ese es el ejercicio.

No edites tu respuesta para que quede mejor. No respondas pensando en que alguien más la va a leer. Si grabas tu voz, habla como lo harías si nadie más fuera a escucharlo.

## Carrera
*(✍️ escribe o 🎙️ graba tu voz)*

1. Describe un día normal de trabajo tal como es — no como lo cuentas cuando alguien pregunta.
2. ¿Cuándo fue la última vez que sentiste algo parecido a orgullo real por algo que hiciste? Pon fecha o momento aproximado.
3. ¿Qué parte de tu trabajo evitas mencionar cuando hablas de él con gente que no lo conoce?

## Energía
*(✍️ escribe o 🎙️ graba tu voz)*

4. En una semana normal, ¿en qué momento del día notas menos energía? ¿Desde cuándo es así?
5. ¿Qué haces hoy para recuperar energía que, si lo piensas bien, no te funciona realmente?

## Relaciones
*(✍️ escribe o 🎙️ graba tu voz)*

6. ¿A quién no le cuentas lo que de verdad piensas sobre tu situación actual? ¿Por qué a esa persona en concreto?
7. ¿Qué relación de tu vida actual sostienes más por costumbre que por elección?

## Lo que no te acaba de encajar
*(✍️ escribe o 🎙️ graba tu voz)*

8. Si tuvieras que nombrar una sola cosa que llevas tiempo evitando hablar contigo mismo, ¿cuál sería?
9. ¿Qué parte de tu vida defenderías en voz alta aunque, en privado, no estés tan seguro?

## Para cerrar
*(✍️ solo escrito, es una cifra)*

**"Hoy, mi nivel de energía vital en general es de 1 a 10: ___"**
No le des más de cinco segundos a la respuesta.

## Qué recibes al terminar

Un resumen breve con los temas que han salido, sin juicios ni consejos. Un resumen algo más detallado queda guardado para tu coach, por si hace falta tenerlo en cuenta antes de vuestra próxima llamada.
$e1v2$
WHERE week_number = 1;

-- Semana 2
UPDATE public.modules SET
  theory_content = $t2v2$# Semana 2 · El coste de no cambiar

La semana pasada nombraste, sin suavizarlo, dónde estás. Hoy vamos a hacer algo más incómodo todavía: vamos a ponerle una cara a lo que pasa si nada de eso cambia.

No vamos a imaginar dónde te gustaría estar dentro de cinco años. Eso es fácil y, la verdad, no sirve de mucho: casi todo el mundo sabe describir una vida ideal sin que eso le acerque un milímetro a conseguirla. Vamos a hacer justo lo contrario: vas a describir un día cualquiera dentro de cinco años si simplemente sigues la inercia de hoy. Sin cambios, sin propósitos de año nuevo, sin que nada de lo que nombraste la semana pasada se haya movido.

## Por qué incomoda a propósito

Una visualización bonita genera buenas sensaciones, pero rara vez mueve a nadie a actuar. Lo que de verdad empuja a decidir es ver con claridad lo que cuesta no decidir. Hoy el coste deja de ser una sensación difusa de "algo no va bien" y se convierte en algo concreto: una mañana, una conversación, una frase que te dices antes de dormir.

Vamos a partir de lo que tú mismo contaste la semana pasada. Si hablaste de un trabajo que te pesa, la proyección de hoy pasa por ahí. Si mencionaste una relación que sostienes por costumbre, también. No es un ejercicio genérico: es la continuación directa de lo que ya empezaste a contar.

## Tres formas de medir el coste

Al final, vas a poner una cifra a tres cosas distintas: cuánto te afecta emocionalmente imaginarlo, qué le pasa a tus relaciones en ese escenario, y si la persona que acabas de describir todavía se siente "tú". Son tres preguntas distintas a propósito — "sería triste" no es una respuesta completa. A veces, al separarlas, aparece algo revelador: puede que el coste emocional te parezca alto, pero el identitario lo minimices sin darte cuenta. Eso, si ocurre, merece la pena mirarlo con más calma.

## Lo que no vamos a hacer

No vamos a añadir dramatismo que tú no hayas puesto, pero tampoco lo vamos a quitar si aparece. Si al escribir esto sientes algo que va más allá del malestar — una sensación de que no hay salida, no solo de que las cosas están mal — dilo con esas palabras. No esperamos a que termine la semana para avisar a tu coach: en ese caso, hablamos con él de inmediato.

## Cómo cierra esta semana

Esta sesión cierra la primera fase del programa. Tienes una llamada con tu coach esta semana, y no es para analizar nada más: es para sostener lo que estas dos semanas han removido. Lo que escribas hoy es, literalmente, lo que tu coach va a tener delante antes de hablar contigo.

A partir de la semana que viene dejamos de mirar hacia atrás y empezamos a preguntarnos qué es importante de verdad. Pero esa pregunta solo tiene sentido si antes le has puesto un precio real a seguir igual — que es, exactamente, lo que vas a hacer hoy.
$t2v2$,
  exercise_content = $e2v2$# Semana 2 · Ejercicio — El coste de no cambiar

**Tiempo:** 45 minutos.
**Cómo responder:** por escrito (te va a resultar más fácil releerlo después), o grabando tu voz si lo prefieres.

## Antes de empezar

Antes de nada, vamos a recordarte dos o tres cosas que contaste la semana pasada. Con eso en mente, vas a escribir, en primera persona y en presente, un día cualquiera dentro de cinco años **si nada de lo que nombraste entonces cambia**. No es pesimismo gratuito: es seguir el hilo de lo que tú mismo ya identificaste. Sé concreto — la hora, el lugar, con quién estás, qué sientes.

## La proyección
*(✍️ escribe o 🎙️ graba tu voz)*

1. Describe una mañana cualquiera dentro de cinco años, si el patrón de tu carrera que nombraste la semana pasada simplemente continúa.
2. Describe cómo te sientes físicamente un día normal, si tu nivel de energía no ha cambiado.
3. Describe una conversación — o la ausencia de ella — con la persona que mencionaste la semana pasada, en esas mismas condiciones.
4. Escribe la frase que te dirías a ti mismo esa noche, al acostarte.

## Pon una cifra al coste
*(✍️ escribe o 🎙️ graba tu voz, pero necesitamos la cifra por escrito)*

Valora cada cosa del 1 al 10, con una frase breve que explique el número:

- **Coste emocional**: "Imaginar esto me afecta emocionalmente en un grado de ___ / 10."
- **Coste relacional**: "El impacto en mis relaciones, en ese escenario, es de ___ / 10."
- **Coste identitario**: "Sentir que esa persona de dentro de cinco años sigue siendo yo, o no, me produce un impacto de ___ / 10."

## Qué recibes al terminar

Un resumen breve de lo que has escrito, sin interpretación añadida. La versión más completa —con cualquier contraste entre lo que dijiste la semana pasada y lo que acabas de describir— se incorpora al informe que tu coach revisa antes de la llamada de esta semana.
$e2v2$
WHERE week_number = 2;

-- Semana 3
UPDATE public.modules SET
  theory_content = $t3v2$# Semana 3 · Mapa de valores

Las dos semanas anteriores han sido de mirar hacia atrás, sin editar. Esta semana cambia la pregunta: ya no es de dónde vienes, sino qué es importante de verdad para ti.

Casi cualquiera puede nombrar cinco valores sin pensarlo mucho: familia, salud, honestidad, libertad, crecimiento. Esa lista, sola, no dice gran cosa — son, en buena parte, los valores que "se supone" que hay que tener. Lo que de verdad importa no es la lista. Es cuánto de tu vida, de tu tiempo y de tus decisiones reales está efectivamente alineado con ella.

## La distancia es el dato

Vas a elegir cinco valores y ordenarlos por prioridad. Después, vas a valorar, también del uno al diez, cuánta atención real recibe hoy cada uno. La diferencia entre lo que priorizas y lo que atiendes es lo que llamamos el gap — y no hace falta ninguna interpretación complicada para calcularlo. Solo hace falta que seas honesto al escribirlo, que es justo lo que llevas dos semanas entrenando.

Un gap alto no es un fallo tuyo ni un juicio sobre quién eres. Es, simplemente, una forma de poner en números algo que probablemente ya sentías de manera difusa. No tienes que arreglarlo hoy. Solo nombrarlo con precisión.

## Por qué no empezamos por aquí

Si te hubiéramos pedido esta lista en la primera semana, probablemente habría salido una lista aspiracional — lo que crees que deberías priorizar, no lo que de verdad organiza tus decisiones. Después de dos semanas siendo honesto sobre dónde estás y lo que te cuesta seguir igual, este ranking parte de otro sitio. Ya no es una lista en abstracto: tiene detrás material real.

## Qué te vamos a pedir

Por cada valor, una frase que empiece por "sé que valoro esto porque..." con un ejemplo concreto y reciente — no una afirmación general del tipo "la familia es lo más importante". Si tu justificación es demasiado general, te lo vamos a preguntar una vez más. Si sigue siendo general, no insistimos: también es información.

## Lo que esta semana deja preparado

El valor con mayor gap es el dato que vamos a usar la semana que viene, cuando hablemos de tu mejor versión. Por eso hoy no hace falta que resuelvas nada — solo que el número salga lo más honesto posible.
$t3v2$,
  exercise_content = $e3v2$# Semana 3 · Ejercicio — Mapa de valores

**Tiempo:** 40 minutos.
**Cómo responder:** selección y escalas, con una frase breve de justificación por escrito (o grabada en voz) en cada valor.

## Antes de empezar

Vamos a recordarte dos o tres cosas de las que hablaste en las semanas 1 y 2, donde detectamos más carga emocional. Tenlas presentes, pero no te limites a ellas: elige con libertad.

## Paso 1 — Elige y ordena
*(✍️ escribe o 🎙️ graba tu voz la justificación de cada valor)*

Elige **5 valores** que consideres centrales en tu vida. Ordénalos del 1 (más prioritario) al 5 (menos prioritario). Para cada uno, completa: "sé que valoro esto porque..." con un ejemplo concreto y reciente — no una afirmación general.

## Paso 2 — ¿Cuánta atención real recibe hoy?
*(✍️ escribe o 🎙️ graba tu voz)*

Para cada uno de los 5 valores: **"Hoy, la atención real que le doy a este valor es de 1 a 10: ___"**. Justifica con un ejemplo concreto de la última semana, no con una impresión general.

## Paso 3 — Revisa el resultado
*(✍️ solo lectura, no hace falta escribir nada aquí)*

Vamos a calcular la diferencia entre tu prioridad y tu atención real en cada valor, y te mostramos cuál tiene la mayor distancia. No hace falta que lo arregles ni que lo expliques todavía — solo que confirmes si el cálculo refleja bien tu situación, o lo matices si no.

## Qué recibes al terminar

Tu mapa de valores completo, con las cinco distancias calculadas y cuál es la mayor. Es el dato que vas a trabajar en profundidad la próxima semana.
$e3v2$
WHERE week_number = 3;

-- Semana 4
UPDATE public.modules SET
  theory_content = $t4v2$# Semana 4 · Tu hoguera personal

"¿Qué representas, en tu mejor versión, para las personas que te rodean?" Es una pregunta fácil de responder — y esa facilidad es precisamente lo que vamos a poner a prueba hoy.

Casi cualquiera puede describir su mejor versión con soltura: alguien en quien confían, alguien que inspira, alguien fiable. Son frases bonitas y, muchas veces, poco verificadas. Hoy no basta con la frase bonita: vamos a cruzarla contra algo muy concreto — el valor que la semana pasada identificaste como el más desatendido en tu vida.

## La pregunta real

No es "qué representas". Es: ¿esa mejor versión de ti vive de verdad ese valor que tú mismo señalaste como el más desatendido, o es precisamente esa versión idealizada la que te permite seguir sin atenderlo?

Por ejemplo: si describes que inspiras a tu equipo con tu disponibilidad total, y tu valor con mayor distancia es "tiempo con tu familia", con una atención real de 3 sobre 10 — ¿dónde está ese valor en la versión de ti que acabas de describir? Esta pregunta solo tiene sentido porque ya existe un dato concreto detrás, no una intuición vaga.

## Por qué no antes

Hacer este ejercicio sin el mapa de valores de la semana pasada habría dado, con toda probabilidad, una autodescripción halagadora sin ningún punto de contraste real. Ahora sí lo hay.

## Lo que te vamos a pedir

Vas a describir tu mejor versión con un ejemplo concreto y reciente, no con adjetivos sueltos. Después, qué le daría esa versión a alguien cercano en particular, no "a la gente" en abstracto. Y por último, la pregunta directa: ¿dónde está vivo tu valor de mayor distancia en esta versión de ti? ¿Y dónde, específicamente, no está? Si solo respondes a la primera mitad, te la vamos a repetir pidiéndote la segunda.

Si reconoces la discrepancia sin rodeos, no te vamos a felicitar por ser honesto — simplemente lo registramos y seguimos. No es el momento de celebrar ni de resolverlo: es el momento de nombrarlo con precisión.

## Tu llamada de esta semana

Esta sesión cierra la segunda fase del programa, y tu llamada de esta semana trabaja exactamente este contraste. Resolver una contradicción como esta no es trabajo para un ejercicio escrito: necesita una conversación real, con matices, con alguien que pueda sostenerla contigo. Lo que hagas hoy es la materia prima de esa conversación.

A partir de la semana que viene dejamos la claridad y entramos en diseño: ya no se trata de nombrar qué importa, sino de generar opciones que no eviten, precisamente, lo que hoy has puesto sobre la mesa.
$t4v2$,
  exercise_content = $e4v2$# Semana 4 · Ejercicio — Tu hoguera personal

**Tiempo:** 40–45 minutos.
**Cómo responder:** por escrito o grabando tu voz. Al cierre, una escala numérica.

## Antes de empezar

Te vamos a recordar tu valor con mayor distancia de la semana pasada. Tenlo presente durante todo el ejercicio: lo vas a necesitar en la última parte.

## Paso 1 — Tu mejor versión
*(✍️ escribe o 🎙️ graba tu voz)*

Describe, con el mayor detalle posible, qué representas para las personas que te rodean cuando estás en tu mejor momento. No te quedes en adjetivos ("soy generoso, soy fiable"): describe una situación concreta y reciente donde esa versión de ti se mostró.

## Paso 2 — El impacto
*(✍️ escribe o 🎙️ graba tu voz)*

¿Qué le daría esa versión de ti a alguien cercano, si tuvieras que nombrarlo con precisión? Piensa en una persona concreta, no en "la gente" en general.

## Paso 3 — El cruce directo (es obligatorio responder las dos partes)
*(✍️ escribe o 🎙️ graba tu voz)*

**¿Dónde está vivo tu valor de mayor distancia en la versión de ti que acabas de describir? ¿Y dónde, específicamente, no está?**

No vale responder solo a la primera mitad. Si te cuesta encontrar dónde no está, ese es exactamente el dato que necesitamos hoy.

## Para cerrar
*(✍️ solo escrito, es una cifra)*

**"Qué tan parecida es la versión de mí que acabo de describir a mi vida real de hoy, del 1 al 10: ___"**. Justifica la cifra en una frase.

## Qué recibes al terminar

Un resumen del contraste entre tu autoimagen y tu valor de mayor distancia, que se incorpora directamente al informe que tu coach revisa antes de la llamada de esta semana — la que cierra esta fase del programa.
$e4v2$
WHERE week_number = 4;

-- Semana 5
UPDATE public.modules SET
  theory_content = $t5v2$# Semana 5 · Generación de opciones

Hoy cambia por completo el tipo de trabajo. Las cuatro semanas anteriores han sido de mirar hacia dentro. Esta es la primera de diseñar hacia fuera: empezamos a preguntarnos hacia dónde.

## El error más habitual

Cuando alguien se pregunta "¿qué dirección tomo?", casi siempre está decidiendo y generando ideas al mismo tiempo, sin darse cuenta. Cada ocurrencia pasa, al instante, por el filtro de "¿es esto razonable?", "¿puedo permitírmelo?", "¿qué pensarían...?". El resultado casi siempre es una lista corta, prudente, y sorprendentemente parecida a lo que ya estás haciendo.

Hoy vamos a separar las dos cosas a propósito: primero cantidad, después filtro. El filtro llega la semana que viene, con sus propias reglas. Hoy está prohibido evaluar si una opción es viable o razonable. Solo generar.

## La palabra que vamos a vigilar

Si al escribir una opción aparece un "pero" seguido de una razón por la que no sería posible — "podría cambiar de sector, pero no es realista" —, nos vamos a quedar solo con la primera parte. Ese "pero" no es un error tuyo: es información valiosa sobre dónde está operando el miedo, antes incluso de llegar al filtro de la semana que viene. Si aparece, simplemente reformula la idea sin la segunda mitad.

## Tu criterio de hoy

Ten presente tu valor con mayor distancia, el que trabajaste hace dos semanas. No tienes que limitarte a él, pero al menos parte de tus opciones deberían atacarlo directamente. Al final, vas a marcar, opción por opción, si crees que esa dirección lo ataca o no. No te preocupes si la mayoría son "no": también es información.

## Nuestro papel aquí

Podemos proponerte categorías o ángulos que no hayas considerado — cambio de sector, cambio de modalidad, redefinir tu rol actual, cambiar de geografía, cambiar tu relación con el trabajo en sí — pero no te vamos a sugerir cuál deberías elegir. Esa decisión, y el miedo que trae consigo, es trabajo para tu coach, no para hoy.

## Lo que esta semana no resuelve

No vas a elegir dirección esta semana. Vas a construir el universo de opciones sobre el que, la semana que viene, aplicaremos un filtro de restricciones reales — y ahí sí veremos cuáles sobreviven de verdad.
$t5v2$,
  exercise_content = $e5v2$# Semana 5 · Ejercicio — Generación de opciones

**Tiempo:** 40 minutos.
**Cómo responder:** lista por escrito, o grabando tu voz e indicando cada opción por separado.

## Antes de empezar

Una sola regla: nada de "pero". Si al escribir una opción aparece esa palabra seguida de una razón para descartarla, borra la segunda parte y deja solo la opción. Hoy no se evalúa viabilidad.

Te vamos a recordar tu valor con mayor distancia de la semana 4. No tienes que limitarte a él, pero al menos algunas de tus opciones deberían abordarlo directamente.

## Tu lista
*(✍️ escribe o 🎙️ graba tu voz, opción por opción)*

Escribe **al menos 15 direcciones posibles** para tu vida o tu carrera en los próximos años. Pueden ser amplias o muy específicas. Algunas categorías por si te atascas (no hace falta cubrirlas todas):

- Cambios dentro de tu sector actual
- Cambio completo de sector
- Cambio de modalidad (freelance, reducción de jornada, montar algo propio...)
- Redefinir tu rol actual sin cambiar de empresa
- Cambios de geografía
- Cambios en tu relación con el trabajo en sí — no qué haces, sino cuánto espacio ocupa en tu vida

Si te quedas en blanco, escribe literalmente la opción que más miedo te da nombrar. No tienes que comprometerte con ella, solo escribirla.

## Marca tu lista
*(✍️ marca sí/no junto a cada opción)*

Repasa lo que has escrito y marca, opción por opción, si crees que **atacaría directamente** tu valor de mayor distancia. No te preocupes si la mayoría son "no".

## Qué recibes al terminar

Tu listado completo, con las opciones marcadas. La semana que viene, este mismo listado pasa por un filtro de restricciones reales.
$e5v2$
WHERE week_number = 5;

-- Semana 6
UPDATE public.modules SET
  theory_content = $t6v2$# Semana 6 · Filtro por restricciones reales

A primera vista, hoy parece un ejercicio mecánico: elegir dos o tres restricciones innegociables y aplicarlas a tu lista de la semana pasada para ver qué sobrevive. Pero el verdadero trabajo no es aplicar el filtro — es examinar si esas restricciones son límites reales, o es el mismo miedo de la semana pasada reapareciendo con un nombre más respetable.

## Restricción real frente a restricción-excusa

Una restricción real impone un límite verificable: "tengo una hipoteca que exige unos ingresos mínimos durante los próximos tres años". Una restricción-excusa suena igual de razonable, pero casi siempre elimina justo las opciones que la semana pasada marcaste como las que sí atacaban tu valor de mayor distancia.

Esta distinción importa de verdad. Es el punto exacto donde todo este proceso podría convertirse en una versión más sofisticada de "sigo haciendo lo mismo, pero ahora con vocabulario de autoconocimiento". Por eso no aceptamos el filtro sin más: lo examinamos contigo.

## Por qué el filtro va después y no antes

Si hubiéramos pedido tus restricciones antes de generar la lista amplia, habrían contaminado la generación desde el principio — igual que hacía el "pero" la semana pasada. Al invertir el orden, tenemos dos datos independientes que podemos cruzar: qué opciones existen en abstracto, y cuáles sobreviven a los límites reales de tu vida. Si las dos coinciden exactamente con lo que ya sospechabas que ibas a elegir, merece la pena preguntarse si el filtro se ha construido para justificar una decisión tomada por miedo.

## Cómo lo revisamos

No decidimos nosotros si una restricción es real o es excusa. La cruzamos con cosas que ya dijiste antes — por ejemplo, si marcas "geografía" como restricción ("no puedo cambiar de ciudad") pero en la semana 2 declaraste un coste emocional alto asociado precisamente a quedarte donde estás, señalamos esa tensión para que la hables con tu coach. No te decimos "esto no es real, es miedo".

## Lo que más importa hoy

Si, tras aplicar tus restricciones, ninguna de las opciones ancladas a tu valor de mayor distancia sobrevive, eso no es un resultado neutro. Es el tema central de tu llamada de esta semana — no uno más entre varios. Has llegado, con tus propias reglas, a un resultado que elimina sistemáticamente la posibilidad de atender lo que tú mismo identificaste, hace dos semanas, como lo más desatendido de tu vida. Nombrarlo con precisión, sin resolverlo todavía, es lo que permite que la siguiente fase empiece con un plan construido sobre una dirección real.

## Tu llamada de esta semana

Esta sesión cierra la fase de Diseño. Tu coach te ayuda esta semana a comprometerte con una dirección y a gestionar el miedo de decidir — no es un trámite, es cerrar puertas de verdad, y eso necesita acompañamiento.
$t6v2$,
  exercise_content = $e6v2$# Semana 6 · Ejercicio — Filtro por restricciones reales

**Tiempo:** 45 minutos.
**Cómo responder:** selección + una frase de justificación por cada eliminación (escrita o en voz) + una escala final.

## Antes de empezar

Te vamos a mostrar de nuevo tu lista completa de la semana pasada, con las opciones que marcaste como ancladas a tu valor de mayor distancia destacadas.

## Paso 1 — Define tus restricciones innegociables
*(✍️ escribe o 🎙️ graba tu voz)*

Elige entre **2 y 3** restricciones reales de tu vida actual: tiempo, dinero, familia, geografía, u otra. Para cada una, escribe el límite concreto y verificable que impone — no una sensación general de dificultad.

## Paso 2 — Aplica el filtro
*(✍️ marca sobrevive/no sobrevive y justifica en una frase)*

Revisa cada opción de tu lista de la semana pasada y marca si **sobrevive o no sobrevive** a tus restricciones. Para cada una que elimines, una frase explicando por qué.

## Paso 3 — ¿Son restricciones reales?
*(✍️ solo escrito, es una cifra)*

Valora: **"Qué tan seguro estoy de que estas restricciones son límites reales y no miedo con otro nombre, del 1 al 10: ___"**. Justifica brevemente.

## Paso 4 — Tu dirección provisional
*(✍️ escribe o 🎙️ graba tu voz)*

De las opciones que sobreviven, elige la que sientas con más claridad como tu dirección. No tiene que ser definitiva — se confirma en tu llamada con el coach esta semana.

## Qué recibes al terminar

Tu lista filtrada completa, tu dirección provisional, y si corresponde, una nota si alguna de tus restricciones podría estar funcionando como excusa. Todo esto se incorpora al informe que tu coach revisa antes de tu llamada de esta semana, la de comprometerte con una dirección.
$e6v2$
WHERE week_number = 6;

-- Semana 7
UPDATE public.modules SET
  theory_content = $t7v2$# Semana 7 · Plan a 90 días

Tu dirección ya está decidida. La comprometiste con tu coach la semana pasada, y hoy no la volvemos a poner en duda. La pregunta de hoy no es "hacia dónde", sino con qué paso concreto, verificable y con fecha empiezas a ejecutarla.

## La diferencia entre una intención y un hito

"Quiero dedicar más tiempo a explorar un cambio de sector" es una intención. "El 15 de noviembre habré enviado mi currículum actualizado a tres empresas del sector, y lo sabré porque tendré las tres confirmaciones de envío" es un hito. La diferencia no es de ambición: es de si se puede verificar. Una intención puede sostenerse indefinidamente sin que nadie, ni siquiera tú, sepa con certeza si se ha cumplido. Un hito tiene fecha y un criterio tan concreto que la pregunta "¿se cumplió o no?" se responde con un sí o un no, sin margen de interpretación.

Hoy cada hito de tu plan tiene que pasar esa prueba. No se trata de que seas más ambicioso, sino más preciso. Un plan hecho de intenciones bien escritas es, en la práctica, como no tener plan: da sensación de avance sin forma de comprobarlo, y eso hace que un estancamiento se vuelva invisible hasta que ya ha pasado demasiado tiempo.

## Por qué no antes

Un plan a 90 días escrito antes de tener una dirección clara y comprometida sería, en el mejor de los casos, un plan genérico de productividad, desconectado de las seis semanas anteriores. Cada hito que escribas hoy se contrasta contra tu dirección elegida, no contra una aspiración vaga de "mejorar" o "avanzar". Si un hito no tiene relación clara con esa dirección, no vale para este plan, por razonable que suene por sí solo.

## El hito más difícil

Además de los hitos, te vamos a pedir que identifiques cuál te va a costar más sostener, y por qué. No es un dato anecdótico: suele ser el mejor indicador de dónde va a aparecer el primer bloqueo real. Nombrarlo ahora, antes de que ocurra, hace que el sistema de seguimiento de la semana que viene le preste atención especial, en lugar de tratarlo igual que a los demás.

## Nuestro papel aquí

No diseñamos el plan por ti ni te proponemos hitos para que los aceptes. Revisamos si cada uno cumple el criterio de ser verificable, y te lo devolvemos si sigue siendo, en el fondo, una intención disfrazada. Y contrastamos cada hito contra tu dirección elegida, para detectar si alguno, aunque bien escrito, en realidad ejecuta una versión más cómoda de esa dirección y no la dirección en sí.

## Lo que significa "real" aquí

La palabra "real" cumple hoy la misma función que "de verdad" en las semanas anteriores: separa el paso que se puede comprobar del que suena bien en una conversación pero no se sostiene. Este plan no es una lista de buenas intenciones para cerrar el proceso con una sensación agradable. Son hitos que cualquiera, sin conocerte, podría verificar como cumplidos o no con solo mirar la fecha y el criterio. Esa precisión es lo que necesita la semana que viene para hacer un seguimiento de verdad.
$t7v2$,
  exercise_content = $e7v2$# Semana 7 · Ejercicio — Plan a 90 días

**Tiempo:** 45–50 minutos.
**Cómo responder:** campos por escrito para cada hito, y una escala final.

## Antes de empezar

Te vamos a recordar tu dirección elegida, tal como quedó confirmada en tu llamada de la semana pasada. Todo lo que escribas aquí tiene que ejecutar esa dirección, no una versión alternativa o más cómoda de ella.

## Define entre 3 y 5 hitos
*(✍️ por escrito, campo a campo)*

Para cada hito, completa:

1. **Hito**: la acción o resultado concreto.
2. **Fecha objetivo**: dentro de los próximos 90 días.
3. **Criterio de cumplimiento**: cómo vas a saber, sin ambigüedad, que está cumplido (debe responderse con sí o no, no con "más o menos").

Si un hito no tiene un criterio claro, te lo vamos a devolver para que lo precises antes de seguir.

## El hito más difícil
*(✍️ escribe o 🎙️ graba tu voz)*

De los hitos que has escrito, señala cuál sientes que te va a costar más sostener, y en una frase, por qué.

## Para cerrar
*(✍️ solo escrito, es una cifra)*

Valora: **"Mi confianza en cumplir este plan tal como está escrito, del 1 al 10: ___"**. Si la cifra es baja, añade una frase con qué parte del plan es la que menos confianza te da.

## Qué recibes al terminar

Tu plan completo, con la confirmación de que cada hito es medible y se alinea con tu dirección elegida. Este plan es exactamente lo que vas a usar la semana que viene para configurar tu seguimiento.
$e7v2$
WHERE week_number = 7;

-- Semana 8
UPDATE public.modules SET
  theory_content = $t8v2$# Semana 8 · Sistema de seguimiento y cierre

Hoy no vamos a trabajar un fragmento nuevo. Vamos a recorrer las siete semanas anteriores en conjunto, y a dejar instalado lo que necesitas para que tu plan no se quede en un documento bien escrito.

## Lo que no se mide no se sostiene

Un plan a 90 días sin ningún seguimiento es, en la práctica, una intención con fecha de caducidad disfrazada de plan. Hoy configuramos los check-ins semanales que lo mantienen vivo: cada semana te preguntamos por el estado de tus hitos, con atención especial en el que tú mismo marcaste como el más difícil. Si en algún check-in aparece una señal de bloqueo o de abandono, se la hacemos saber a tu coach — igual que con cualquier otra señal del programa, aunque aquí el papel de tu coach ya no es ayudarte a decidir una dirección, sino ayudarte a sostenerla.

## Tu informe final

Lo que vas a recibir hoy no es un resumen motivacional del tipo "mira todo lo que has logrado". Es una síntesis fiel y verificable de ocho semanas de trabajo: la auditoría honesta de la primera semana, el coste que nombraste en la segunda, el valor con mayor distancia de la tercera, el contraste de tu hoguera personal —resuelto o no— de la cuarta, el universo de opciones y el filtro de las semanas cinco y seis, y el plan concreto de la séptima. Cuando ese recorrido se presenta con esta precisión, lo que venga después —seguir con tu coach, un retiro presencial, o ambos— no necesita convencerte de nada: se desprende solo de lo que tú mismo has construido.

## Si algo quedó sin resolver

Si en la semana 4 o en la semana 6 quedó alguna tensión sin resolver, hoy no asumimos que el tiempo la ha resuelto sola. La nombramos de nuevo, con la misma claridad, para que tu coach la tenga presente en vuestra última llamada.

## Lo que te vamos a pedir

Vas a configurar la frecuencia de tus check-ins, y vas a responder, con honestidad, unas preguntas de cierre: qué cambió entre la auditoría de la primera semana y lo que piensas hoy, qué parte del proceso evitaste más, qué temes que pase si no sostienes el plan, y cómo ves ahora cualquier tensión que quedara pendiente.

## Cómo termina esto

Este es el último tramo guiado por IA del programa. No te vamos a decir "enhorabuena, lo has conseguido" — eso suena a cierre de programa de autoayuda, y esto no lo es. Lo que recibes es un informe preciso, para la persona con la que vas a tener, de aquí en adelante, la conversación que de verdad importa: tu coach, en vuestra última llamada.
$t8v2$,
  exercise_content = $e8v2$# Semana 8 · Ejercicio — Sistema de seguimiento y cierre

**Tiempo:** 45 minutos.
**Cómo responder:** configuración + reflexión por escrito o en voz + una escala final.

## Paso 1 — Configura tus check-ins
*(✍️ selección)*

Elige la frecuencia (semanal, recomendada) y el canal que prefieras (texto o voz) para tus check-ins automáticos. Cada uno te va a preguntar por el estado de tus hitos, con foco en el que marcaste como más difícil la semana pasada.

## Paso 2 — Reflexión de cierre
*(✍️ escribe o 🎙️ graba tu voz)*

Responde con honestidad:

1. ¿Qué cambió entre la auditoría que escribiste en la semana 1 y lo que piensas hoy?
2. ¿Qué parte de este proceso evitaste más, y qué hiciste cuando apareció esa evitación?
3. ¿Qué temes que pase si no sostienes el plan que diseñaste la semana pasada?
4. Si algo quedó sin resolver en semanas anteriores, ¿cómo lo ves ahora?

## Para cerrar
*(✍️ solo escrito, es una cifra)*

Valora: **"Mi compromiso real con sostener este plan, del 1 al 10: ___"**. Justifica la cifra con una frase concreta, no con una afirmación genérica de motivación.

## Qué recibes al terminar

Tu sistema de check-ins activado, y un informe final con todo tu recorrido de las 8 semanas: tus valores, tu dirección y tu plan. Es lo que tu coach va a usar en la última llamada del programa, donde decidís juntos el siguiente paso.
$e8v2$
WHERE week_number = 8;

