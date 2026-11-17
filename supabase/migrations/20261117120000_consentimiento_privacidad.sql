-- Consentimiento explícito (RGPD art. 9.2.a) para tratar los datos de salud
-- emocional que el usuario comparte en los ejercicios con el coach IA.
-- Se registra al crear la contraseña tras la compra.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS privacy_consent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS privacy_policy_version TEXT;
