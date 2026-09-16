import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { getMyRole } from "@/lib/program.functions";

/** Zona del coach: solo accesible con rol coach; el contenido vive en coach/ */
export const Route = createFileRoute("/_authenticated/coach")({
  loader: async () => {
    const { role } = await getMyRole();
    if (role !== "coach" && role !== "platform_admin") throw redirect({ to: "/dashboard" });
  },
  component: () => <Outlet />,
});
