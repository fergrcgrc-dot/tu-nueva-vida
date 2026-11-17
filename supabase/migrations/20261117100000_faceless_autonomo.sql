-- Programa faceless y autónomo:
--  1. Compras (Lemon Squeezy) con alta automática de la cuenta.
--  2. Ejercicios dentro de la plataforma con revisión por el coach IA.
--  3. Vídeo de teoría por módulo (bucket privado).
--  4. El avance de módulo solo lo hace el servidor (tras aprobar el ejercicio).

-- ===== 1. Compras =====
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'lemonsqueezy',
  order_id TEXT NOT NULL,
  email TEXT NOT NULL,
  customer_name TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'refunded')),
  total_cents INTEGER,
  currency TEXT,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, order_id)
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.purchases FROM anon, authenticated;
GRANT SELECT ON public.purchases TO authenticated;
GRANT ALL ON public.purchases TO service_role;

CREATE POLICY "Users read own purchases" ON public.purchases
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all purchases" ON public.purchases
  FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));

CREATE TRIGGER purchases_updated_at BEFORE UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== 2. Ejercicios y revisión del coach IA =====
DO $$ BEGIN
  CREATE TYPE public.submission_status AS ENUM ('draft', 'submitted', 'needs_revision', 'approved');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.exercise_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  status public.submission_status NOT NULL DEFAULT 'draft',
  feedback JSONB,
  attempts INTEGER NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_id)
);

ALTER TABLE public.exercise_submissions ENABLE ROW LEVEL SECURITY;
-- Solo lectura para el cliente: guardar, enviar y revisar pasa por el
-- servidor, para que nadie pueda autoaprobarse un ejercicio.
REVOKE ALL ON public.exercise_submissions FROM anon, authenticated;
GRANT SELECT ON public.exercise_submissions TO authenticated;
GRANT ALL ON public.exercise_submissions TO service_role;

CREATE POLICY "Clients read own submissions" ON public.exercise_submissions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all submissions" ON public.exercise_submissions
  FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));

CREATE TRIGGER exercise_submissions_updated_at BEFORE UPDATE ON public.exercise_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== 3. Vídeo de teoría por módulo =====
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS video_path TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('module-videos', 'module-videos', false)
ON CONFLICT (id) DO NOTHING;
-- Sin políticas públicas: el servidor firma URLs temporales solo para
-- módulos desbloqueados del propio cliente.

-- ===== 4. Avance de módulo solo desde el servidor =====
-- complete_module recibe _user_id y es SECURITY DEFINER: si lo puede llamar
-- cualquier usuario autenticado, podría saltarse la revisión o completar
-- módulos de otra persona. Pasa a ser exclusivo de service_role.
REVOKE EXECUTE ON FUNCTION public.complete_module(UUID, UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.complete_module(UUID, UUID) TO service_role;

-- start_module: solo sobre uno mismo.
CREATE OR REPLACE FUNCTION public.start_module(_user_id UUID, _module_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> _user_id THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  UPDATE public.module_progress
  SET status = 'in_progress', started_at = COALESCE(started_at, now())
  WHERE user_id = _user_id AND module_id = _module_id AND status = 'unlocked';
END;
$$;
