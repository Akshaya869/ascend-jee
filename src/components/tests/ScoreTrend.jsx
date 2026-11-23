import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtDate, testScore } from "@/lib/plan";

const tooltipStyle = {
  background: "#0f141d",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  fontSize: 11,
  color: "#e9edf5",
};

function subjectPct(test, marksKey, maxKey) {
  const max = test[maxKey] || 0;
  return max ? Math.round(((test[marksKey] || 0) / max) * 100) : null;
}

export default function ScoreTrend({ tests = [] }) {
  const data = tests.map((test) => ({
    label: fmtDate(test.test_date, { day: "numeric", month: "short" }),
    total: testScore(test).pct,
    physics: subjectPct(test, "physics_marks", "physics_max"),
    chemistry: subjectPct(test, "chemistry_marks", "chemistry_max"),
    maths: subjectPct(test, "maths_marks", "maths_max"),
  }));

  if (data.length < 2) {
    return (
      <p className="mt-6 rounded-xl border border-dashed border-white/10 px-4 py-12 text-center text-xs text-muted-foreground">
        Log two tests to see your score trend.
      </p>
    );
  }

  return (
    <div className="mt-4 h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#8b93a3", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#8b93a3", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#8b93a3" }} />
          <Line
            type="monotone"
            dataKey="total"
            name="Total %"
            stroke="#34d399"
            strokeWidth={2}
            dot={{ r: 3, fill: "#34d399", strokeWidth: 0 }}
          />
          <Line type="monotone" dataKey="physics" name="Physics" stroke="#38bdf8" strokeWidth={1.4} dot={false} />
          <Line type="monotone" dataKey="chemistry" name="Chemistry" stroke="#a78bfa" strokeWidth={1.4} dot={false} />
          <Line type="monotone" dataKey="maths" name="Maths" stroke="#fbbf24" strokeWidth={1.4} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}