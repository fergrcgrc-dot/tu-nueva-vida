-- Revisión de seguridad (17/11/2026).
-- Principio: el navegador solo lee lo suyo; todas las escrituras sensibles
-- pasan por el servidor (service_role) tras validar sesión, rol y datos.

-- ===== 1. Privilegios mínimos por tabla =====
-- Supabase concede por defecto TODOS los privilegios a anon y authenticated y
-- delega en RLS. Aquí se quitan los que no hacen falta (incluido TRUNCATE,
-- que RLS no filtra) para que un fallo en una política no abra la tabla.
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  END LOOP;
END $$;

-- Lectura (siempre filtrada por RLS)
GRANT SELECT ON public.audit_logs, public.coach_clients, public.deliverables,
  public.exercise_submissions, public.flags, public.follow_ups,
  public.module_progress, public.modules, public.profiles, public.purchases,
  public.sessions_1_1, public.user_roles TO authenticated;

-- Escrituras que todavía hace el navegador o el servidor con la sesión del usuario
GRANT UPDATE (full_name, privacy_consent_at, privacy_policy_version) ON public.profiles TO authenticated;
GRANT UPDATE (status, completed_at, summary) ON public.follow_ups TO authenticated;
GRANT UPDATE (status) ON public.flags TO authenticated;
GRANT UPDATE (scheduled_at, status, coach_notes) ON public.sessions_1_1 TO authenticated;
GRANT INSERT, UPDATE ON public.coach_clients TO authenticated;

-- Políticas que ya no tienen sentido en el programa autónomo
DROP POLICY IF EXISTS "Clients create own flags" ON public.flags;
DROP POLICY IF EXISTS "Clients create own deliverables" ON public.deliverables;
DROP POLICY IF EXISTS "Clients update own deliverables" ON public.deliverables;

-- El contenido del programa solo lo leen cuentas activas (o administradores)
DROP POLICY IF EXISTS "Authenticated users read modules" ON public.modules;
CREATE POLICY "Active members read modules" ON public.modules
  FOR SELECT TO authenticated
  USING (
    public.is_platform_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.status = 'active'
    )
  );

-- ===== 2. Funciones SECURITY DEFINER: no permitir consultar a terceros =====
-- Las políticas RLS las llaman siempre con auth.uid(); el servidor
-- (service_role) llega con auth.uid() nulo. Cualquier otra combinación
-- devuelve false para no filtrar roles de otras personas.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (auth.uid() IS NULL OR auth.uid() = _user_id)
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (auth.uid() IS NULL OR auth.uid() = _user_id)
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'platform_admin'::public.app_role)
$$;

CREATE OR REPLACE FUNCTION public.is_coach_of(_coach_id uuid, _client_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (auth.uid() IS NULL OR auth.uid() = _coach_id)
    AND EXISTS (
      SELECT 1 FROM public.coach_clients
      WHERE coach_id = _coach_id AND client_id = _client_id
        AND status = 'active' AND unassigned_at IS NULL
    )
$$;

-- ===== 3. Límite de peticiones (por usuario) =====
CREATE TABLE IF NOT EXISTS public.rate_limit_events (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL,
  bucket text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS rate_limit_events_lookup
  ON public.rate_limit_events (user_id, bucket, created_at DESC);
ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rate_limit_events FROM anon, authenticated;
GRANT ALL ON public.rate_limit_events TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.rate_limit_events_id_seq TO service_role;

-- Registra un uso del cubo y devuelve false si se supera el máximo en la
-- ventana. Siempre sobre el usuario de la sesión (auth.uid()).
CREATE OR REPLACE FUNCTION public.consume_rate_limit(_bucket text, _max integer, _window_seconds integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user uuid := auth.uid();
  v_count integer;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;
  IF _bucket !~ '^[a-z_]{1,40}$' OR _max < 1 OR _window_seconds < 1 OR _window_seconds > 86400 THEN
    RAISE EXCEPTION 'invalid_rate_limit';
  END IF;

  SELECT count(*) INTO v_count FROM public.rate_limit_events
  WHERE user_id = v_user AND bucket = _bucket
    AND created_at > now() - make_interval(secs => _window_seconds);

  IF v_count >= _max THEN
    RETURN false;
  END IF;

  INSERT INTO public.rate_limit_events (user_id, bucket) VALUES (v_user, _bucket);
  -- Limpieza oportunista: nada de más de 2 días.
  DELETE FROM public.rate_limit_events
  WHERE user_id = v_user AND created_at < now() - interval '2 days';
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_rate_limit(text, integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text, integer, integer) TO authenticated;

-- ===== 4. Almacenamiento: solo vídeos MP4 de hasta 100 MB =====
UPDATE storage.buckets
SET file_size_limit = 104857600, allowed_mime_types = ARRAY['video/mp4']
WHERE id = 'module-videos';
