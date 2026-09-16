
-- Estados
CREATE TYPE public.account_status AS ENUM ('active', 'inactive', 'blocked');
CREATE TYPE public.assignment_status AS ENUM ('active', 'inactive');

-- Perfiles
ALTER TABLE public.profiles
  ADD COLUMN status public.account_status NOT NULL DEFAULT 'active',
  ADD COLUMN admin_notes TEXT,
  ADD COLUMN timezone TEXT,
  ADD COLUMN last_active_at TIMESTAMPTZ;

-- Asignaciones con histórico
ALTER TABLE public.coach_clients
  ADD COLUMN assigned_by UUID,
  ADD COLUMN assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN unassigned_at TIMESTAMPTZ,
  ADD COLUMN status public.assignment_status NOT NULL DEFAULT 'active',
  ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.coach_clients DROP CONSTRAINT IF EXISTS coach_clients_coach_id_client_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS coach_clients_one_active_per_client
  ON public.coach_clients (client_id) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS coach_clients_coach_active_idx
  ON public.coach_clients (coach_id) WHERE status = 'active';

CREATE TRIGGER update_coach_clients_updated_at
  BEFORE UPDATE ON public.coach_clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Funciones de autorización
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'platform_admin'::public.app_role
  )
$$;

-- is_coach_of pasa a exigir asignación activa (endurece todas las políticas existentes)
CREATE OR REPLACE FUNCTION public.is_coach_of(_coach_id uuid, _client_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.coach_clients
    WHERE coach_id = _coach_id
      AND client_id = _client_id
      AND status = 'active'
      AND unassigned_at IS NULL
  )
$$;

CREATE OR REPLACE FUNCTION public.is_active_coach_of(_coach_id uuid, _client_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_coach_of(_coach_id, _client_id)
$$;

-- Registro de actividad administrativa
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read audit logs" ON public.audit_logs
  FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs (created_at DESC);

-- Políticas de administrador
CREATE POLICY "Admins read all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Admins update profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE POLICY "Admins read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Admins read all assignments" ON public.coach_clients
  FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Admins create assignments" ON public.coach_clients
  FOR INSERT TO authenticated WITH CHECK (public.is_platform_admin(auth.uid()));
CREATE POLICY "Admins update assignments" ON public.coach_clients
  FOR UPDATE TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- Los coaches ya no dan de alta asignaciones
DROP POLICY IF EXISTS "Coaches assign clients" ON public.coach_clients;

CREATE POLICY "Admins read all progress" ON public.module_progress
  FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Admins read all deliverables" ON public.deliverables
  FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Admins read all flags" ON public.flags
  FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Admins read all sessions" ON public.sessions_1_1
  FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Admins read all follow ups" ON public.follow_ups
  FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));

-- Asignaciones existentes quedan como activas y atribuidas al propio coach
UPDATE public.coach_clients SET assigned_by = coach_id WHERE assigned_by IS NULL;
