# Sesión 6 · Semana 6 · Módulo 3.2 — Filtro por restricciones reales

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
