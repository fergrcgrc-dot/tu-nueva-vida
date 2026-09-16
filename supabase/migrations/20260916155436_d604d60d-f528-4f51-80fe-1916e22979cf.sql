REVOKE EXECUTE ON FUNCTION public.initialize_client_progress(UUID) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, public, authenticated;