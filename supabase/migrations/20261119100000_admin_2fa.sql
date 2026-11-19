-- 2FA obligatorio para administradores: los permisos de admin en la base de
-- datos (políticas RLS que usan is_platform_admin) solo se aplican si la
-- sesión está verificada con el segundo factor (aal2). Con solo contraseña
-- (aal1) la cuenta de admin no ve nada que no sea suyo.
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (
      auth.uid() IS NULL  -- servidor (service_role)
      OR (auth.uid() = _user_id AND coalesce(auth.jwt() ->> 'aal', '') = 'aal2')
    )
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id AND role = 'platform_admin'::public.app_role
    )
$$;
