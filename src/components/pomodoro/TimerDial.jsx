export default function TimerDial({ secondsLeft = 0, total = 1500, phase = "focus", running = false }) {
  const pct = total ? Math.min(1, Math.max(0, 1 - secondsLeft / total)) : 0;
  const r = 126;
  const c = 2 * Math.PI * r;
  const hours = Math.floor(secondsLeft / 3600);
  const mm = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const label = { focus: "Deep focus", short: "Short break", long: "Long break" }[phase];
  const accent = phase === "focus" ? "stroke-emerald-400" : "stroke-amber-300";

  return (
    <div className="relative mx-auto h-64 w-64 sm:h-80 sm:w-80">
      <div
        className={`pointer-events-none absolute inset-8 rounded-full blur-3xl ${
          running ? "bg-emerald-400/10" : "bg-emerald-400/[0.04]"
        }`}
      />
      <svg viewBox="0 0 280 280" className="relative h-full w-full -rotate-90">
        <circle cx="140" cy="140" r={r} strokeWidth="4" className="fill-none stroke-white/[0.06]" />
        <circle
          cx="140"
          cy="140"
          r={r}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className={`fill-none transition-all duration-500 ${accent}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</span>
        <span className="mt-2 font-mono text-5xl font-semibold tabular-nums sm:text-6xl">
          {hours > 0 ? `${hours}:` : ""}
          {mm}:{ss}
        </span>
        <span className={`mt-3 text-[11px] ${running ? "text-emerald-300" : "text-muted-foreground"}`}>
          {running ? "Running" : "Ready"}
        </span>
      </div>
    </div>
  );
}