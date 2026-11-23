import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { askAssistant } from "@/lib/assistant-fns";
import { addDays, toISO } from "@/lib/plan";
import { useEntityList } from "@/lib/useEntityList";
import { useProfile } from "@/lib/useProfile";
import { useSyllabus } from "@/lib/useSyllabus";
import { buildSnapshot } from "@/lib/studySnapshot";
import ChatBubble from "@/components/assistant/ChatBubble";

export const Route = createFileRoute("/_authed/assistant")({
  ssr: false,
  component: AssistantPage,
  head: () => ({ meta: [{ title: "Coach · Ascend" }] }),
});

const GREETING = {
  role: "assistant",
  content:
    "I can see your syllabus, today's blocks and your recent tests. Ask me what to study next, why a subject is slipping, or how to spend the next three hours.",
};

const QUICK = [
  "What should I study in the next 3 hours?",
  "Which chapter is costing me the most marks?",
  "Am I on track for my exam date?",
  "How do I fix my weakest subject?",
];

function AssistantPage() {
  const ask = useServerFn(askAssistant);
  const { profile } = useProfile();
  const { chapters } = useSyllabus();
  const { items: tasks } = useEntityList("Task", { date: toISO() }, "created_date", 50);
  const { items: sessions } = useEntityList(
    "StudySession",
    { date: { $gte: addDays(toISO(), -13) } },
    "-created_date",
    300
  );
  const { items: tests } = useEntityList("MockTest", {}, "-test_date", 10);

  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scroller = useRef(null);

  const scrollDown = () => {
    requestAnimationFrame(() => {
      const el = scroller.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  };

  const send = async (text) => {
    const question = (text ?? input).trim();
    if (!question || sending) return;
    const next = [...messages, { role: "user", content: question }];
    setMessages(next);
    setInput("");
    setSending(true);
    scrollDown();
    try {
      const context = buildSnapshot({
        profile,
        chapters,
        tasks,
        sessions,
        tests,
      });
      const result = await ask({ data: { messages: next, context } });
      setMessages([...next, { role: "assistant", content: result.reply || "I could not answer that." }]);
    } catch {
      toast.error("The coach could not reply. Try again.");
    } finally {
      setSending(false);
      scrollDown();
    }
  };

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">Study coach</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">Ask Ascend.</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          It reads your syllabus, today's plan and your mock scores before answering.
        </p>
      </header>

      <section className="surface flex h-[calc(100vh-280px)] min-h-[420px] flex-col overflow-hidden">
        <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto p-5">
          {messages.map((message, index) => (
            <ChatBubble key={index} role={message.role} content={message.content} />
          ))}
          {sending && (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Coach is reading your data…
            </div>
          )}
        </div>

        <div className="border-t border-white/[0.06] p-4">
          <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">
            {QUICK.map((prompt) => (
              <button
                key={prompt}
                onClick={() => send(prompt)}
                disabled={sending}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-muted-foreground transition hover:bg-white/5 hover:text-foreground disabled:opacity-40"
              >
                <Sparkles className="h-3 w-3" />
                {prompt}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send();
                }
              }}
              rows={2}
              placeholder="Ask about a chapter, a plan, a score…"
              className="max-h-32 min-h-[46px] flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-[13px] outline-none placeholder:text-muted-foreground focus:border-emerald-400/40"
            />
            <button
              onClick={() => send()}
              disabled={sending || !input.trim()}
              className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-xl bg-emerald-400 text-emerald-950 transition hover:brightness-110 disabled:opacity-40"
              aria-label="Send"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}