# Sesión 5 · Evaluación del bot al cierre

## Lectura previa obligatoria
El bot lee `valor_mayor_gap` y `resumen_fase2_cierre` de la Sesión 4 para recordarlos al usuario antes del ejercicio y para evaluar después cuántas opciones de la lista lo abordan realmente.

## Patrones a extraer de la respuesta
- **Volumen**: número total de opciones generadas respecto al mínimo pedido (15). Un volumen consistentemente bajo, incluso tras ánimo a continuar, es una señal en sí misma.
- **Autocensura residual**: presencia de condicionales o justificaciones de descarte dentro de las propias opciones ("sería bueno pero..."), pese a la instrucción explícita de no incluirlas.
- **Proporción de opciones ancladas al gap**: cuántas opciones de la lista total están marcadas por el propio usuario como relacionadas con `valor_mayor_gap`. Una proporción nula o casi nula, en una lista por lo demás larga y variada, es una señal de evitación selectiva.
- **Repetición disfrazada**: opciones que en el fondo son la misma idea reformulada varias veces para alcanzar el mínimo sin ampliar realmente el abanico.

## Campos que añade o actualiza (perfil acumulado)
`opciones_generadas`, `opciones_ancladas_a_valor_mayor_gap` (calculado), `señal_autocensura_detectada`, `señal_bloqueo_s5`, `ultima_sesion_completada = 5`.

## Triggers de escalado aplicados a esta sesión

1. **Lenguaje de crisis o desesperanza** — Menos central en este módulo, pero se mantiene la vigilancia estándar, especialmente si el usuario expresa desesperanza respecto a tener opciones reales ("da igual lo que escriba, no hay nada que pueda hacer").
2. **Bloqueo repetido** — Se activa si el usuario entrega una lista muy por debajo del mínimo (p. ej. menos de 8 opciones) en dos intentos consecutivos pese al ánimo de la IA a continuar, o si la lista consiste en variaciones mínimas de una sola idea repetida.
3. **Inactividad** — Igual criterio estándar (más de 5 días sin actividad en la semana activa).
4. **Contradicción no resuelta** — No es el foco principal de este módulo (se gestiona con más fuerza en la Sesión 6), pero si `señal_autocensura_detectada` es muy alta y el usuario marca explícitamente que ninguna opción ataca su valor de mayor gap pese a tener una lista larga, se anota como antecedente para que el bot lo retome la semana siguiente al examinar las restricciones.

## Tono del bot
El bot anima a continuar generando sin dar ejemplos que el usuario pueda copiar literalmente ("sigue, ¿qué más se te ocurre, aunque suene poco realista?"), nunca sugiriendo una opción concreta que luego parezca una recomendación de la IA. Si detecta un "pero" dentro de una opción, lo señala de forma directa y breve, sin sermón: "esto tiene un 'pero' dentro. Escribe solo la primera parte." No comenta sobre si las opciones generadas son buenas o malas ideas; su única evaluación visible para el usuario es si cumplió el volumen mínimo y si marcó correctamente cuáles tocan su valor de mayor gap.
