/**
 * Utilidades de IA solo de servidor. Se importan de forma dinámica dentro
 * de los handlers de server functions, nunca desde el navegador.
 */

/** Modelo fijado en servidor. El frontend nunca envía ni decide el modelo. */
export const CLAUDE_MODEL = "claude-sonnet-5";

export function safeError(message: string): Error {
  return new Error(message);
}

/** Llamada al proveedor. Nunca registra ni devuelve la clave. */
export async function callClaude(
  system: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  maxTokens = 2048,
): Promise<string> {
  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) {
    throw safeError("Falta configurar el secreto ANTHROPIC_API_KEY en el hosting.");
  }

  let res: Response;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: maxTokens, system, messages }),
      signal: AbortSignal.timeout(60_000),
    });
  } catch {
    throw safeError("El coach está tardando demasiado. Inténtalo de nuevo en unos segundos.");
  }

  if (!res.ok) {
    if (res.status === 429) {
      throw safeError(
        "Se ha alcanzado el límite de uso por ahora. Espera un momento e inténtalo de nuevo.",
      );
    }
    console.error(`[claude] Anthropic respondió ${res.status}`);
    throw safeError("No se pudo conectar con el coach. Inténtalo de nuevo.");
  }

  let payload: { content?: Array<{ type: string; text?: string }> };
  try {
    payload = (await res.json()) as typeof payload;
  } catch {
    throw safeError("La respuesta del coach no fue válida. Inténtalo de nuevo.");
  }

  const text = (payload.content ?? [])
    .filter((part) => part.type === "text" && part.text)
    .map((part) => part.text)
    .join("\n")
    .trim();
  if (!text) throw safeError("La respuesta del coach no fue válida. Inténtalo de nuevo.");
  return text;
}

/** Extrae el primer objeto JSON de una respuesta (tolera ```json …```). */
export function parseJsonObject(text: string): unknown {
  const clean = text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
  try {
    return JSON.parse(clean);
  } catch {
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(clean.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

/** Mensaje y recursos que se muestran ante lenguaje de crisis. */
export const CRISIS_MESSAGE =
  "Lo que estás contando es importante y merece una atención que este programa no puede darte. Si sientes que no puedes más o tienes pensamientos de hacerte daño, llama ahora al 024 (atención a la conducta suicida, gratuita y 24 h) o al 112 si es una emergencia. También puedes acudir a tu médico de cabecera. El programa te espera aquí cuando quieras retomarlo.";
