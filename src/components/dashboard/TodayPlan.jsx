import { Link } from "@tanstack/react-router";
import { Check, Circle } from "lucide-react";
import { fmtMinutes, subjectMeta } from "@/lib/plan";

export default function TodayPlan({ tasks = [], onToggle }) {
  const done = tasks.filter((t) => t.status === "Done").length;

  return (
    <section className="surface p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-sm font-semibold">Today&apos;s plan</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {done} of {tasks.length} blocks done
          </p>
        </div>
        <Link to="/planner" className="text-xs font-medium text-emerald-300 hover:underline">
          Open planner
        </Link>
      </header>

      {tasks.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-xs text-muted-foreground">
          No blocks planned. Add a few in the planner.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {tasks.map((task) => {
            const meta = subjectMeta(task.subject);
            const isDone = task.status === "Done";
            return (
              <li key={task.id}>
                <button
                  onClick={() => onToggle?.(task)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-white/[0.05] px-3 py-2.5 text-left transition hover:border-white/10 hover:bg-white/[0.04]"
                >
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition ${
                      isDone
                        ? "border-emerald-400 bg-emerald-400 text-emerald-950"
                        : "border-white/20 text-transparent group-hover:border-emerald-400/60"
                    }`}
                  >
                    {isDone ? <Check className="h-3 w-3" /> : <Circle className="h-2 w-2" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-[13px] ${
                        isDone ? "text-muted-foreground line-through" : "text-foreground"
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                      {task.subject}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                    {fmtMinutes(task.target_minutes || 45)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}