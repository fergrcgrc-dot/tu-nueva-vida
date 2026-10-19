# Sesión 6 · Evaluación del bot al cierre

## Lectura previa obligatoria
El bot lee `opciones_generadas`, `opciones_ancladas_a_valor_mayor_gap` y `señal_autocensura_detectada` de la Sesión 5, además de `coste_emocional_declarado`, `coste_relacional_declarado` y `coste_identitario_declarado` de la Sesión 2, para cruzarlos contra las restricciones que el usuario declare hoy.

## Patrones a extraer de la respuesta
- **Especificidad de la restricción**: límite verificable y concreto frente a formulación vaga que podría aplicarse a casi cualquier decisión incómoda.
- **Correlación restricción–eliminación del gap**: si las restricciones declaradas eliminan sistemáticamente las opciones marcadas como ancladas al valor de mayor gap, mientras dejan intactas opciones cosméticas o de bajo riesgo.
- **Tensión con datos previos**: coincidencia entre la restricción declarada y un coste emocional/relacional/identitario alto asociado precisamente a esa misma área en la Sesión 2 (señal de racionalización).
- **Confianza baja declarada en el Paso 3**: si el propio usuario puntúa baja su confianza en que la restricción es real, esto refuerza cualquier otra señal de restricción-excusa.

## Campos que añade o actualiza (perfil acumulado)
`restricciones_no_negociables`, `opciones_filtradas`, `opcion_superviviente`, `restriccion_usada_como_excusa` (calculado), `señal_contradiccion_no_resuelta_s6`, `direccion_elegida` (provisional), `resumen_fase3_cierre`, `ultima_sesion_completada = 6`.

## Triggers de escalado aplicados a esta sesión

1. **Lenguaje de crisis o desesperanza** — Monitorizado como siempre, con atención particular si el usuario expresa fatalismo sobre no tener ninguna opción real tras el filtro ("total, no hay nada que pueda hacer de verdad").
2. **Bloqueo repetido** — Se activa si el usuario no logra comprometerse con ninguna restricción concreta (listas vagas o cambiantes repetidas dos veces), o dice no poder elegir ninguna opción superviviente pese a tener el filtro completo.
3. **Inactividad** — Criterio estándar.
4. **Contradicción no resuelta** — Trigger central de este módulo. Se activa con fuerza máxima si, tras aplicar el filtro, **ninguna** opción anclada al valor de mayor gap sobrevive, especialmente si además `restriccion_usada_como_excusa` es alta. Esto se marca como tema prioritario explícito —no uno más entre varios— del checkpoint de fin de semana 6, con la cita literal de las justificaciones de eliminación incluida en el resumen para el coach.

## Tono del bot
El bot presenta la tensión detectada como una pregunta abierta, nunca como una acusación: "has puesto 'geografía' como límite no negociable. Hace cinco semanas dijiste que quedarte donde estás tiene un coste emocional alto para ti. ¿Quieres revisar esto, o lo dejamos tal cual para hablarlo con tu coach?". No insiste más de una vez ni intenta convencer al usuario de que cambie su restricción. Su trabajo termina en nombrar la tensión con precisión y dejarla registrada; la conversación de fondo, incluyendo gestionar el miedo a decidir, es explícitamente del coach humano, no del bot.
