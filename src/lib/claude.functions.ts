import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ClaudeInput = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      }),
    )
    .min(1),
  system: z.string().optional(),
  model: z.string().default("claude-sonnet-5"),
  maxTokens: z.number().int().min(1).max(8192).default(1024),
});

export type ClaudeInput = z.infer<typeof ClaudeInput>;

/**
 * Server-only call to Anthropic. The API key is read from the ANTHROPIC_API_KEY
 * secret inside the handler and never reaches the browser.
 */
export const askClaude = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ClaudeInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["ANTHROPIC_API_KEY"];
    if (!apiKey) {
      throw new Error(
        "Missing ANTHROPIC_API_KEY. Add it as a backend secret before using this feature.",
      );
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: data.model,
        max_tokens: data.maxTokens,
        ...(data.system ? { system: data.system } : {}),
        messages: data.messages,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Anthropic request failed (${res.status}): ${detail.slice(0, 500)}`);
    }

    const payload = (await res.json()) as {
      content?: Array<{ type: string; text?: string }>;
      stop_reason?: string | null;
      usage?: { input_tokens: number; output_tokens: number };
    };

    const text = (payload.content ?? [])
      .filter((part) => part.type === "text" && part.text)
      .map((part) => part.text)
      .join("\n")
      .trim();

    return {
      text,
      stopReason: payload.stop_reason ?? null,
      usage: payload.usage ?? null,
    };
  });
