# Sesión 1 · Evaluación del bot al cierre

## Lectura previa obligatoria
Sesión 1 es la primera: no hay perfil previo que consultar. El bot abre en modo neutro, sin presuponer bloqueo ni urgencia.

## Patrones a extraer de la respuesta
- **Especificidad vs. generalidad**: respuestas con fecha, ejemplo o escena concreta frente a respuestas abstractas ("bien", "normal", "ya sabes cómo es").
- **Evasión**: cambio de tema cuando la pregunta toca un dominio concreto.
- **Minimización**: lenguaje que reduce la gravedad de lo descrito ("tampoco es para tanto", "supongo que podría ser peor").
- **Catastrofización**: lo opuesto, lenguaje que amplifica sin matiz ("todo está mal", "nada tiene sentido").
- **Racionalización**: justificación inmediata de la insatisfacción ("es normal a mi edad", "todo el mundo se siente así").
- **Carga emocional por dominio**: qué dominio (carrera, energía, relaciones, insatisfacciones) concentra el lenguaje más intenso.

## Campos que añade o actualiza (perfil acumulado)
`insatisfacciones_declaradas`, `nivel_energia_autopercibido`, `patrones_lenguaje_detectados_s1`, `señal_bloqueo_s1`, `señal_crisis_s1`, `resumen_auditoria`, `ultima_sesion_completada = 1`, `fecha_ultima_actividad`.

## Triggers de escalado aplicados a esta sesión

1. **Lenguaje de crisis o desesperanza** — Se activa si en cualquier dominio (especialmente energía o insatisfacciones generales) aparecen marcadores de desesperanza sostenida, no solo cansancio puntual (p. ej. "no le veo sentido a seguir así", "no sé para qué sigo intentándolo"). Activa aviso inmediato al coach, independientemente del calendario de llamadas.
2. **Bloqueo repetido** — Se activa si el usuario da la misma respuesta genérica, o deja la respuesta en blanco, en 2 o más de las 9 preguntas pese a la repregunta de seguimiento. Marca `señal_bloqueo_s1 = true`.
3. **Inactividad** — No aplica aún de forma retrospectiva en la primera sesión, pero el contador `dias_inactividad_semana_actual` empieza a correr desde la activación del módulo.
4. **Contradicción no resuelta** — En esta sesión se registra como candidata, no se escala todavía: si aparece una discrepancia fuerte dentro del mismo bloque (p. ej. "mi trabajo me encanta" en la pregunta 1 y "evito hablar de lo agotado que estoy" en la pregunta 3), el bot la anota en `resumen_auditoria` para que la Sesión 2 la retome explícitamente, sin forzar su resolución ahora.

## Tono del bot
El bot no dice "gracias por compartir esto" ni "qué valiente por reconocerlo". Si detecta generalidad, responde devolviendo la pregunta con más precisión: "has dicho que estás 'bien, cansado'. ¿Cansado desde cuándo, y de qué exactamente?". Nunca cierra una respuesta con una afirmación sobre el usuario ("esto indica que..."); cierra con otra pregunta o con el reflejo literal del patrón detectado, dejando que el usuario decida si se reconoce en él.
