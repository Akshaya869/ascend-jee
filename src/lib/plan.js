export const SUBJECTS = [
  { key: "Physics", short: "PHY", hex: "#38bdf8", text: "text-sky-300", dot: "bg-sky-400" },
  { key: "Chemistry", short: "CHE", hex: "#a78bfa", text: "text-violet-300", dot: "bg-violet-400" },
  { key: "Mathematics", short: "MAT", hex: "#fbbf24", text: "text-amber-300", dot: "bg-amber-400" },
];

export const STATUSES = ["Not Started", "Learning", "Practiced", "Mastered"];
export const WEIGHTS = ["High", "Medium", "Low"];
export const WEIGHT_HOURS = { High: 15, Medium: 12, Low: 10 };
export const EXAM_SCOPES = ["Both", "Mains", "Advanced"];

export const DEFAULT_PROFILE = {
  exam_date: "",
  daily_target_minutes: 300,
  pomodoro_focus: 25,
  pomodoro_short: 5,
  pomodoro_long: 15,
  long_break_interval: 4,
};

export function subjectMeta(name) {
  return SUBJECTS.find((s) => s.key === name) || SUBJECTS[0];
}

export function toISO(d = new Date()) {
  const copy = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return copy.toISOString().slice(0, 10);
}

export function addDays(iso, days) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return toISO(d);
}

export function fmtDate(iso, opts = { day: "numeric", month: "short" }) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", opts);
}

export function daysBetween(fromIso, toIso) {
  if (!fromIso || !toIso) return null;
  return Math.round(
    (new Date(toIso + "T00:00:00") - new Date(fromIso + "T00:00:00")) / 86400000
  );
}

export function fmtMinutes(mins = 0) {
  const total = Math.round(mins);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function testScore(test) {
  if (!test) return { total: 0, max: 0, pct: 0 };
  const total =
    (test.physics_marks || 0) + (test.chemistry_marks || 0) + (test.maths_marks || 0);
  const max = (test.physics_max || 0) + (test.chemistry_max || 0) + (test.maths_max || 0);
  return { total, max, pct: max ? Math.round((total / max) * 100) : 0 };
}

export function computeStreak(sessions = []) {
  const days = new Set(sessions.filter((s) => s.minutes > 0).map((s) => s.date));
  let cursor = toISO();
  if (!days.has(cursor)) cursor = addDays(cursor, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function computeForecast({ chapters = [], sessions = [], examDate, dailyTarget = 300 }) {
  const total = chapters.length;
  const mastered = chapters.filter((c) => c.status === "Mastered").length;
  const remaining = chapters.filter((c) => c.status !== "Mastered");
  const factor = { "Not Started": 1, Learning: 0.75, Practiced: 0.45 };
  const hoursLeft = remaining.reduce(
    (sum, c) => sum + (WEIGHT_HOURS[c.weightage] || 4) * (factor[c.status] ?? 1),
    0
  );

  const windowStart = addDays(toISO(), -13);
  const recentMinutes = sessions
    .filter((s) => s.date >= windowStart)
    .reduce((sum, s) => sum + (s.minutes || 0), 0);
  const paceHours = recentMinutes / 14 / 60;

  const daysLeft = examDate ? daysBetween(toISO(), examDate) : null;
  const projectedFinish =
    paceHours > 0.01 ? addDays(toISO(), Math.ceil(hoursLeft / paceHours)) : null;
  const requiredDailyHours = daysLeft && daysLeft > 0 ? hoursLeft / daysLeft : null;

  const remainingBySubject = SUBJECTS.map((s) => {
    const list = remaining.filter((c) => c.subject === s.key);
    return {
      key: s.key,
      chapters: list.length,
      hours: list.reduce(
        (sum, c) => sum + (WEIGHT_HOURS[c.weightage] || 4) * (factor[c.status] ?? 1),
        0
      ),
    };
  });

  return {
    total,
    mastered,
    syllabusPct: total ? Math.round((mastered / total) * 100) : 0,
    hoursLeft,
    paceHours,
    projectedFinish,
    daysLeft,
    requiredDailyHours,
    onTrack:
      projectedFinish && examDate ? projectedFinish <= examDate : null,
    remainingBySubject,
    dailyTarget,
  };
}