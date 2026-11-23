import { addDays, fmtDate, toISO } from "@/lib/plan";

export default function DailyTracker({ tasks = [] }) {
  const today = toISO();
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, -(6 - index));
    const list = tasks.filter((task) => task.date === date);
    const done = list.filter((task) => task.status === "Done").length;
    return {
      date,
      total: list.length,
      done,
      pct: list.length ? Math.round((done / list.length) * 100) : 0,
    };
  });

  const todayStats = week[week.length - 1];
  const cleared = week.filter((day) => day.total > 0 && day.done === day.total).length;
  const plannedDays = week.filter((day) => day.total > 0).length;

  return (
    <section className="surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-sm font-semibold">Daily tracker</h2>
          <p className="mt-1 text-[11px] text-muted-foreground">Last 7 days of planned blocks</p>
        </div>
        <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[10px] text-muted-foreground">
          {cleared}/{plannedDays || 0} days cleared
        </span>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <p className="font-heading text-2xl font-semibold">
          {todayStats.done}
          <span className="text-sm font-normal text-muted-foreground">
            {" "}
            of {todayStats.total}
          </span>
        </p>
        <p className="text-[11px] text-muted-foreground">blocks done today</p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-500"
          style={{ width: `${todayStats.pct}%` }}
        />
      </div>

      <div className="mt-5 flex items-end gap-1.5">
        {week.map((day, index) => (
          <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex h-16 w-full items-end" title={`${day.done}/${day.total} blocks`}>
              <div
                className={`w-full rounded-md transition-all ${
                  day.total === 0
                    ? "bg-white/[0.04]"
                    : day.pct === 100
                      ? "bg-emerald-400"
                      : "bg-emerald-400/35"
                }`}
                style={{ height: `${day.total === 0 ? 6 : Math.max(10, day.pct)}%` }}
              />
            </div>
            <span
              className={`text-[9px] uppercase ${
                index === week.length - 1 ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {fmtDate(day.date, { weekday: "narrow" })}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
        A day counts as cleared when every planned block is ticked. Two unplanned blocks still beat
        a blank day.
      </p>
    </section>
  );
}