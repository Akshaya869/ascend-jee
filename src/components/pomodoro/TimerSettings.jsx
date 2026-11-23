import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const FIELDS = [
  { key: "focus", label: "Focus", suffix: "min" },
  { key: "short", label: "Short break", suffix: "min" },
  { key: "long", label: "Long break", suffix: "min" },
  { key: "interval", label: "Long break every", suffix: "blocks" },
];

export default function TimerSettings({ profile, onSave }) {
  const [draft, setDraft] = useState({
    focus: profile?.pomodoro_focus || 25,
    short: profile?.pomodoro_short || 5,
    long: profile?.pomodoro_long || 15,
    interval: profile?.long_break_interval || 4,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft({
      focus: profile?.pomodoro_focus || 25,
      short: profile?.pomodoro_short || 5,
      long: profile?.pomodoro_long || 15,
      interval: profile?.long_break_interval || 4,
    });
  }, [profile]);

  const save = async () => {
    setSaving(true);
    await onSave({
      pomodoro_focus: Math.max(1, Number(draft.focus) || 25),
      pomodoro_short: Math.max(1, Number(draft.short) || 5),
      pomodoro_long: Math.max(1, Number(draft.long) || 15),
      long_break_interval: Math.max(2, Number(draft.interval) || 4),
    });
    setSaving(false);
    toast.success("Timer settings saved");
  };

  return (
    <section className="surface p-5">
      <h2 className="font-heading text-sm font-semibold">Timer rhythm</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {FIELDS.map((field) => (
          <label key={field.key} className="block">
            <span className="eyebrow">{field.label}</span>
            <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3">
              <input
                type="number"
                min="1"
                value={draft[field.key]}
                onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
                className="h-9 w-full bg-transparent font-mono text-sm outline-none"
              />
              <span className="shrink-0 text-[10px] text-muted-foreground">{field.suffix}</span>
            </div>
          </label>
        ))}
      </div>
      <Button
        onClick={save}
        disabled={saving}
        className="mt-4 w-full rounded-xl bg-white/[0.07] text-xs font-medium text-foreground hover:bg-white/[0.12]"
      >
        {saving ? "Saving…" : "Save rhythm"}
      </Button>
    </section>
  );
}