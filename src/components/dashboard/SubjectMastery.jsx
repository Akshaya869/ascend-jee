import { subjectMeta } from "@/lib/plan";

export default function SubjectMastery({ stats = [] }) {
  return (
    <section className="surface p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-sm font-semibold">Subject mastery</h2>
          <p className="mt-1 text-xs text-muted-foreground">Chapters marked mastered</p>
        </div>
      </header>

      <div className="mt-5 space-y-5">
        {stats.map((s) => {
          const meta = subjectMeta(s.key);
          const pct = s.total ? Math.round((s.mastered / s.total) * 100) : 0;
          return (
            <div key={s.key}>
              <div className="flex items-baseline justify-between text-xs">
                <span className="flex items-center gap-2 font-medium">
                  <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                  {s.key}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {s.mastered}/{s.total} · {pct}%
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: meta.hex }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}