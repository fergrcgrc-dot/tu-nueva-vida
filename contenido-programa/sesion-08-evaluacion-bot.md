# Sesión 8 · Evaluación del bot al cierre

## Lectura previa obligatoria
Esta es la única sesión que exige recorrer **todo** el perfil acumulado (Sesiones 1 a 7) antes de generar el informe: `resumen_auditoria`, `resumen_fase1_cierre`, `valor_mayor_gap`, `resumen_fase2_cierre`, `direccion_elegida`, `hitos_90_dias`, `hito_mas_dificil_declarado`, y la totalidad de `triggers_activados_historial`, prestando atención específica a cualquier entrada marcada como no resuelta.

## Patrones a extraer de la respuesta
- **Cambio de lenguaje respecto a la línea base**: comparación directa entre los patrones de lenguaje detectados en la Sesión 1 (`patrones_lenguaje_detectados_s1`) y el lenguaje usado en la reflexión de cierre — ¿persiste la evasión o la minimización, o hay evidencia de un cambio real?
- **Coherencia entre compromiso declarado y comportamiento histórico**: una puntuación alta de compromiso contrastada contra un historial de bloqueos o inactividad reiterada a lo largo del programa es una discrepancia a señalar, no a aceptar sin más.
- **Reconocimiento de lo no resuelto**: si el usuario menciona de forma honesta una contradicción previa sin resolverla del todo, frente a quien la minimiza o la da por superada sin evidencia.
- **Calidad del miedo declarado** (pregunta 3 del ejercicio): miedo específico y conectado al hito más difícil, frente a una respuesta genérica que no aporta nada nuevo.

## Campos que añade o actualiza (perfil acumulado)
`checkins_semanales_programados`, `historial_cumplimiento_hitos` (inicializado), `señal_inactividad` (mecanismo activado), `señal_abandono_riesgo` (calculado), `informe_final_generado`, `recomendacion_siguiente_escalon` (calculado), `ultima_sesion_completada = 8`.

## Triggers de escalado aplicados a esta sesión

Los cuatro triggers se evalúan aquí con un criterio adicional: **revisión histórica completa**, no solo de esta sesión.

1. **Lenguaje de crisis o desesperanza** — Se revisa tanto en la reflexión de cierre como en el patrón acumulado de las 8 sesiones; dado que esta es la sesión de mayor carga de balance personal, se mantiene vigilancia alta, con escalado inmediato si aparece.
2. **Bloqueo repetido** — Se revisa `contador_bloqueo_por_modulo` en su conjunto: una concentración de bloqueos en una fase específica (p. ej. toda la Fase 2) se incluye como dato explícito en el informe final, no se descarta por haber "quedado atrás".
3. **Inactividad** — Si el cierre del programa se demora más de 5 días respecto al ritmo esperado, se registra como señal de riesgo de abandono y el sistema envía un recordatorio automático para retomarlo.
4. **Contradicción no resuelta** — Cualquier entrada de `triggers_activados_historial` de tipo contradicción que no conste como `resuelto = true` se incluye explícitamente, con cita literal, en `informe_final_generado`. No se omite por antigüedad ni se asume resuelta por defecto.

## Tono del bot
El mensaje de cierre del bot es deliberadamente sobrio: confirma que el informe está generado y lo pone a disposición del usuario, sin lenguaje de celebración genérico ("¡lo lograste!", "¡enhorabuena por este viaje!"). La frase de cierre tipo es: "Tu informe está listo. Tus check-ins empiezan la semana que viene." El bot no vende nada en el cierre: el siguiente paso es el plan a 90 días que el usuario ya ha escrito.
