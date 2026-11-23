import { AlertTriangle, CheckCircle2, Compass } from "lucide-react";
import { fmtDate } from "@/lib/plan";

export default function ForecastCard({ forecast, examDate }) {
  const { syllabusPct, hoursLeft, projectedFinish, onTrack, requiredDailyHours } = forecast;

  const verdict = !examDate
    ? { icon: Compass, text: "Set exam date", cls: "text-muted-foreground border-white/10 bg-white/[0.04]" }
    : onTrack === null
      ? { icon: Compass, text: "Log sessions", cls: "text-muted-foreground border-white/10 bg-white/[0.04]" }
      : onTrack
        ? { icon: CheckCircle2, text: "On track", cls: "text-emerald-300 border-emerald-400/25 bg-emerald-400/10" }
        : { icon: AlertTriangle, text: "Behind pace", cls: "text-amber-300 border-amber-400/25 bg-amber-400/10" };

  const VerdictIcon = verdict.icon;

  return (
    <section className="surface flex flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Syllabus forecast</p>
          <p className="mt-3 font-heading text-2xl font-semibold">{syllabusPct}% complete</p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium ${verdict.cls}`}
        >
          <VerdictIcon className="h-3 w-3" />
          {verdict.text}
        </span>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-700"
          style={{ width: `${syllabusPct}%` }}
        />
      </div>

      <dl className="mt-5 space-y-2.5 text-xs">
        <div className="flex items-baseline justify-between">
          <dt className="text-muted-foreground">Projected finish</dt>
          <dd className="font-medium">{projectedFinish ? fmtDate(projectedFinish) : "Need more data"}</dd>
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="text-muted-foreground">Syllabus hours left</dt>
          <dd className="font-mono text-[11px]">{Math.round(hoursLeft)}h</dd>
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="text-muted-foreground">Needed per day</dt>
          <dd className="font-mono text-[11px]">
            {requiredDailyHours ? `${requiredDailyHours.toFixed(1)}h` : "—"}
          </dd>
        </div>
      </dl>
    </section>
  );
}