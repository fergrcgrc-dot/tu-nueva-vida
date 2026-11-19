-- ===== Compras del programa vía Stripe Checkout =====
-- Una fila por Checkout Session pagada. La escribe solo el webhook de Stripe
-- (service_role). Los administradores pueden leerla desde el panel.

CREATE TYPE public.purchase_status AS ENUM (
  'pending',             -- sesión completada, pago asíncrono aún sin confirmar
  'paid',
  'failed',
  'refunded',
  'partially_refunded'
);

CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_checkout_session_id TEXT NOT NULL UNIQUE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_invoice_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  currency TEXT NOT NULL,
  amount_total INTEGER NOT NULL,          -- céntimos, IVA incluido
  amount_tax INTEGER NOT NULL DEFAULT 0,  -- céntimos
  amount_refunded INTEGER NOT NULL DEFAULT 0,
  status public.purchase_status NOT NULL DEFAULT 'pending',
  livemode BOOLEAN NOT NULL DEFAULT false,
  -- Nota operativa (p. ej. "el email ya tenía cuenta"): para revisar a mano.
  provisioning_note TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX purchases_user_id_idx ON public.purchases (user_id);
CREATE INDEX purchases_email_idx ON public.purchases (lower(email));

GRANT SELECT ON public.purchases TO authenticated;
GRANT ALL ON public.purchases TO service_role;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read purchases" ON public.purchases
  FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Users read own purchases" ON public.purchases
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.touch_purchases_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER purchases_set_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.touch_purchases_updated_at();
