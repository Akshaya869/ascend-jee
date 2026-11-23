import { Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { SUBJECTS } from "@/lib/plan";

const LENGTHS = [25, 45, 60];

const selectClass =
  "mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm outline-none transition focus:border-emerald-400/50 disabled:opacity-50";

export default function SessionSetup({
  subject,
  chapter,
  options = [],
  blockLength,
  defaultFocus,
  strictMode,
  locked,
  onSubject,
  onChapter,
  onBlockLength,
  onStrict,
}) {
  const activeLength = blockLength || defaultFocus;

  return (
    <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Block length</p>
          <div className="mt-2 inline-flex rounded-xl border border-white/[0.07] bg-white/[0.03] p-1">
            {LENGTHS.map((minutes) => (
              <button
                key={minutes}
                disabled={locked}
                onClick={() => onBlockLength(minutes)}
                className={`rounded-lg px-3 py-1.5 font-mono text-xs transition disabled:opacity-50 ${
                  activeLength === minutes
                    ? "bg-emerald-400/15 text-emerald-300"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {minutes}m
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2.5">
          <span className="text-xs text-muted-foreground">Strict mode</span>
          <Switch checked={strictMode} onCheckedChange={onStrict} disabled={locked} />
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="eyebrow">Subject</span>
          <select
            value={subject}
            disabled={locked}
            onChange={(e) => {
              onSubject(e.target.value);
              onChapter("");
            }}
            className={selectClass}
          >
            {SUBJECTS.map((s) => (
              <option key={s.key} value={s.key} className="bg-[#0d121b]">
                {s.key}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="eyebrow">Chapter</span>
          <select
            value={chapter}
            disabled={locked}
            onChange={(e) => onChapter(e.target.value)}
            className={selectClass}
          >
            <option value="" className="bg-[#0d121b]">
              General practice
            </option>
            {options.map((c) => (
              <option key={c.id} value={c.name} className="bg-[#0d121b]">
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {locked ? (
        <p className="mt-4 flex items-center gap-2 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] px-3 py-2 text-[11px] text-amber-200">
          <Lock className="h-3.5 w-3.5 shrink-0" />
          Strict mode is on. This block cannot be paused, skipped or changed until it ends.
        </p>
      ) : (
        <p className="mt-4 text-[11px] text-muted-foreground">
          Each finished block is logged against this chapter and feeds your forecast.
        </p>
      )}
    </div>
  );
}