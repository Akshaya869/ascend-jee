import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, CalendarClock, Gauge, Target } from "lucide-react";
import { useEntityList } from "@/lib/useEntityList";
import { useProfile } from "@/lib/useProfile";
import { useSyllabus } from "@/lib/useSyllabus";
import {
  SUBJECTS,
  addDays,
  computeForecast,
  daysBetween,
  fmtDate,
  fmtMinutes,
  toISO,
} from "@/lib/plan";
import PaceChart from "@/components/forecast/PaceChart";
import SubjectSplit from "@/components/forecast/SubjectSplit";

export const Route = createFileRoute("/_authed/forecast")({
  component: Forecast,
  head: () => ({ meta: [{ title: "Forecast · Ascend" }] }),
});

function Forecast() {
  const today = toISO();
  const { profile } = useProfile();
  const { chapters } = useSyllabus();
  const { items: sessions } = useEntityList(
    "StudySession",
    { date: { $gte: addDays(today, -89) } },
    "-date",
    500
  );

  const ready = profile && chapters && sessions;
  const forecast = computeForecast({
    chapters: chapters || [],
    sessions: sessions || [],
    examDate: profile?.exam_date,
    dailyTarget: profile?.daily_target_minutes || 300,
  });

  const last14 = Array.from({ length: 14 }, (_, index) => {
    const day = addDays(today, -(13 - index));
    const minutes = (sessions || [])
      .filter((s) => s.date === day)
      .reduce((sum, s) => sum + (s.minutes || 0), 0);
    return { label: fmtDate(day, { day: "numeric" }), minutes };
  });

  const subjectMinutes = SUBJECTS.map((s) => ({
    name: s.key === "Mathematics" ? "Maths" : s.key,
    value: (sessions || [])
      .filter((x) => x.subject === s.key)
      .reduce((sum, x) => sum + (x.minutes || 0), 0),
    color: s.hex,
  }));

  const drift =
    forecast.projectedFinish && profile?.exam_date
      ? daysBetween(forecast.projectedFinish, profile.exam_date)
      : null;

  const maxHours = Math.max(
    1,
    ...forecast.remainingBySubject.map((s) => Math.round(s.hours))
  );

  let verdict = "Set your exam date to see whether this pace gets you there.";
  if (profile?.exam_date && !forecast.projectedFinish) {
    verdict = "Log a few focus sessions and the projection appears here.";
  } else if (forecast.projectedFinish && forecast.onTrack) {
    verdict = `On track to finish around ${fmtDate(forecast.projectedFinish)}.`;
  } else if (forecast.projectedFinish && !forecast.onTrack) {
    verdict = `At this pace you finish around ${fmtDate(forecast.projectedFinish)}, ${Math.abs(drift)} days after the exam.`;
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">Forecast</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">Honest math, not hope.</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Your last 14 days of focus set the pace. Remaining chapters are weighted by difficulty and
          weightage to project a finish date.
        </p>
      </header>

      {!ready ? (
        <div className="h-64 animate-pulse rounded-2xl bg-white/[0.04]" />
      ) : (
        <>
          <section className="surface relative overflow-hidden p-6">
            <div className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <p className="eyebrow">Projection</p>
                <h2 className="mt-2 font-heading text-2xl font-semibold">{verdict}</h2>
                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-700"
                    style={{ width: `${forecast.syllabusPct}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {forecast.mastered} of {forecast.total} chapters mastered · {forecast.syllabusPct}%
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                    <p className="eyebrow">Current pace</p>
                    <p className="mt-2 flex items-center gap-2 font-mono text-lg">
                      <Gauge className="h-4 w-4 text-sky-300" />
                      {forecast.paceHours.toFixed(1)}h/day
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                    <p className="eyebrow">Needed per day</p>
                    <p className="mt-2 flex items-center gap-2 font-mono text-lg">
                      <Target className="h-4 w-4 text-amber-300" />
                      {forecast.requiredDailyHours
                        ? `${forecast.requiredDailyHours.toFixed(1)}h`
                        : "—"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                    <p className="eyebrow">Syllabus hours left</p>
                    <p className="mt-2 flex items-center gap-2 font-mono text-lg">
                      <CalendarClock className="h-4 w-4 text-violet-300" />
                      {Math.round(forecast.hoursLeft)}h
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
                <p className="eyebrow">Exam date</p>
                {profile.exam_date ? (
                  <>
                    <p className="mt-2 font-heading text-3xl font-semibold">
                      {Math.max(0, forecast.daysLeft)}
                      <span className="ml-1 text-sm font-normal text-muted-foreground">days</span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {fmtDate(profile.exam_date, {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Add your JEE Main date to activate the countdown.
                    </p>
                    <Link
                      to="/settings"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-300 hover:underline"
                    >
                      Set exam date <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </>
                )}
                <div className="mt-5 border-t border-white/[0.06] pt-4">
                  <p className="eyebrow">Projected finish</p>
                  <p className="mt-2 font-heading text-lg">
                    {forecast.projectedFinish ? fmtDate(forecast.projectedFinish) : "—"}
                  </p>
                  {drift !== null && (
                    <p
                      className={`mt-1 text-[11px] ${
                        drift >= 0 ? "text-emerald-300" : "text-amber-300"
                      }`}
                    >
                      {drift >= 0
                        ? `${drift} days of buffer`
                        : `${Math.abs(drift)} days behind`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-3">
            <section className="surface p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-sm font-semibold">Focus, last 14 days</h2>
                <span className="text-[10px] text-muted-foreground">
                  target {fmtMinutes(profile.daily_target_minutes)}
                </span>
              </div>
              <PaceChart data={last14} target={profile.daily_target_minutes} />
            </section>

            <section className="surface p-5">
              <h2 className="font-heading text-sm font-semibold">Where the hours go</h2>
              <p className="mt-1 text-[11px] text-muted-foreground">Last 90 days</p>
              <SubjectSplit data={subjectMinutes} />
            </section>
          </div>

          <section className="surface p-5">
            <h2 className="font-heading text-sm font-semibold">Remaining workload</h2>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Estimated hours to reach Mastered, weighted by chapter weightage
            </p>
            <div className="mt-5 space-y-4">
              {forecast.remainingBySubject.map((subject) => {
                const meta = SUBJECTS.find((s) => s.key === subject.key);
                return (
                  <div key={subject.key}>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                        {subject.key}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {subject.chapters} chapters · {Math.round(subject.hours)}h
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round((subject.hours / maxHours) * 100)}%`,
                          backgroundColor: meta.hex,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}