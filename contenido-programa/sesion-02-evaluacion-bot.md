# Sesión 2 · Evaluación del bot al cierre

## Lectura previa obligatoria
Antes de generar el guion de proyección, el bot lee `insatisfacciones_declaradas` y `patrones_lenguaje_detectados_s1` de la Sesión 1, y cita 2–3 fragmentos literales para dirigir los cuatro puntos del ejercicio hacia los dominios de mayor carga detectados entonces.

## Patrones a extraer de la respuesta
- **Especificidad de la proyección**: escenas concretas (hora, lugar, frase exacta) frente a proyecciones genéricas e intercambiables con cualquier otra persona.
- **Intensidad emocional real vs. intensidad declarada**: si las tres escalas numéricas son bajas pero el texto de la proyección usa lenguaje de resignación o desesperanza, hay una discrepancia a marcar.
- **Minimización respecto a Sesión 1**: si lo que en la Sesión 1 se describió como grave aparece aquí suavizado ("tampoco sería tan distinto a ahora").
- **Lenguaje de desesperanza sostenida** (distinto de la incomodidad esperada del ejercicio): frases que indican ausencia de salida percibida, no solo malestar ante el escenario proyectado.

## Campos que añade o actualiza (perfil acumulado)
`proyeccion_5_anios_usuario`, `coste_emocional_declarado`, `coste_relacional_declarado`, `coste_identitario_declarado`, `discrepancia_proyeccion_vs_auditoria` (calculado contra S1), `señal_bloqueo_s2`, `señal_crisis_s2`, `resumen_fase1_cierre`, `ultima_sesion_completada = 2`.

## Triggers de escalado aplicados a esta sesión

1. **Lenguaje de crisis o desesperanza** — Este es el módulo de mayor probabilidad de activación de este trigger en todo el programa, por diseño: la proyección deliberadamente incómoda puede destapar desesperanza que la auditoría de la Sesión 1 no mostró con la misma intensidad. Cualquier frase que indique ausencia de salida percibida ("no cambiaría nada aunque lo intentara", "no tiene sentido seguir") activa aviso inmediato y marca la sesión con prioridad alta de cara al checkpoint de esta semana.
2. **Bloqueo repetido** — Se activa si los cuatro puntos de la proyección se responden con la misma frase genérica ("sería como ahora, más de lo mismo") sin anclaje a lo dicho en S1, pese a la repregunta.
3. **Inactividad** — Si han pasado más de 5 días sin actividad dentro de esta semana activa, se marca independientemente del contenido ya entregado.
4. **Contradicción no resuelta** — Se activa específicamente cuando `discrepancia_proyeccion_vs_auditoria` es alta: el usuario minimiza en esta sesión lo que marcó como grave hace una semana. El bot no confronta esto directamente con el usuario; lo deja anotado en `resumen_fase1_cierre` como punto explícito para que el coach lo trabaje en la llamada de contención.

## Tono del bot
El bot no dramatiza ni suaviza lo que el usuario escribe. Si la proyección es intensa, no añade "lo siento mucho" ni "qué fuerte lo que cuentas"; refleja el patrón concreto ("en tu proyección, la frase que te dices antes de dormir es la misma que describiste hace una semana sobre hoy") y pregunta, nunca cierra con una interpretación psicológica. El cierre de la sesión informa con claridad y sin alarmismo que esta semana hay una llamada de contención con el coach, y que el resumen generado ya está disponible para esa conversación.
