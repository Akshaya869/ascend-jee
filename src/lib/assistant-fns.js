import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";

const Message = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const SYSTEM = `You are Ascend Coach, the study assistant inside a JEE + CBSE Class 12 study planner.
Rules:
- You coach an Indian student preparing for JEE Main/Advanced and Class 12 boards.
- Use the student data snapshot when it is relevant. Never invent numbers that are not in it.
- Be tight: at most 8 short lines or 5 bullets, no filler, never restate the question.
- Prefer concrete actions: which chapter, how many minutes, what to do first.
- Plain text only. No markdown headings, tables or bold. "- " bullets are fine.
- Questions about sleep, motivation or burnout get a short, useful answer.`;

export const askAssistant = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      messages: z.array(Message).min(1).max(20),
      context: z.string().max(8000).optional(),
    })
  )
  .handler(async ({ data, context }) => {
    const history = data.messages
      .slice(-12)
      .map((m) => `${m.role === "user" ? "Student" : "Coach"}: ${m.content}`)
      .join("\n");

    const prompt = [
      SYSTEM,
      "",
      "STUDENT DATA SNAPSHOT:",
      data.context || "(no data available yet)",
      "",
      "CONVERSATION:",
      history,
      "Coach:",
    ].join("\n");

    const reply = await context
      .getBase44()
      .asServiceRole.integrations.Core.InvokeLLM({ prompt });

    return { reply: typeof reply === "string" ? reply.trim() : String(reply ?? "").trim() };
  });