import { Check, Circle, Trash2 } from "lucide-react";
import { fmtMinutes, subjectMeta } from "@/lib/plan";

export default function TaskRow({ task, onToggle, onDelete }) {
  const meta = subjectMeta(task.subject);
  const done = task.status === "Done";

  return (
    <li className="group flex items-center gap-3 rounded-xl border border-white/[0.05] px-3 py-3 transition hover:border-white/10 hover:bg-white/[0.035]">
      <button
        onClick={() => onToggle(task)}
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition ${
          done
            ? "border-emerald-400 bg-emerald-400 text-emerald-950"
            : "border-white/20 text-transparent hover:border-emerald-400/60"
        }`}
        aria-label={done ? "Mark as not done" : "Mark as done"}
      >
        {done ? <Check className="h-3 w-3" /> : <Circle className="h-2 w-2" />}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-[13px] ${done ? "text-muted-foreground line-through" : ""}`}
        >
          {task.title}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          {task.subject}
          {task.chapter_name ? ` · ${task.chapter_name}` : ""}
        </p>
      </div>

      <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
        {fmtMinutes(task.target_minutes || 45)}
      </span>
      <button
        onClick={() => onDelete(task)}
        className="shrink-0 rounded-lg p-1.5 text-muted-foreground opacity-0 transition hover:bg-white/5 hover:text-destructive group-hover:opacity-100"
        aria-label="Delete task"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}