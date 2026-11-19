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

## Fase 3 · Faceless y autónomo (noviembre 2026)
- [x] Contenido sin coach humano, llamadas ni retiro; revisiones de fase a cargo del coach IA
- [x] Landing con los 8 módulos, precio (399 €), garantía 14 días y FAQ; sin testimonios
- [x] Compra con Lemon Squeezy y alta automática por webhook (docs/LANZAMIENTO.md)
- [x] Ejercicios dentro de la plataforma con revisión y feedback del coach IA
- [x] Pipeline de vídeo faceless (scripts/videos) · piloto del Módulo 1
- [x] Publicado en producción con despliegue automático desde GitHub
- [ ] Crear cuenta de Lemon Squeezy y configurar secretos (hasta entonces /comprar devuelve 404)
- [x] Migraciones aplicadas, vídeos subidos, auth y email (Resend) configurados
- [x] 8 vídeos generados y subidos
- [x] Páginas legales: aviso legal, privacidad, condiciones de venta y cookies
- [ ] Rellenar titular, NIF y domicilio en src/lib/legal.ts

## Fase 4 · Captación (pendiente)
- [ ] Contenido faceless para redes (shorts a partir del pipeline de vídeo)
- [ ] Lead magnet gratuito y secuencia de emails

## Fuera de alcance
- Marketplace, funciones sociales

- [ ] Unificar la paleta clara/cálida de la landing en toda la plataforma (cliente, coach, admin)
