import { fmtMinutes } from "@/lib/plan";

export default function WeekGrid({ days }) {
  const max = Math.max(1, ...days.map((day) => day.questions));

  return (
    <div>
      <div className="flex items-center gap-3 pb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <span className="w-16">Day</span>
        <span className="flex-1">Questions</span>
        <span className="w-10 text-right">Count</span>
        <span className="w-14 text-right">Focus</span>
      </div>
      <div className="space-y-2.5">
        {days.map((day) => (
          <div key={day.iso} className="flex items-center gap-3">
            <span
              className={`w-16 text-[11px] ${day.iso === day.today ? "font-semibold text-foreground" : "text-muted-foreground"}`}
            >
              {day.label}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300"
                style={{ width: `${(day.questions / max) * 100}%` }}
              />
            </div>
            <span className="w-10 text-right font-mono text-xs">{day.questions}</span>
            <span className="w-14 text-right font-mono text-[11px] text-muted-foreground">
              {fmtMinutes(day.minutes)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}