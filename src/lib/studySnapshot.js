import { addDays, computeForecast, fmtMinutes, testScore, toISO, WEIGHT_HOURS } from "@/lib/plan";

const STATUS_FACTOR = { "Not Started": 1, Learning: 0.75, Practiced: 0.45 };

export function buildSnapshot({ profile, chapters, tasks, sessions, tests }) {
  const list = chapters || [];
  const forecast = computeForecast({
    chapters: list,
    sessions: sessions || [],
    examDate: profile?.exam_date,
    dailyTarget: profile?.daily_target_minutes,
  });

  const backlog = list
    .filter((c) => c.status !== "Mastered")
    .sort(
      (a, b) =>
        (WEIGHT_HOURS[b.weightage] || 0) * (STATUS_FACTOR[b.status] ?? 1) -
        (WEIGHT_HOURS[a.weightage] || 0) * (STATUS_FACTOR[a.status] ?? 1)
    )
    .slice(0, 8)
    .map((c) => `${c.subject} · ${c.name} (${c.status}, ${c.weightage} weight, ${c.revision_count || 0} revisions)`);

  const todayTasks = (tasks || []).map(
    (t) => `${t.title} · ${t.target_minutes || 0}m · ${t.status}`
  );

  const windowStart = addDays(toISO(), -13);
  const recentMinutes = (sessions || [])
    .filter((s) => s.date >= windowStart)
    .reduce((sum, s) => sum + (s.minutes || 0), 0);

  const recentTests = (tests || []).slice(0, 5).map((t) => {
    const score = testScore(t);
    return `${t.name} (${t.test_date}) · ${score.total}/${score.max} · ${score.pct}%`;
  });

  return [
    `Today: ${toISO()}`,
    `Exam date: ${profile?.exam_date || "not set"} · days left: ${forecast.daysLeft ?? "unknown"}`,
    `Daily target: ${fmtMinutes(profile?.daily_target_minutes || 300)}`,
    `Syllabus: ${forecast.mastered}/${forecast.total} chapters mastered (${forecast.syllabusPct}%) · ${Math.round(forecast.hoursLeft)}h of work left`,
    `Pace: ${forecast.paceHours.toFixed(1)}h/day over the last 14 days (${fmtMinutes(recentMinutes)} logged)`,
    `Projected finish: ${forecast.projectedFinish || "not enough data"} · required daily: ${
      forecast.requiredDailyHours ? `${forecast.requiredDailyHours.toFixed(1)}h` : "unknown"
    }`,
    `Remaining by subject: ${forecast.remainingBySubject
      .map((s) => `${s.key} ${s.chapters} ch / ${Math.round(s.hours)}h`)
      .join(", ")}`,
    "",
    "Today's planned blocks:",
    todayTasks.length ? todayTasks.map((t) => `- ${t}`).join("\n") : "- none",
    "",
    "Biggest open chapters:",
    backlog.length ? backlog.map((c) => `- ${c}`).join("\n") : "- none",
    "",
    "Recent mock tests:",
    recentTests.length ? recentTests.map((t) => `- ${t}`).join("\n") : "- none",
  ].join("\n");
}