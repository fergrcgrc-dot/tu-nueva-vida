import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { getMyRole } from "@/lib/program.functions";

/** Zona de administración: solo rol platform_admin, comprobado en servidor. */
export const Route = createFileRoute("/_authenticated/admin")({
  loader: async () => {
    const { role } = await getMyRole();
    if (role !== "platform_admin") throw redirect({ to: "/dashboard" });
  },
  component: () => <Outlet />,
});
