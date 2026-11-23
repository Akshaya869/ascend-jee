import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Play, Clock, BookOpen, ClipboardCheck, Timer } from "lucide-react";
import {
  SUBJECTS,
  addDays,
  toISO,
  fmtDate,
  fmtMinutes,
  computeForecast,
  computeStreak,
} from "@/lib/plan";
import { base44 } from "@/api/base44Client";
import { useEntityList } from "@/lib/useEntityList";
import { useProfile } from "@/lib/useProfile";
import { useSyllabus } from "@/lib/useSyllabus";
import StatCard from "@/components/dashboard/StatCard";
import FocusRing from "@/components/dashboard/FocusRing";
import TodayPlan from "@/components/dashboard/TodayPlan";
import SubjectMastery from "@/components/dashboard/SubjectMastery";
import ForecastCard from "@/components/dashboard/ForecastCard";
import RecentTests from "@/components/dashboard/RecentTests";

export const Route = createFileRoute("/_authed/")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard · Ascend" }] }),
});

function greeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function testPct(test) {
  if (!test) return null;
  const total =
    (test.physics_marks || 0) + (test.chemistry_marks || 0) + (test.maths_marks || 0);
  const max = (test.physics_max || 0) + (test.chemistry_max || 0) + (test.maths_max || 0);
  return max ? Math.round((total / max) * 100) : null;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-9 w-64 animate-pulse rounded-xl bg-white/[0.05]" />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-72 animate-pulse rounded-2xl bg-white/[0.04] lg:col-span-2" />
        <div className="h-72 animate-pulse rounded-2xl bg-white/[0.04]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/[0.04]" />
        ))}
      </div>
    </div>
  );
}

function Dashboard() {
  const today = toISO();
  const { profile } = useProfile();
  const { chapters } = useSyllabus();
  const { items: sessions } = useEntityList(
    "StudySession",
    { date: { $gte: addDays(today, -119) } },
    "-date",
    500
  );
  const { items: tasks, reload: reloadTasks } = useEntityList(
    "Task",
    { date: today },
    "created_date",
    100
  );
  const { items: tests } = useEntityList("MockTest", {}, "-test_date", 5);

  if (!profile || !chapters || !sessions || !tasks || !tests) return <DashboardSkeleton />;

  const todaySessions = sessions.filter((s) => s.date === today);
  const todayMinutes = todaySessions.reduce((sum, s) => sum + (s.minutes || 0), 0);
  const forecast = computeForecast({
    chapters,
    sessions,
    examDate: profile.exam_date,
    dailyTarget: profile.daily_target_minutes,
  });
  const streak = computeStreak(sessions);
  const weekMinutes = sessions
    .filter((s) => s.date >= addDays(today, -6))
    .reduce((sum, s) => sum + (s.minutes || 0), 0);
  const subjectStats = SUBJECTS.map((s) => {
    const list = chapters.filter((c) => c.subject === s.key);
    return {
      key: s.key,
      mastered: list.filter((c) => c.status === "Mastered").length,
      total: list.length,
    };
  });
  const lastTest = tests[0];
  const lastPct = testPct(lastTest);

  const toggleTask = async (task) => {
    await base44.entities.Task.update(task.id, {
      status: task.status === "Done" ? "Todo" : "Done",
    });
    await reloadTasks();
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">
            {fmtDate(today, { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">
            {greeting()}, aspirant.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Class 12 is the closing stretch: revise what you know, fix what you miss, and keep the
            mock scores climbing.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1.5 text-[11px] font-medium text-amber-200">
            <Flame className="h-3.5 w-3.5" /> {streak}-day streak
          </span>
          {profile.exam_date ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> {Math.max(0, forecast.daysLeft)} days to exam
            </span>
          ) : (
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-muted-foreground transition hover:text-foreground"
            >
              <Clock className="h-3.5 w-3.5" /> Set your exam date
            </Link>
          )}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="surface relative overflow-hidden p-6 lg:col-span-2">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="flex flex-col items-center gap-7 sm:flex-row">
            <FocusRing minutes={todayMinutes} target={profile.daily_target_minutes} />
            <div className="w-full flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Today&apos;s focus
              </p>
              <h2 className="mt-2 font-heading text-xl font-semibold">
                {todaySessions.length} focus session{todaySessions.length === 1 ? "" : "s"} logged
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {todayMinutes >= profile.daily_target_minutes
                  ? "Target hit. Anything more is a bonus."
                  : `${fmtMinutes(profile.daily_target_minutes - todayMinutes)} left to hit today's target.`}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  to="/pomodoro"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-emerald-950 transition hover:brightness-110"
                >
                  <Play className="h-4 w-4" /> Start focus
                </Link>
                <Link
                  to="/planner"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                >
                  Open planner
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {SUBJECTS.map((s) => {
                  const mins = todaySessions
                    .filter((x) => x.subject === s.key)
                    .reduce((sum, x) => sum + (x.minutes || 0), 0);
                  return (
                    <span
                      key={s.key}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-muted-foreground"
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                      {s.short} <span className="font-mono">{fmtMinutes(mins)}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <ForecastCard forecast={forecast} examDate={profile.exam_date} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="Chapters mastered"
          value={`${forecast.mastered}/${forecast.total}`}
          hint={`${forecast.syllabusPct}% of syllabus`}
          tone="primary"
        />
        <StatCard
          icon={Timer}
          label="Focus this week"
          value={fmtMinutes(weekMinutes)}
          hint={`${fmtMinutes(Math.round(weekMinutes / 7))} daily average`}
          tone="sky"
        />
        <StatCard
          icon={ClipboardCheck}
          label="Last test"
          value={lastPct === null ? "—" : `${lastPct}%`}
          hint={lastTest ? lastTest.name : "No tests logged"}
          tone="violet"
        />
        <StatCard
          icon={Flame}
          label="Streak"
          value={`${streak} day${streak === 1 ? "" : "s"}`}
          hint="Keep the chain alive"
          tone="amber"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TodayPlan tasks={tasks} onToggle={toggleTask} />
        <SubjectMastery stats={subjectStats} />
      </div>

      <RecentTests tests={tests} />
    </div>
  );
}