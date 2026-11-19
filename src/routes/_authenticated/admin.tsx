import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import { getMyRole } from "@/lib/program.functions";

/**
 * Zona de administración: rol platform_admin (comprobado en servidor) y
 * sesión verificada con 2FA (aal2). beforeLoad corre antes que los loaders
 * hijos, así ninguna llamada de admin sale sin pasar por aquí.
 */
export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { role } = await getMyRole();
    if (role !== "platform_admin") throw redirect({ to: "/dashboard" });

    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (data?.currentLevel !== "aal2") {
      throw redirect({ to: "/verificacion-2fa" });
    }
  },
  component: () => <Outlet />,
});
