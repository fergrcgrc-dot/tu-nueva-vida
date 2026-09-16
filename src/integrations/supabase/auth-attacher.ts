import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "./client";

/**
 * Attaches the current Supabase session as a bearer token to every server
 * function call so `requireSupabaseAuth` can authenticate the request.
 */
export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const headers = new Headers();
    if (session?.access_token) {
      headers.set("Authorization", `Bearer ${session.access_token}`);
    }

    return next({ headers });
  },
);
