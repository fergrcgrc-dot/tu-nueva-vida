CREATE TYPE public.next_step AS ENUM ('acompanamiento_1_1', 'retiro_leon');

ALTER TABLE public.sessions_1_1 ADD COLUMN next_step_recommended public.next_step;

CREATE TYPE public.follow_up_status AS ENUM ('pending', 'completed');

CREATE TABLE public.follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_offset integer NOT NULL,
  due_at timestamptz NOT NULL,
  status public.follow_up_status NOT NULL DEFAULT 'pending',
  summary text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, day_offset)
);

GRANT SELECT, INSERT, UPDATE ON public.follow_ups TO authenticated;
GRANT ALL ON public.follow_ups TO service_role;

ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients read own follow ups" ON public.follow_ups
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Clients update own follow ups" ON public.follow_ups
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches read client follow ups" ON public.follow_ups
  FOR SELECT TO authenticated USING (public.is_coach_of(auth.uid(), user_id));

CREATE TRIGGER update_follow_ups_updated_at
  BEFORE UPDATE ON public.follow_ups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();