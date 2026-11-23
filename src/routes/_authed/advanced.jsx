import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { addDays, fmtDate, fmtMinutes, subjectMeta, toISO } from "@/lib/plan";
import { useEntityList } from "@/lib/useEntityList";
import WeekGrid from "@/components/advanced/WeekGrid";
import AddQuestionForm from "@/components/advanced/AddQuestionForm";

export const Route = createFileRoute("/_authed/advanced")({
  ssr: false,
  component: AdvancedPage,
  head: () => ({ meta: [{ title: "Advanced · Ascend" }] }),
});

function AdvancedPage() {
  const today = toISO();
  const weekStart = addDays(today, -6);
  const { items: logs, reload } = useEntityList(
    "QuestionLog",
    { date: { $gte: weekStart } },
    "-date",
    200
  );
  const { items: sessions } = useEntityList(
    "StudySession",
    { date: { $gte: weekStart } },
    "-date",
    500
  );

  const days = Array.from({ length: 7 }, (_, index) => {
    const iso = addDays(weekStart, index);
    return {
      iso,
      today,
      label: fmtDate(iso, { weekday: "short", day: "numeric" }),
      questions: (logs || [])
        .filter((log) => log.date === iso)
        .reduce((sum, log) => sum + (log.count || 0), 0),
      minutes: (sessions || [])
        .filter((session) => session.date === iso)
        .reduce((sum, session) => sum + (session.minutes || 0), 0),
    };
  });

  const totalQuestions = days.reduce((sum, day) => sum + day.questions, 0);
  const totalMinutes = days.reduce((sum, day) => sum + day.minutes, 0);
  const activeDays = days.filter((day) => day.questions > 0).length;

  const createLog = async (payload) => {
    await base44.entities.QuestionLog.create(payload);
    await reload();
    toast.success(`${payload.count} questions logged`);
  };

  const removeLog = async (log) => {
    await base44.entities.QuestionLog.delete(log.id);
    await reload();
  };

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">Advanced practice</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">Questions that fight back.</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Track JEE Advanced level problems day by day for the last week, next to the focus time
          you actually put in.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="surface p-4">
          <p className="eyebrow">Questions this week</p>
          <p className="mt-1 font-mono text-2xl font-semibold">{totalQuestions}</p>
        </div>
        <div className="surface p-4">
          <p className="eyebrow">Daily average</p>
          <p className="mt-1 font-mono text-2xl font-semibold">
            {Math.round((totalQuestions / 7) * 10) / 10}
          </p>
        </div>
        <div className="surface p-4">
          <p className="eyebrow">Focus time</p>
          <p className="mt-1 font-mono text-2xl font-semibold">{fmtMinutes(totalMinutes)}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {activeDays} of 7 days with advanced work
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="surface p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold">Last 7 days</h2>
            <span className="text-[11px] text-muted-foreground">
              {fmtDate(weekStart, { day: "numeric", month: "short" })} –{" "}
              {fmtDate(today, { day: "numeric", month: "short" })}
            </span>
          </div>
          <div className="mt-4">
            <WeekGrid days={days} />
          </div>
        </section>

        <AddQuestionForm onCreate={createLog} />
      </div>

      <section className="surface p-5">
        <h2 className="font-heading text-sm font-semibold">Logged this week</h2>
        {(logs || []).length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-xs text-muted-foreground">
            Nothing logged yet. Add your first advanced set on the right.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-white/[0.06]">
            {logs.map((log) => {
              const meta = subjectMeta(log.subject);
              return (
                <li key={log.id} className="flex items-center gap-3 py-2.5 text-xs">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dot}`} />
                  <span className="w-16 text-muted-foreground">
                    {fmtDate(log.date, { day: "numeric", month: "short" })}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {log.notes || `${log.subject} set`}
                  </span>
                  <span className="font-mono text-[11px]">{log.count}</span>
                  <button
                    onClick={() => removeLog(log)}
                    className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                    aria-label="Delete log"
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