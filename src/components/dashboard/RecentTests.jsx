import { Link } from "@tanstack/react-router";
import { fmtDate } from "@/lib/plan";

export default function RecentTests({ tests = [] }) {
  return (
    <section className="surface p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-sm font-semibold">Recent tests</h2>
          <p className="mt-1 text-xs text-muted-foreground">Score as a share of total marks</p>
        </div>
        <Link to="/tests" className="text-xs font-medium text-emerald-300 hover:underline">
          All tests
        </Link>
      </header>

      {tests.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-xs text-muted-foreground">
          No tests logged yet. Add your first mock to start the trend.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-white/[0.05]">
          {tests.map((t) => {
            const total = (t.physics_marks || 0) + (t.chemistry_marks || 0) + (t.maths_marks || 0);
            const max =
              (t.physics_max || 0) + (t.chemistry_max || 0) + (t.maths_max || 0);
            const pct = max ? Math.round((total / max) * 100) : 0;
            return (
              <li key={t.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{t.name}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {t.test_type} · {fmtDate(t.test_date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold">{pct}%</p>
                  <p className="text-[10px] text-muted-foreground">
                    {total}/{max}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}