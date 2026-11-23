import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { fmtMinutes } from "@/lib/plan";

export default function SubjectSplit({ data = [] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (!total) {
    return (
      <p className="mt-6 rounded-xl border border-dashed border-white/10 px-4 py-10 text-center text-xs text-muted-foreground">
        Log focus sessions to see where your hours go.
      </p>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-4">
      <div className="h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.filter((item) => item.value > 0)}
              dataKey="value"
              innerRadius={44}
              outerRadius={64}
              paddingAngle={3}
              stroke="none"
            >
              {data
                .filter((item) => item.value > 0)
                .map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex-1 space-y-2.5 text-xs">
        {data.map((item) => (
          <li key={item.name} className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="flex-1 text-muted-foreground">{item.name}</span>
            <span className="font-mono text-[11px]">{fmtMinutes(item.value)}</span>
            <span className="w-9 text-right text-[10px] text-muted-foreground">
              {Math.round((item.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}