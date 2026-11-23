import { fmtDate, toISO } from "@/lib/plan";
import { Check } from "lucide-react";

const STATUS_STYLES = {
  "Not Started": "bg-white/[0.06] text-muted-foreground",
  Learning: "bg-sky-400/10 text-sky-300",
  Practiced: "bg-amber-400/10 text-amber-300",
  Mastered: "bg-emerald-400/10 text-emerald-300",
};

export default function BoardRow({ topic, onUpdate }) {
  const confidence = topic.confidence || 0;

  return (
    <li className="flex flex-col gap-3 border-t border-white/[0.05] px-3 py-3 first:border-t-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[13px] font-medium">{topic.name}</p>
          <span
            className={`rounded-md px-1.5 py-0.5 text-[9px] font-medium ${
              topic.weightage === "High"
                ? "bg-rose-400/10 text-rose-300"
                : topic.weightage === "Medium"
                  ? "bg-amber-400/10 text-amber-300"
                  : "bg-white/[0.06] text-muted-foreground"
            }`}
          >
            {topic.weightage}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-muted-foreground">
          <span>{topic.revision_count || 0} revisions</span>
          {topic.last_studied && <span>· last {fmtDate(topic.last_studied)}</span>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => onUpdate(topic, { confidence: level === confidence ? 0 : level })}
              title={`Confidence ${level}/5`}
              className={`h-2 w-2 rounded-full transition ${
                level <= confidence ? "bg-amber-400" : "bg-white/15 hover:bg-white/30"
              }`}
            />
          ))}
        </div>

        <select
          value={topic.status}
          onChange={(e) => onUpdate(topic, { status: e.target.value })}
          className={`h-8 rounded-lg border-0 px-2 text-[11px] font-medium outline-none ${STATUS_STYLES[topic.status] || STATUS_STYLES["Not Started"]}`}
        >
          {["Not Started", "Learning", "Practiced", "Mastered"].map((status) => (
            <option key={status} value={status} className="bg-[#0d121b] text-foreground">
              {status}
            </option>
          ))}
        </select>

        <button
          onClick={() =>
            onUpdate(topic, {
              revision_count: (topic.revision_count || 0) + 1,
              last_studied: toISO(),
            })
          }
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1.5 text-[10px] text-muted-foreground transition hover:border-amber-400/40 hover:text-amber-300"
        >
          <Check className="h-3 w-3" /> Revised
        </button>
      </div>
    </li>
  );
}