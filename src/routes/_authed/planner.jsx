import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Sparkles, Timer } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useEntityList } from "@/lib/useEntityList";
import { useSyllabus } from "@/lib/useSyllabus";
import { useProfile } from "@/lib/useProfile";
import { SUBJECTS, addDays, fmtDate, fmtMinutes, toISO, WEIGHT_HOURS } from "@/lib/plan";
import TaskRow from "@/components/planner/TaskRow";
import AddTaskDialog from "@/components/planner/AddTaskDialog";
import DailyTracker from "@/components/planner/DailyTracker";

export const Route = createFileRoute("/_authed/planner")({
  component: Planner,
  head: () => ({ meta: [{ title: "Planner · Ascend" }] }),
});

function Planner() {
  const today = toISO();
  const [date, setDate] = useState(today);
  const { profile } = useProfile();
  const { chapters } = useSyllabus();
  const { items: tasks, reload } = useEntityList("Task", { date }, "created_date", 100);
  const { items: sessions } = useEntityList("StudySession", { date }, "-created_date", 100);
  const { items: weekTasks, reload: reloadWeek } = useEntityList(
    "Task",
    { date: { $gte: addDays(today, -6) } },
    "created_date",
    300
  );

  const list = tasks || [];
  const planned = list.reduce((sum, t) => sum + (t.target_minutes || 0), 0);
  const doneMinutes = list
    .filter((t) => t.status === "Done")
    .reduce((sum, t) => sum + (t.target_minutes || 0), 0);
  const logged = (sessions || []).reduce((sum, s) => sum + (s.minutes || 0), 0);
  const target = profile?.daily_target_minutes || 300;
  const pct = target ? Math.min(100, Math.round((doneMinutes / target) * 100)) : 0;

  const refresh = async () => {
    await Promise.all([reload(), reloadWeek()]);
  };

  const createTask = async (payload) => {
    await base44.entities.Task.create(payload);
    await refresh();
  };

  const toggleTask = async (task) => {
    await base44.entities.Task.update(task.id, {
      status: task.status === "Done" ? "Todo" : "Done",
    });
    await refresh();
  };

  const deleteTask = async (task) => {
    await base44.entities.Task.delete(task.id);
    await refresh();
  };

  const suggestDay = async () => {
    if (!chapters) {
      toast("Still loading your syllabus — try again in a second.");
      return;
    }
    const SUBJECT_CAP = 2;
    const used = new Set(list.map((t) => t.chapter_name).filter(Boolean));
    const perSubject = {};
    for (const task of list) {
      if (task.subject) perSubject[task.subject] = (perSubject[task.subject] || 0) + 1;
    }

    const queues = SUBJECTS.map((subject) => ({
      key: subject.key,
      picks: (chapters || [])
        .filter((c) => c.subject === subject.key && c.status !== "Mastered" && !used.has(c.name))
        .sort((a, b) => (WEIGHT_HOURS[b.weightage] || 4) - (WEIGHT_HOURS[a.weightage] || 4))
        .slice(0, Math.max(0, SUBJECT_CAP - (perSubject[subject.key] || 0))),
    }));

    // Round-robin so every subject gets its first block before any gets a second
    const picks = [];
    for (let round = 0; round < SUBJECT_CAP; round += 1) {
      for (const queue of queues) {
        if (queue.picks[round]) picks.push(queue.picks[round]);
      }
    }

    if (!picks.length) {
      toast("Every subject already has two blocks, or nothing is left to suggest.");
      return;
    }

    let remaining = Math.max(0, target - planned);
    if (remaining < 30) {
      toast("Today's target is already planned. Add a block manually if you want more.");
      return;
    }

    const each = Math.min(60, Math.max(30, Math.round(remaining / picks.length / 15) * 15));
    const blocks = [];
    for (const chapter of picks) {
      if (remaining < 30) break;
      const minutes = Math.min(each, Math.max(30, remaining));
      blocks.push({
        date,
        title: `${chapter.name} — deep work`,
        subject: chapter.subject,
        chapter_name: chapter.name,
        target_minutes: minutes,
        status: "Todo",
      });
      remaining -= minutes;
    }

    await base44.entities.Task.bulkCreate(blocks);
    await refresh();
    toast.success(`${blocks.length} blocks added — max two per subject`);
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Daily plan</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold">{fmtDate(date, { weekday: "long", day: "numeric", month: "long" })}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Plan the blocks before the day plans you.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-xl border border-white/[0.07] bg-white/[0.03] p-1">
            <button
              onClick={() => setDate(addDays(date, -1))}
              className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
              aria-label="Previous day"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDate(today)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              Today
            </button>
            <button
              onClick={() => setDate(addDays(date, 1))}
              className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
              aria-label="Next day"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <AddTaskDialog date={date} chapters={chapters || []} onCreate={createTask} />
        </div>
      </header>

      <section className="surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Planned blocks done</p>
            <p className="mt-1 font-heading text-xl font-semibold">
              {fmtMinutes(doneMinutes)}{" "}
              <span className="text-sm font-normal text-muted-foreground">of {fmtMinutes(target)}</span>
            </p>
          </div>
          <div className="flex items-center gap-5 text-right">
            <div>
              <p className="eyebrow">Planned</p>
              <p className="mt-1 font-mono text-sm">{fmtMinutes(planned)}</p>
            </div>
            <div>
              <p className="eyebrow">Actually logged</p>
              <p className="mt-1 flex items-center justify-end gap-1.5 font-mono text-sm">
                <Timer className="h-3.5 w-3.5 text-emerald-300" />
                {fmtMinutes(logged)}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="surface p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold">
              {list.length} block{list.length === 1 ? "" : "s"}
            </h2>
            <button
              onClick={suggestDay}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1.5 text-[11px] font-medium text-emerald-300 transition hover:bg-emerald-400/15"
            >
              <Sparkles className="h-3.5 w-3.5" /> Suggest my day
            </button>
          </div>

          {list.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-white/10 px-4 py-10 text-center text-xs text-muted-foreground">
              Nothing planned yet. Add a block, or let Ascend suggest one from your weakest
              chapters.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {list.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                />
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-4">
          <DailyTracker tasks={weekTasks || []} />
          <section className="surface p-5">
            <h2 className="font-heading text-sm font-semibold">How to plan a day</h2>
          <ul className="mt-4 space-y-3 text-xs leading-relaxed text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">Two deep blocks per subject.</span>{" "}
              Theory first, then problems on the same chapter while it is fresh.
            </li>
            <li>
              <span className="font-medium text-foreground">One revision block.</span> Pick
              something you studied 3, 7 or 21 days ago.
            </li>
            <li>
              <span className="font-medium text-foreground">Leave 30 minutes.</span> Update the
              error notebook before you sleep.
            </li>
          </ul>
          <p className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-[11px] text-muted-foreground">
            Logged time comes from the focus timer, so planned and actual stay honest.
          </p>
          </section>
        </div>
      </div>
    </div>
  );
}