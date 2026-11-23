import { fmtMinutes } from "@/lib/plan";

export default function FocusRing({ minutes = 0, target = 300 }) {
  const pct = target > 0 ? Math.min(1, minutes / target) : 0;
  const r = 78;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative h-48 w-48 shrink-0 sm:h-52 sm:w-52">
      <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
        <circle cx="90" cy="90" r={r} strokeWidth="9" className="fill-none stroke-white/[0.07]" />
        <circle
          cx="90"
          cy="90"
          r={r}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="fill-none stroke-emerald-400 transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-2xl font-semibold tracking-tight">
          {fmtMinutes(minutes)}
        </span>
        <span className="mt-1 text-[11px] text-muted-foreground">of {fmtMinutes(target)}</span>
        <span className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
          {Math.round(pct * 100)}%
        </span>
      </div>
    </div>
  );
}