import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Flame, LogOut } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

/** Cabecera común de las zonas privadas con cierre de sesión seguro. */
export function AppHeader({ section }: { section: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <header className="border-b border-border bg-card/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="ember-glow flex h-8 w-8 items-center justify-center rounded-full bg-accent">
            <Flame className="h-4 w-4 text-primary" aria-hidden />
          </span>
          <div>
            <p className="font-display text-sm font-semibold text-foreground">
              Tu Nueva Vida
            </p>
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              {section}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden />
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
