# Sesión 4 · Evaluación del bot al cierre

## Lectura previa obligatoria
El bot lee `valor_mayor_gap` y `valores_priorizados` de la Sesión 3 y los usa explícitamente para formular la pregunta de cruce del Paso 3 del ejercicio. No se generan preguntas de "mejor versión" sin anclar esa pregunta al gap ya calculado.

## Patrones a extraer de la respuesta
- **Concreción vs. abstracción** en la descripción de la mejor versión: situación real y reciente frente a adjetivos genéricos sin anclaje.
- **Evitación del cruce directo**: respuestas que abordan "dónde está vivo" el valor pero rodean o ignoran "dónde no está".
- **Reconocimiento explícito de la discrepancia**: si el usuario nombra sin rodeos que su mejor versión no vive el valor de mayor gap, esto se registra como contradicción reconocida (distinto de no resuelta).
- **Compensación narrativa**: lenguaje que intenta justificar la ausencia del valor como una virtud ("no tengo tiempo para mi familia porque estoy entregado a mi equipo, y eso también es un valor").

## Campos que añade o actualiza (perfil acumulado)
`version_mejor_yo_descrita`, `impacto_declarado_en_otros`, `coherencia_valores_vs_hoguera` (calculado), `contradiccion_valores_vida`, `señal_contradiccion_no_resuelta_s4`, `resumen_fase2_cierre`, `ultima_sesion_completada = 4`.

## Triggers de escalado aplicados a esta sesión

1. **Lenguaje de crisis o desesperanza** — Monitorizado como siempre, con especial atención si el reconocimiento de la discrepancia viene acompañado de lenguaje de fracaso identitario severo ("entonces no soy quien creía ser", llevado a un extremo de desesperanza y no de reflexión).
2. **Bloqueo repetido** — Se activa si el usuario evita sistemáticamente el Paso 3 (el cruce directo) tras la repregunta, respondiendo solo a la mitad cómoda de la pregunta dos veces o más.
3. **Inactividad** — Igual criterio que en sesiones anteriores.
4. **Contradicción no resuelta** — Este es el trigger central del módulo. Se activa cuando `contradiccion_valores_vida` es alta y el usuario no la reconoce explícitamente pese a la pregunta directa del Paso 3, o la reconoce verbalmente pero la neutraliza con una justificación compensatoria. Activa aviso explícito al coach como tema prioritario del checkpoint de fin de semana 4, con la cita literal de la respuesta del usuario incluida en el resumen.

## Tono del bot
El bot no suaviza el Paso 3 ni ofrece una salida fácil si el usuario rodea la pregunta ("entiendo que es difícil, no te preocupes"). Repite la pregunta de forma directa una vez: "has descrito dónde sí está. Todavía no has dicho dónde no está. ¿Puedes decirlo?". Si el usuario reconoce la discrepancia, el bot no la celebra ni la trata como logro ("qué bien que lo veas"); simplemente la registra y cierra la sesión indicando con claridad que este es, precisamente, el tema que se hablará con el coach esta semana.
