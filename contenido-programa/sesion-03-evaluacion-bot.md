# Sesión 3 · Evaluación del bot al cierre

## Lectura previa obligatoria
El bot lee `coste_emocional_declarado`, `coste_relacional_declarado` y `coste_identitario_declarado` de la Sesión 2 para sugerir, como punto de partida (no como imposición), 2–3 dominios donde explorar valores candidatos.

## Patrones a extraer de la respuesta
- **Justificación concreta vs. abstracta**: valores respaldados con un ejemplo reciente y verificable frente a valores respaldados solo con una afirmación general ("la familia es lo más importante", sin ejemplo).
- **Consistencia interna**: si la prioridad declarada de un valor no se corresponde con el tono o contenido de su justificación (p. ej. prioridad 1 pero la justificación suena a obligación, no a elección).
- **Valores "de catálogo"**: selección de valores genéricos y socialmente esperables sin ningún anclaje personal, incluso tras la repregunta.
- **Patrón de autoevaluación sistemáticamente alta o baja**: si todas las puntuaciones de atención real son uniformemente altas (ausencia de gap en absolutamente todos los valores), puede indicar evaluación complaciente, no honesta.

## Campos que añade o actualiza (perfil acumulado)
`valores_seleccionados`, `valores_priorizados`, `valores_autoevaluados`, `gap_valores` (calculado), `valor_mayor_gap` (calculado), `señal_bloqueo_s3`, `señal_crisis_s3`, `ultima_sesion_completada = 3`.

## Triggers de escalado aplicados a esta sesión

1. **Lenguaje de crisis o desesperanza** — Menos probable estructuralmente en este módulo (es más cognitivo que confesional), pero se sigue monitorizando en las justificaciones de texto libre; cualquier mención de desesperanza se trata igual que en sesiones anteriores.
2. **Bloqueo repetido** — Se activa si el usuario no logra producir 5 valores distintos, o repite el mismo valor genérico sin justificación concreta tras dos repreguntas.
3. **Inactividad** — Igual que en sesiones anteriores, se marca a partir de 5 días sin actividad dentro de la semana activa.
4. **Contradicción no resuelta** — Se activa si `valor_mayor_gap` entra en conflicto directo con lo declarado en `proyeccion_5_anios_usuario` de la Sesión 2 (p. ej. el valor de mayor gap es "relaciones" pero la proyección de 5 años no mencionó ningún coste relacional) y el usuario no lo reconoce al dársele la oportunidad de matizar el cálculo. El bot no resuelve esto: lo deja marcado explícitamente para que la Sesión 4 lo retome de frente.

## Tono del bot
El bot presenta el gap como una observación neutra, nunca como una conclusión sobre el carácter del usuario: "tu prioridad en [valor] es 1, tu atención real es 3. Ahí hay una diferencia de 2 puntos" — sin añadir "esto significa que no te estás cuidando" o similar. Si la justificación es genérica, el bot pide el ejemplo concreto una vez, de forma directa, sin suavizantes ("¿puedes darme un ejemplo real, de la última semana, donde esto se haya visto?"). No hay segunda ronda de insistencia amable: si tras la repregunta sigue siendo genérico, se registra como señal y se avanza.
