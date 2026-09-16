# Roles y permisos: admin de plataforma, coach y cliente

Antes de tocar nada, este es el esquema, las reglas de acceso y el reparto por fases. No aplico ningún cambio hasta que lo apruebes.

## 1. Qué hay hoy

- Dos roles: `client` y `coach` (tipo `app_role`), guardados en `user_roles` y replicados en `profiles.role`.
- `coach_clients` ya existe, pero solo con coach, cliente y fecha de creación: no guarda quién asignó, ni baja, ni estado.
- El alta de clientes la hace hoy cualquier coach desde su panel.
- No hay notificaciones ni registro de actividad.

## 2. Cambios en los datos

**Roles**: se añade `platform_admin` al tipo de rol existente.

**`profiles`**: nuevos campos `status` (activo / inactivo / bloqueado), `admin_notes` (solo admin), `timezone`, `last_active_at`.

**`coach_clients`** pasa a ser un histórico: se añaden `assigned_by`, `assigned_at`, `unassigned_at`, `status` (activa / inactiva), `updated_at`. Nada se borra nunca; cambiar de coach cierra la fila anterior y crea una nueva. Índice único que impide dos coaches activos para el mismo cliente.

**`notifications`** (nueva): destinatario, tipo, título, mensaje, entidad relacionada, leída, fechas. Tipos iniciales: nuevo cliente asignado, módulo completado, aviso creado, sesión próxima, cliente inactivo, cambio de coach, cliente sin coach, cambio de estado de cuenta.

**`audit_logs`** (nueva): quién, qué acción, sobre qué, datos extra, cuándo. Sin contraseñas, claves ni tokens.

## 3. Reglas de acceso (se aplican en la base de datos, no solo en pantalla)

- Admin: lectura completa de perfiles, asignaciones, progreso, entregables, avisos y sesiones; único que escribe altas, estados y asignaciones.
- Coach: solo ve clientes con asignación **activa**; se sustituye la comprobación actual por una que exige `status = 'activa'` y `unassigned_at` vacío. Cambiar el identificador de cliente en la dirección web no da acceso, porque la comprobación está en la base de datos.
- Cliente: solo sus propios datos; nunca ve notas del coach ni notas administrativas.
- Nadie puede cambiar su propio rol ni ascenderse a admin: el rol vive en una tabla aparte sin permiso de escritura para usuarios; solo lo cambia el servidor tras comprobar que quien actúa es admin.
- Toda cuenta inactiva o bloqueada queda sin acceso a datos, comprobado en el servidor en cada consulta.

## 4. Cómo se crea el primer administrador

Sin formulario público. Propuesta: una acción única en el servidor que solo puede ejecutarse si **no existe todavía ningún** `platform_admin` y si el correo coincide exactamente con el tuyo (fer.grc.grc@gmail.com), fijado en una variable secreta del servidor. En cuanto exista un admin, la acción deja de funcionar para siempre. A partir de ahí, solo un admin puede nombrar a otro. Alternativa si lo prefieres: lo asigno yo directamente por base de datos a tu cuenta y no existe ninguna acción de arranque.

## 5. Reparto por fases (una aprobación por fase)

**Fase A — base de roles y seguridad**
Rol admin, campos de estado en perfiles, `coach_clients` con histórico, `audit_logs`, nuevas reglas de acceso, tu cuenta convertida en admin. El panel de coach deja de poder crear clientes.

**Fase B — panel de administración** (`/admin`)
Resumen (total de clientes, activos, coaches, clientes sin coach, con avisos abiertos, sin actividad, por fase, progreso medio, próximas sesiones, altas recientes, últimos cambios de coach), y secciones Clientes, Coaches, Asignaciones, Registro de actividad. Altas "Nuevo cliente" y "Nuevo coach" por invitación, con validación de correo duplicado, alta del progreso de los 8 módulos y aviso claro si el cliente queda sin coach. Cambio de coach con pantalla de confirmación que muestra cliente, coach anterior, coach nuevo y consecuencias.

**Fase C — notificaciones y actividad**
Centro de notificaciones dentro de la aplicación con contador de no leídas y enlace a la ficha relacionada; avisos por asignación, módulo completado, aviso nuevo, sesión próxima, inactividad (7 días informativo, 14 días prioritario) y cambios de cuenta. Panel de coach con filtros por fase, estado y nivel de atención, última actividad e indicador de inactividad.

Los correos automáticos quedan **preparados pero desactivados**: las notificaciones se guardan y se muestran dentro de la aplicación; cuando conectes el envío de correo, se activan sin rehacer nada.

## 6. Claude

Sin cambios de comportamiento: la clave sigue solo en el servidor y el contexto enviado sigue limitado al cliente autorizado. Se añade la comprobación de asignación activa y el registro en el histórico cuando el admin consulta la ficha de un cliente.

## Nota técnica

Nuevo tipo `platform_admin` en `app_role`; `has_role` se reutiliza y se añade `is_platform_admin(uuid)` y `is_active_coach_of(coach, client)` como funciones security definer. Las políticas de `profiles`, `coach_clients`, `module_progress`, `deliverables`, `flags` y `sessions_1_1` se amplían con la rama admin y se endurece la rama coach. `notifications` y `audit_logs` con GRANT explícitos; los registros de auditoría solo los escribe el servidor con clave de servicio y los lee únicamente el admin.
