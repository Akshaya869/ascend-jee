export default function ChatBubble({ role, content }) {
  const mine = role === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
          mine
            ? "bg-emerald-400/15 text-foreground"
            : "border border-white/[0.06] bg-white/[0.03] text-foreground/90"
        }`}
      >
        {content}
      </div>
    </div>
  );
}