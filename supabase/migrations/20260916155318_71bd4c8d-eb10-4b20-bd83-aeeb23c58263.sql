-- ===== Enums =====
CREATE TYPE public.app_role AS ENUM ('client', 'coach');
CREATE TYPE public.module_status AS ENUM ('locked', 'unlocked', 'in_progress', 'completed');
CREATE TYPE public.flag_status AS ENUM ('open', 'reviewed');
CREATE TYPE public.session_status AS ENUM ('pending', 'scheduled', 'completed');

-- ===== profiles =====
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'client',
  full_name TEXT,
  program_start_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (full_name) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ===== user_roles (authoritative roles) =====
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ===== has_role =====
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ===== modules =====
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_number INT NOT NULL CHECK (phase_number BETWEEN 1 AND 4),
  phase_name TEXT NOT NULL,
  week_number INT NOT NULL UNIQUE CHECK (week_number BETWEEN 1 AND 8),
  title TEXT NOT NULL,
  objective TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.modules TO authenticated;
GRANT ALL ON public.modules TO service_role;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- ===== module_progress =====
CREATE TABLE public.module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  status public.module_status NOT NULL DEFAULT 'locked',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_id)
);
GRANT SELECT ON public.module_progress TO authenticated;
GRANT ALL ON public.module_progress TO service_role;
ALTER TABLE public.module_progress ENABLE ROW LEVEL SECURITY;

-- ===== deliverables =====
CREATE TABLE public.deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.deliverables TO authenticated;
GRANT ALL ON public.deliverables TO service_role;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;

-- ===== flags =====
CREATE TABLE public.flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.modules(id) ON DELETE SET NULL,
  trigger_type TEXT NOT NULL,
  status public.flag_status NOT NULL DEFAULT 'open',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.flags TO authenticated;
GRANT ALL ON public.flags TO service_role;
ALTER TABLE public.flags ENABLE ROW LEVEL SECURITY;

-- ===== sessions_1_1 =====
CREATE TABLE public.sessions_1_1 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  phase_number INT NOT NULL CHECK (phase_number BETWEEN 1 AND 4),
  scheduled_at TIMESTAMPTZ,
  status public.session_status NOT NULL DEFAULT 'pending',
  coach_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, phase_number)
);
GRANT SELECT, INSERT, UPDATE ON public.sessions_1_1 TO authenticated;
GRANT ALL ON public.sessions_1_1 TO service_role;
ALTER TABLE public.sessions_1_1 ENABLE ROW LEVEL SECURITY;

-- ===== coach_clients =====
CREATE TABLE public.coach_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (coach_id, client_id)
);
GRANT SELECT, INSERT ON public.coach_clients TO authenticated;
GRANT ALL ON public.coach_clients TO service_role;
ALTER TABLE public.coach_clients ENABLE ROW LEVEL SECURITY;

-- ===== is_coach_of helper =====
CREATE OR REPLACE FUNCTION public.is_coach_of(_coach_id UUID, _client_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.coach_clients
    WHERE coach_id = _coach_id AND client_id = _client_id
  )
$$;

-- ===== updated_at trigger =====
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_module_progress_updated_at BEFORE UPDATE ON public.module_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_deliverables_updated_at BEFORE UPDATE ON public.deliverables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_flags_updated_at BEFORE UPDATE ON public.flags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions_1_1 FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== RLS: profiles =====
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);
CREATE POLICY "Coaches read their clients" ON public.profiles FOR SELECT TO authenticated
  USING (public.is_coach_of(auth.uid(), id));
CREATE POLICY "Users update own profile name" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND role IS NOT DISTINCT FROM (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()));
CREATE POLICY "Coaches update client name and start date" ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_coach_of(auth.uid(), id))
  WITH CHECK (public.is_coach_of(auth.uid(), id) AND role IS NOT DISTINCT FROM (SELECT p.role FROM public.profiles p WHERE p.id = profiles.id));

-- ===== RLS: user_roles =====
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Coaches read client roles" ON public.user_roles FOR SELECT TO authenticated
  USING (public.is_coach_of(auth.uid(), user_id));

-- ===== RLS: modules =====
CREATE POLICY "Authenticated users read modules" ON public.modules FOR SELECT TO authenticated
  USING (true);

-- ===== RLS: module_progress (writes only via security-definer functions) =====
CREATE POLICY "Clients read own progress" ON public.module_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Coaches read client progress" ON public.module_progress FOR SELECT TO authenticated
  USING (public.is_coach_of(auth.uid(), user_id));

-- ===== RLS: deliverables =====
CREATE POLICY "Clients read own deliverables" ON public.deliverables FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Coaches read client deliverables" ON public.deliverables FOR SELECT TO authenticated
  USING (public.is_coach_of(auth.uid(), user_id));
CREATE POLICY "Clients create own deliverables" ON public.deliverables FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Clients update own deliverables" ON public.deliverables FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===== RLS: flags =====
CREATE POLICY "Clients read own flags" ON public.flags FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Coaches manage client flags" ON public.flags FOR ALL TO authenticated
  USING (public.is_coach_of(auth.uid(), user_id))
  WITH CHECK (public.is_coach_of(auth.uid(), user_id));

-- ===== RLS: sessions_1_1 (coach_notes hidden from clients via column grant) =====
REVOKE UPDATE ON public.sessions_1_1 FROM authenticated;
GRANT UPDATE (scheduled_at, status, coach_notes) ON public.sessions_1_1 TO authenticated;
CREATE POLICY "Clients read own sessions" ON public.sessions_1_1 FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Coaches manage client sessions" ON public.sessions_1_1 FOR ALL TO authenticated
  USING (public.is_coach_of(auth.uid(), user_id))
  WITH CHECK (public.is_coach_of(auth.uid(), user_id));

-- ===== RLS: coach_clients =====
CREATE POLICY "Coaches read own assignments" ON public.coach_clients FOR SELECT TO authenticated
  USING (auth.uid() = coach_id);
CREATE POLICY "Clients read own coach" ON public.coach_clients FOR SELECT TO authenticated
  USING (auth.uid() = client_id);
CREATE POLICY "Coaches assign clients" ON public.coach_clients FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = coach_id AND public.has_role(auth.uid(), 'coach'));

-- ===== Safe progression: initialize 8 progress rows for a new client =====
CREATE OR REPLACE FUNCTION public.initialize_client_progress(_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.module_progress (user_id, module_id, status)
  SELECT _user_id, m.id,
         CASE WHEN m.week_number = 1 THEN 'unlocked'::public.module_status ELSE 'locked'::public.module_status END
  FROM public.modules m
  ON CONFLICT (user_id, module_id) DO NOTHING;

  INSERT INTO public.sessions_1_1 (user_id, phase_number)
  SELECT _user_id, g FROM generate_series(1, 4) AS g
  ON CONFLICT (user_id, phase_number) DO NOTHING;
END;
$$;

-- ===== Safe progression: complete a module, unlock the next one =====
CREATE OR REPLACE FUNCTION public.complete_module(_user_id UUID, _module_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_week INT;
  v_status public.module_status;
BEGIN
  SELECT week_number INTO v_week FROM public.modules WHERE id = _module_id;
  IF v_week IS NULL THEN
    RAISE EXCEPTION 'module_not_found';
  END IF;

  SELECT status INTO v_status FROM public.module_progress
  WHERE user_id = _user_id AND module_id = _module_id;
  IF v_status IS NULL THEN
    RAISE EXCEPTION 'progress_not_found';
  END IF;
  IF v_status = 'completed' THEN
    RETURN;
  END IF;
  IF v_status = 'locked' THEN
    RAISE EXCEPTION 'module_locked';
  END IF;

  UPDATE public.module_progress
  SET status = 'completed', completed_at = now()
  WHERE user_id = _user_id AND module_id = _module_id;

  IF v_week < 8 THEN
    UPDATE public.module_progress mp
    SET status = 'unlocked'
    FROM public.modules m
    WHERE m.id = mp.module_id
      AND mp.user_id = _user_id
      AND m.week_number = v_week + 1
      AND mp.status = 'locked';
  END IF;
END;
$$;

-- ===== Safe progression: mark an unlocked module as in_progress =====
CREATE OR REPLACE FUNCTION public.start_module(_user_id UUID, _module_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.module_progress
  SET status = 'in_progress', started_at = COALESCE(started_at, now())
  WHERE user_id = _user_id AND module_id = _module_id AND status = 'unlocked';
END;
$$;

-- ===== Seed: the 8 modules =====
INSERT INTO public.modules (phase_number, phase_name, week_number, title, objective) VALUES
  (1, 'Espejo', 1, 'Diagnóstico honesto de la situación actual', 'Confrontar la situación actual sin justificaciones y nombrar el coste real de seguir igual.'),
  (1, 'Espejo', 2, 'Los momentos que sí funcionaron', 'Identificar patrones reales de energía basados en hechos vividos.'),
  (2, 'Fricción', 3, 'Lo que te está costando no cambiar', 'Confrontar creencias limitantes y autoengaño protector.'),
  (2, 'Fricción', 4, 'El precio que estás dispuesto a pagar', 'Decidir conscientemente qué se está dispuesto a arriesgar.'),
  (3, 'Dirección', 5, 'Tres futuros posibles', 'Generar direcciones concretas sin autocensura.'),
  (3, 'Dirección', 6, 'Filtro y elección', 'Priorizar una o dos direcciones con criterios explícitos.'),
  (4, 'Acción y validación', 7, 'Experimentos de bajo riesgo', 'Convertir la dirección elegida en hipótesis verificables.'),
  (4, 'Acción y validación', 8, 'Plan a 90 días y cierre', 'Cerrar con un plan de acción con hitos.');