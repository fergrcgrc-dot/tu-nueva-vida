import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowLeft, Send, CheckCircle2 } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { askFollowUpClaude, closeFollowUp } from "@/lib/claude.functions";
import { getDashboard, getMyRole } from "@/lib/program.functions";

const followUpQuery = (followUpId: string) =>
  queryOptions({
    queryKey: ["follow-up", followUpId],
    queryFn: async () => {
      const dashboard = await getDashboard();
      const followUp = dashboard.followUps.find((f) => f.id === followUpId);
      if (!followUp) throw new Error("Este seguimiento no existe.");
      return followUp;
    },
  });

export const Route = createFileRoute("/_authenticated/seguimientos/$followUpId")({
  params: { parse: (p) => ({ followUpId: String(p.followUpId) }) },
  loader: async ({ context, params }) => {
    const { role } = await getMyRole();
    if (role === "coach") throw redirect({ to: "/coach" });
    await context.queryClient.ensureQueryData(followUpQuery(params.followUpId));
  },
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
      <p className="text-sm text-muted-foreground">
        {error instanceof Error ? error.message : "No se pudo cargar el seguimiento."}
      </p>
      <Link to="/dashboard" className="text-sm font-medium text-primary hover:underline">
        Volver al panel
      </Link>
    </div>
  ),
  component: FollowUpPage,
});

type ChatMessage = { role: "user" | "assistant"; content: string };

function FollowUpPage() {
  const { followUpId } = Route.useParams();
  const { data: followUp } = useSuspenseQuery(followUpQuery(followUpId));
  const queryClient = useQueryClient();

  const callChat = useServerFn(askFollowUpClaude);
  const callClose = useServerFn(closeFollowUp);

  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || sending) return;
    setSending(true);
    setInput("");
    setChat((c) => [...c, { role: "user", content: message }]);
    try {
      const reply = await callChat({
        data: { followUpId, message, history: chat.slice(-20) },
      });
      setChat((c) => [...c, { role: "assistant", content: reply.message }]);
      if (reply.escalated) {
        toast(
          reply.escalation_message ??
            "Se lo hemos trasladado a tu coach para retomarlo contigo.",
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo hablar con la guía.");
    } finally {
      setSending(false);
    }
  }

  async function handleClose() {
    if (closing || chat.length === 0) return;
    setClosing(true);
    try {
      await callClose({ data: { followUpId, history: chat.slice(-40) } });
      toast.success("Seguimiento cerrado. Tu coach verá el resumen.");
      await queryClient.invalidateQueries();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cerrar el seguimiento.");
    } finally {
      setClosing(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader section="Mi programa" />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Volver al panel
        </Link>

        <header className="mb-8">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Seguimiento · {followUp.day_offset} días
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">
            ¿Cómo va tu plan a 90 días?
          </h1>
          <p className="mt-3 text-muted-foreground">
            Una conversación breve para ver qué avanza y qué se ha quedado parado.
          </p>
        </header>

        <section className="card-depth rounded-2xl p-6">
          <div className="max-h-96 space-y-4 overflow-y-auto pr-1">
            {chat.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Cuéntale a tu guía cómo llevas los hitos de tu hoja de ruta.
              </p>
            )}
            {chat.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {m.content}
              </div>
            ))}
            {sending && (
              <p className="text-sm text-muted-foreground">La guía está escribiendo…</p>
            )}
          </div>
          <form onSubmit={handleSend} className="mt-4 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe a tu guía…"
              className="flex-1 rounded-lg border border-input bg-secondary px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" aria-hidden />
            </button>
          </form>

          {followUp.status === "pending" && (
            <button
              onClick={handleClose}
              disabled={closing || chat.length === 0}
              className="ember-glow mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              {closing ? "Cerrando…" : "Cerrar seguimiento"}
            </button>
          )}
        </section>
      </main>
    </div>
  );
}
