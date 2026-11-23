import { createFileRoute } from "@tanstack/react-router";
import { Trash2, TrendingDown, TrendingUp, Trophy } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useEntityList } from "@/lib/useEntityList";
import { SUBJECTS, fmtDate, testScore } from "@/lib/plan";
import TestFormDialog from "@/components/tests/TestFormDialog";
import ScoreTrend from "@/components/tests/ScoreTrend";

export const Route = createFileRoute("/_authed/tests")({
  component: Tests,
  head: () => ({ meta: [{ title: "Tests · Ascend" }] }),
});

const average = (values) => {
  const list = values.filter((v) => v !== null && v !== undefined);
  return list.length ? Math.round(list.reduce((a, b) => a + b, 0) / list.length) : null;
};

function Tests() {
  const { items: tests, reload } = useEntityList("MockTest", {}, "-test_date", 200);
  const list = tests || [];
  const ascending = [...list].reverse();

  const scores = list.map((t) => testScore(t).pct);
  const last5 = average(scores.slice(0, 5));
  const prev5 = average(scores.slice(5, 10));
  const best = scores.length ? Math.max(...scores) : null;
  const delta = last5 !== null && prev5 !== null ? last5 - prev5 : null;

  const subjectAverages = SUBJECTS.map((s) => {
    const marksKey = { Physics: "physics_marks", Chemistry: "chemistry_marks", Mathematics: "maths_marks" }[s.key];
    const maxKey = { Physics: "physics_max", Chemistry: "chemistry_max", Mathematics: "maths_max" }[s.key];
    const values = list
      .filter((t) => (t[maxKey] || 0) > 0)
      .map((t) => Math.round(((t[marksKey] || 0) / t[maxKey]) * 100));
    return { ...s, avg: average(values) };
  });

  const create = async (payload) => {
    await base44.entities.MockTest.create(payload);
    await reload();
  };

  const remove = async (test) => {
    await base44.entities.MockTest.delete(test.id);
    await reload();
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Test tracker</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold">Every mock tells you something.</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Log the marks, then read the trend by subject. Accuracy beats raw effort in the last
            stretch.
          </p>
        </div>
        <TestFormDialog onCreate={create} />
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface p-5">
          <p className="eyebrow">Tests logged</p>
          <p className="mt-4 font-heading text-2xl font-semibold">{list.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">All time</p>
        </div>
        <div className="surface p-5">
          <p className="eyebrow">Last 5 average</p>
          <p className="mt-4 font-heading text-2xl font-semibold">{last5 === null ? "—" : `${last5}%`}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            {delta === null ? (
              "Needs more tests"
            ) : delta >= 0 ? (
              <>
                <TrendingUp className="h-3 w-3 text-emerald-300" />
                <span className="text-emerald-300">+{delta}%</span> vs previous 5
              </>
            ) : (
              <>
                <TrendingDown className="h-3 w-3 text-rose-300" />
                <span className="text-rose-300">{delta}%</span> vs previous 5
              </>
            )}
          </p>
        </div>
        <div className="surface p-5">
          <p className="eyebrow">Best score</p>
          <p className="mt-4 flex items-center gap-2 font-heading text-2xl font-semibold">
            <Trophy className="h-4 w-4 text-amber-300" />
            {best === null ? "—" : `${best}%`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Personal peak</p>
        </div>
        <div className="surface p-5">
          <p className="eyebrow">Weakest subject</p>
          <p className="mt-4 font-heading text-2xl font-semibold">
            {subjectAverages.every((s) => s.avg === null)
              ? "—"
              : subjectAverages
                  .filter((s) => s.avg !== null)
                  .sort((a, b) => a.avg - b.avg)[0]
                  ?.key === "Mathematics"
                ? "Maths"
                : subjectAverages
                    .filter((s) => s.avg !== null)
                    .sort((a, b) => a.avg - b.avg)[0]?.key}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Lowest average accuracy</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="surface p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold">Score trend</h2>
            <span className="text-[10px] text-muted-foreground">% of total marks</span>
          </div>
          <ScoreTrend tests={ascending} />
        </section>

        <section className="surface p-5">
          <h2 className="font-heading text-sm font-semibold">Subject averages</h2>
          <div className="mt-5 space-y-5">
            {subjectAverages.map((s) => (
              <div key={s.key}>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    {s.key}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {s.avg === null ? "—" : `${s.avg}%`}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${s.avg || 0}%`, backgroundColor: s.hex }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
            A flat trend with rising accuracy is fine. A falling trend in one subject means the
            next two days go to that subject.
          </p>
        </section>
      </div>

      <section className="surface overflow-hidden">
        <header className="flex items-center justify-between border-b border-white/[0.05] px-4 py-3">
          <h2 className="font-heading text-sm font-semibold">All tests</h2>
          <span className="text-[10px] text-muted-foreground">{list.length} records</span>
        </header>
        {list.length === 0 ? (
          <p className="px-4 py-12 text-center text-xs text-muted-foreground">
            No tests yet. Log your first mock above.
          </p>
        ) : (
          <ul>
            {list.map((test) => {
              const score = testScore(test);
              return (
                <li
                  key={test.id}
                  className="group flex flex-wrap items-center gap-4 border-t border-white/[0.05] px-4 py-3.5 first:border-t-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">{test.name}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {test.test_type} · {fmtDate(test.test_date)} · {test.duration_minutes || 180} min
                    </p>
                    {test.notes && (
                      <p className="mt-1 line-clamp-1 text-[10px] italic text-muted-foreground/80">
                        {test.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    {SUBJECTS.map((s) => {
                      const marksKey = { Physics: "physics_marks", Chemistry: "chemistry_marks", Mathematics: "maths_marks" }[s.key];
                      const maxKey = { Physics: "physics_max", Chemistry: "chemistry_max", Mathematics: "maths_max" }[s.key];
                      if (!test[maxKey]) return null;
                      return (
                        <span key={s.key} className="hidden items-center gap-1 sm:inline-flex">
                          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                          <span className="font-mono">
                            {test[marksKey] || 0}/{test[maxKey]}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                  <div className="w-16 text-right">
                    <p className="font-mono text-sm font-semibold">{score.pct}%</p>
                    <p className="text-[10px] text-muted-foreground">
                      {score.total}/{score.max}
                    </p>
                  </div>
                  <button
                    onClick={() => remove(test)}
                    className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition hover:bg-white/5 hover:text-destructive group-hover:opacity-100"
                    aria-label="Delete test"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}