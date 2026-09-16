# Tu Nueva Vida — hoja de ruta

## Fase 1 · Cimientos (COMPLETADA)
- [x] Base de datos: profiles, user_roles, modules, module_progress, deliverables, flags, sessions_1_1, coach_clients
- [x] Reglas de acceso (RLS): cliente solo sus datos, coach solo sus clientes, progreso solo vía servidor
- [x] 8 módulos precargados (4 fases, 8 semanas)
- [x] Funciones de avance: start_module, complete_module (desbloquea la semana siguiente), initialize_client_progress
- [x] Endurecimiento: funciones internas no accesibles de forma anónima
- [x] Login (sin registro público) y cabecera con sesión/cerrar sesión
- [x] /dashboard del cliente (saludo, progreso, sesión 1:1, línea de tiempo de 8 módulos)
- [x] /modulos/:id (guía Claude, entregable, completar módulo)
- [x] /coach (lista de clientes, métricas, invitar cliente)
- [x] /coach/clientes/:id (progreso, entregables, avisos, sesiones, notas privadas del coach)
- [x] Integración Claude: askModuleClaude con claude-sonnet-5 fijo en servidor, contexto del programa, errores seguros
- [x] Prueba de humo completa: coach → crea cliente → cliente entra → panel → módulo (sin errores)

## Fase 2 · Contenido (pendiente de tu revisión)
- [ ] Preguntas, guiones, tono y ejercicios por módulo (sistema de prompts por módulo)
- [ ] Criterios del sistema de avisos (flags) automáticos
- [ ] Guiones y contenido de las 4 sesiones 1:1

## Operativa
- [ ] Crear tu cuenta de coach real (necesito tu correo; asigno el rol en la base de datos)
- [ ] (Opcional) Borrar cuentas de prueba: coach.prueba@… / ana.prueba@…
- [ ] Publicar la app

## Fuera de alcance (por la especificación)
- Biblioteca de recursos, pagos, registro público, marketplace, funciones sociales
