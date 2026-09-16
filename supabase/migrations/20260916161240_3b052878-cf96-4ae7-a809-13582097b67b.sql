CREATE POLICY "Clients create own flags"
ON public.flags
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND status = 'open'::flag_status);