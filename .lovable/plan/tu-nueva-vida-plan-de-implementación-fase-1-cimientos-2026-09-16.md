# Tu Nueva Vida — Plan de implementación (Fase 1: cimientos)

Aplicación privada de acompañamiento: 8 módulos semanales en 4 fases, con panel de cliente y panel de coach. Sin registro público. Backend en Lovable Cloud (base de datos, acceso, secretos y funciones de servidor).

## Estado actual

- La llamada a Claude ya existe y se ejecuta solo en el servidor, con la clave `ANTHROPIC_API_KEY` ya guardada de forma segura. En esta fase se ampliará para recibir el módulo y el contexto del cliente.
- La app todavía no tiene base de datos ni pantallas: se crean en esta fase.

## Tablas propuestas

| Tabla | Para qué sirve |
| --- | --- |
| `profiles` | Nombre, rol (`client` / `coach`) y fecha de inicio del programa |
| `user_roles` | Rol real usado para permisos (separado, por seguridad) |
| `modules` | Los 8 módulos, con fase, semana, título y objetivo |
| `module_progress` | Estado de cada módulo para cada cliente (bloqueado, disponible, en curso, completado) |
| `deliverables` | Entregables que el cliente genera en cada módulo |
| `flags` | Avisos para el coach sobre un cliente y módulo |
| `sessions_1_1` | Las 4 sesiones humanas, con fecha, estado y notas del coach |
| `coach_clients` | Qué clientes pertenece a qué coach |

Relaciones: todo lo del cliente apunta a su usuario y a un módulo. Un cliente solo puede tener un progreso por módulo, y un coach no puede tener dos veces al mismo cliente.

Restricciones: fase entre 1 y 4, semana entre 1 y 8 y sin semanas repetidas, y los estados limitados exactamente a los valores indicados. Fechas en UTC.

Datos iniciales: los 8 módulos con sus títulos y objetivos tal como los definiste.

## Reglas de acceso

- **Cliente:** ve y edita solo su perfil (nunca su rol), ve solo su progreso, sus entregables, sus flags y sus sesiones. Las notas privadas del coach no le llegan nunca.
- **Coach:** ve y gestiona únicamente los clientes asignados a él.
- **Nadie** puede desbloquear o completar módulos desde el navegador: el avance se decide en el servidor. Al completar la semana N se abre la N+1; la 8 cierra el programa.
- Al crear un cliente, se generan sus 8 registros de progreso: semana 1 disponible, el resto bloqueadas.

## Pantallas

- `/login` — única entrada, solo inicio de sesión (sin registro público).
- `/dashboard` (cliente) — saludo, fase y semana actual, progreso, línea de tiempo con 8 tarjetas agrupadas en 4 fases con su estado y candado, acceso al módulo activo, enlace a entregables completados y próxima sesión 1:1.
- `/coach` — lista de clientes con fecha de inicio, fase, módulo, % de progreso, módulos completados, flags abiertos, próxima sesión y aviso visual de quién necesita atención.
- `/coach/clientes/:id` — resumen, progreso, entregables, flags, sesiones y notas privadas.
- Redirección automática según rol y bloqueo de rutas ajenas, también escribiendo la URL a mano.

## Identidad visual

Fondo de cielo nocturno (carbón, azul noche, negro suave), acentos ámbar, naranja quemado y dorado cálido, tarjetas con profundidad y bordes sutiles, tipografía elegante, animaciones discretas y mucho aire. Textos en español.

## Cómo se asigna el primer coach

No hay forma segura de que alguien se declare coach desde una pantalla. Propuesta: tú creas tu cuenta iniciando sesión una primera vez y yo te asigno el rol `coach` directamente en la base de datos. A partir de ahí, tú creas e invitas a los clientes desde tu panel, y cada cliente nuevo queda asignado a ti automáticamente.

## Preparación de Claude

La función de servidor pasará a recibir el módulo y el mensaje del cliente, comprobará que ha iniciado sesión y que ese módulo está disponible para él, recuperará solo sus propios entregables anteriores y enviará a Claude el contexto del programa. Devolverá mensaje, si procede guardar entregable y un posible aviso. El nombre del modelo queda fijado en el servidor; el navegador no puede elegirlo. Sin simulaciones ni respuestas falsas.

## Fuera de alcance en esta fase

Contenido y guiones de los módulos, sesiones 1:1 detalladas, sistema definitivo de flags, biblioteca de recursos, pagos y registro público.

## Detalles técnicos

- Base de datos Postgres de Lovable Cloud con RLS activo en todas las tablas; rol leído mediante función `has_role` con `security definer` sobre `user_roles`, nunca desde `profiles`.
- Progreso y desbloqueo mediante funciones de servidor autenticadas (`requireSupabaseAuth`) y funciones SQL; sin escrituras directas de estado desde el cliente.
- Creación de clientes por el coach mediante función de servidor privilegiada que verifica el rol antes de usar permisos administrativos.
- Módulos precargados y `GRANT` explícitos en la misma migración.
