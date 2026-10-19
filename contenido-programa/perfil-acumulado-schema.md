# Esquema del perfil acumulado del usuario

Este esquema es el contrato de datos que permite que el bot de IA actúe como coach cada vez más preciso: define qué campos escribe cada sesión y qué campos debe leer de sesiones anteriores **antes** de generar sus preguntas. Ninguna sesión parte de cero.

Convención: `snake_case`, un campo por fila. "Origen" indica la sesión que lo crea o actualiza por primera vez. Los campos no narrativos (operativos) se marcan como tal.

## 1. Identidad y contexto (origen: Sesión 1, no cambia después)

| Campo | Tipo | Descripción |
|---|---|---|
| `usuario_id` | string | Identificador único del usuario |
| `fecha_inicio_programa` | date | Fecha de activación (fin de Fase 0) |
| `rol_declarado` | string | Profesión/rol actual |
| `sector` | string | Sector profesional |
| `antiguedad_rol_actual` | number (años) | Tiempo en el rol actual |
| `situacion_familiar_relevante` | texto corto | Contexto familiar que el usuario considera relevante (opcional) |

## 2. Fase 1 · Confrontación

### Sesión 1 — Módulo 1.1, Auditoría vital honesta

| Campo | Tipo | Descripción |
|---|---|---|
| `insatisfacciones_declaradas` | lista de objetos `{dominio, descripcion}` | Dominios: carrera, energía, relaciones, otras. Texto crudo, sin editar por el bot |
| `nivel_energia_autopercibido` | escala 1–10 | Autoevaluación de energía vital actual |
| `patrones_lenguaje_detectados_s1` | lista de enums (`evasion`, `repeticion`, `minimizacion`, `catastrofizacion`, `racionalizacion`) | Patrones detectados por dominio |
| `señal_bloqueo_s1` | booleano | Ver evaluación de sesión 1 |
| `señal_crisis_s1` | booleano | Ver evaluación de sesión 1 |
| `resumen_auditoria` | texto (≤200 palabras) | Síntesis para el coach, no para el usuario |

**Se consulta en:** Sesión 2 (para dirigir la proyección a 5 años hacia los dominios con mayor carga), Sesión 8 (para medir cambio de lenguaje desde el inicio).

### Sesión 2 — Módulo 1.2, El coste de no cambiar

| Campo | Tipo | Descripción |
|---|---|---|
| `proyeccion_5_anios_usuario` | texto | Narrativa de "vida igual dentro de 5 años" |
| `coste_emocional_declarado` | escala 1–10 | Impacto emocional de la proyección |
| `coste_relacional_declarado` | escala 1–10 | Impacto relacional |
| `coste_identitario_declarado` | escala 1–10 | Impacto en identidad/sentido de quién es |
| `discrepancia_proyeccion_vs_auditoria` | texto + booleano (calculado) | Compara severidad declarada aquí contra `insatisfacciones_declaradas` de S1; `true` si hay minimización significativa |
| `señal_bloqueo_s2` | booleano | — |
| `señal_crisis_s2` | booleano | — |
| `resumen_fase1_cierre` | texto | Síntesis S1+S2 para el checkpoint 1:1 de fin de semana 2 (contención emocional) |

**Se consulta en:** Sesión 3 (los dominios de mayor coste orientan las sugerencias iniciales de valores), Sesión 4, Sesión 6 (para distinguir restricción real de excusa), Sesión 8 (informe final).

## 3. Fase 2 · Claridad

### Sesión 3 — Módulo 2.1, Mapa de valores

| Campo | Tipo | Descripción |
|---|---|---|
| `valores_seleccionados` | lista (5 strings) | Valores elegidos por el usuario |
| `valores_priorizados` | lista ordenada (1–5) | Ranking de importancia |
| `valores_autoevaluados` | lista de objetos `{valor, score_atencion}` | Score 1–10: qué tan atendido está hoy cada valor |
| `gap_valores` | lista de objetos `{valor, gap}` (calculado) | `prioridad − score_atencion`, por valor |
| `valor_mayor_gap` | string (calculado) | Valor con mayor diferencia prioridad/atención |
| `señal_bloqueo_s3` | booleano | — |
| `señal_crisis_s3` | booleano | — |

**Se consulta en:** Sesión 4 (contraste directo), Sesión 5 (anclar opciones al gap), Sesión 6 (detectar restricción-excusa), Sesión 8 (informe final).

### Sesión 4 — Módulo 2.2, Tu hoguera personal

| Campo | Tipo | Descripción |
|---|---|---|
| `version_mejor_yo_descrita` | texto | Descripción de la mejor versión de sí mismo |
| `impacto_declarado_en_otros` | texto | Qué representa para quienes le rodean |
| `coherencia_valores_vs_hoguera` | texto + escala (calculado) | Contraste entre `valor_mayor_gap` y lo descrito aquí |
| `contradiccion_valores_vida` | booleano + texto | Si hay discrepancia relevante entre valores declarados y vida real |
| `señal_contradiccion_no_resuelta_s4` | booleano | — |
| `resumen_fase2_cierre` | texto | Checkpoint 1:1 fin semana 4: contraste valores vs. vida actual |

**Se consulta en:** Sesión 5 (brief de diseño: qué gap deben atacar las opciones), Sesión 8 (informe final).

## 4. Fase 3 · Diseño

### Sesión 5 — Módulo 3.1, Generación de opciones

| Campo | Tipo | Descripción |
|---|---|---|
| `opciones_generadas` | lista de strings | Listado bruto sin filtrar |
| `opciones_ancladas_a_valor_mayor_gap` | lista de strings (subconjunto, calculado) | Opciones que abordan explícitamente `valor_mayor_gap` |
| `señal_autocensura_detectada` | booleano | Volumen bajo o lenguaje de "pero no puedo" pese a instrucción contraria |
| `señal_bloqueo_s5` | booleano | — |

**Se consulta en:** Sesión 6 (universo a filtrar; detectar si el filtro elimina sistemáticamente las opciones ancladas al gap).

### Sesión 6 — Módulo 3.2, Filtro por restricciones reales

| Campo | Tipo | Descripción |
|---|---|---|
| `restricciones_no_negociables` | lista (2–3 strings, categorizadas: tiempo/dinero/familia/geografía/otra) | — |
| `opciones_filtradas` | lista de objetos `{opcion, sobrevive, justificacion}` | Resultado de aplicar el filtro |
| `opcion_superviviente` | string o lista corta | Dirección(es) que sobreviven al filtro |
| `restriccion_usada_como_excusa` | booleano + texto (calculado) | Cruza justificaciones con `señal_autocensura_detectada` y `coste_emocional_declarado` |
| `señal_contradiccion_no_resuelta_s6` | booleano | — |
| `direccion_elegida` | texto (provisional hasta ratificación en checkpoint) | — |
| `resumen_fase3_cierre` | texto | Checkpoint 1:1 fin semana 6: compromiso con una dirección |

**Se consulta en:** Sesión 7 (objeto directo del plan a 90 días), Sesión 8 (informe final).

## 5. Fase 4 · Acción

### Sesión 7 — Módulo 4.1, Plan a 90 días

| Campo | Tipo | Descripción |
|---|---|---|
| `hitos_90_dias` | lista de objetos `{hito, fecha_objetivo, criterio_cumplimiento}` | — |
| `hito_mas_dificil_declarado` | string | — |
| `relacion_hitos_con_direccion_elegida` | texto + escala (calculado) | Coherencia entre hitos y `direccion_elegida` |
| `señal_vaguedad_plan` | booleano | Hitos sin criterio verificable tras 2 intentos |
| `señal_bloqueo_s7` | booleano | — |

**Se consulta en:** Sesión 8 (objeto del sistema de accountability e informe final).

### Sesión 8 — Módulo 4.2, Sistema de accountability y cierre

| Campo | Tipo | Descripción |
|---|---|---|
| `checkins_semanales_programados` | objeto `{frecuencia, canal}` | Configuración operativa |
| `historial_cumplimiento_hitos` | lista (se inicializa vacía, se llena post-programa) | — |
| `señal_inactividad` | booleano (operativo) | Mecanismo que nace aquí, se evalúa cada semana activa |
| `señal_abandono_riesgo` | booleano (calculado) | — |
| `informe_final_generado` | texto largo | Resumen del recorrido: valores, dirección, plan |
| `recomendacion_siguiente_escalon` | enum (`1:1_continuado`, `retiro_leon`, `ambos`) | Calculado a partir de todo el perfil |

## 6. Meta-campos transversales (activos desde Sesión 1, actualizados cada semana)

| Campo | Tipo | Descripción |
|---|---|---|
| `ultima_sesion_completada` | number (1–8) | — |
| `fecha_ultima_actividad` | date | — |
| `dias_inactividad_semana_actual` | number | Alimenta el trigger 3 (inactividad) |
| `contador_bloqueo_por_modulo` | mapa `{modulo: contador}` | Alimenta el trigger 2 (bloqueo repetido) |
| `triggers_activados_historial` | lista de objetos `{sesion, trigger, fecha, resuelto_por_coach}` | Auditoría completa de escalados |
| `notas_coach_privadas` | texto, solo escritura humana | El bot **no** las usa para generar preguntas, salvo que una contradicción marcada aquí como resuelta deba dejar de aparecer en sesiones futuras |

## 7. Regla de consulta obligatoria

Antes de generar la primera pregunta de cualquier sesión X, el bot debe leer: (a) todos los campos "se consulta en Sesión X" listados arriba, (b) `triggers_activados_historial` para no repetir una confrontación ya escalada y resuelta, y (c) `contador_bloqueo_por_modulo` y `dias_inactividad_semana_actual` para decidir si el tono de apertura debe ser de confrontación directa (si hay bloqueo/inactividad previa) o de continuidad estándar.
