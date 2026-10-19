# Sesión 7 · Evaluación del bot al cierre

## Lectura previa obligatoria
El bot lee `direccion_elegida` (ratificada tras el checkpoint de la Sesión 6) para contrastar cada hito propuesto contra ella, y `restriccion_usada_como_excusa` de la Sesión 6 para prestar atención reforzada si algún hito parece esquivar, de nuevo, la misma restricción cuestionada entonces.

## Patrones a extraer de la respuesta
- **Verificabilidad**: presencia real de fecha y criterio de cumplimiento binario (sí/no) en cada hito, frente a formulaciones que siguen siendo intenciones con una fecha pegada encima.
- **Alineación con la dirección elegida**: cada hito se contrasta semánticamente contra `direccion_elegida`; un hito bien formulado pero tangencial a la dirección se marca como desalineado.
- **Consistencia entre confianza declarada y contenido del plan**: una confianza muy alta sobre un plan con hitos vagos, o muy baja sobre un plan sólido, son ambas señales a registrar.
- **Honestidad en el hito más difícil**: si el hito señalado como "más difícil" es, de forma evidente, el menos relevante del plan (evitando nombrar el que realmente da miedo), se registra como posible evitación.

## Campos que añade o actualiza (perfil acumulado)
`hitos_90_dias`, `hito_mas_dificil_declarado`, `relacion_hitos_con_direccion_elegida` (calculado), `señal_vaguedad_plan`, `señal_bloqueo_s7`, `ultima_sesion_completada = 7`.

## Triggers de escalado aplicados a esta sesión

1. **Lenguaje de crisis o desesperanza** — Monitorizado como siempre, con atención particular si aparece alrededor del hito más difícil ("sé que no lo voy a conseguir, nunca consigo estas cosas").
2. **Bloqueo repetido** — Se activa específicamente si, tras dos rondas de la IA pidiendo precisar fecha y criterio de cumplimiento, los hitos siguen siendo formulaciones vagas sin verificabilidad real. Esta es la aplicación literal del trigger 2 a este módulo: "misma respuesta o ausencia de respuesta más de 2 veces".
3. **Inactividad** — Criterio estándar.
4. **Contradicción no resuelta** — Se activa si `relacion_hitos_con_direccion_elegida` resulta baja: el plan, en conjunto, no ejecuta la dirección comprometida la semana anterior, sino una versión notablemente más segura o distinta de ella, y el usuario no lo reconoce al señalársele. Se marca para que el coach lo revise antes del cierre del programa en la Sesión 8.

## Tono del bot
El bot no acepta un hito vago por cortesía ("vale, lo anoto así"); lo devuelve con precisión quirúrgica: "esto dice 'avanzar en mi búsqueda'. ¿Qué fecha, y cómo sabrás exactamente que se cumplió?". No felicita el plan una vez completo ("¡buen trabajo!"); se limita a confirmar que cada hito pasó la prueba de verificabilidad y a señalar, si la hay, cualquier desalineación con la dirección elegida, dejando al usuario decidir qué hacer con esa información antes de pasar a la última sesión.
