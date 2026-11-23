import { useState } from "react";
import { Plus } from "lucide-react";
import { SUBJECTS, toISO } from "@/lib/plan";

const field =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-emerald-400/40";

export default function AddQuestionForm({ onCreate }) {
  const [form, setForm] = useState({
    date: toISO(),
    subject: "Physics",
    count: 5,
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const count = Number(form.count);
    if (!count || count < 1) return;
    setSaving(true);
    await onCreate({ ...form, count });
    setForm((prev) => ({ ...prev, count: 5, notes: "" }));
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="surface p-5">
      <h2 className="font-heading text-sm font-semibold">Log advanced questions</h2>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Only JEE Advanced level problems — the ones that take thinking.
      </p>

      <label className="eyebrow mt-4 block">Date</label>
      <input
        type="date"
        value={form.date}
        onChange={(event) => setForm({ ...form, date: event.target.value })}
        className={`${field} mt-1`}
      />

      <label className="eyebrow mt-3 block">Subject</label>
      <select
        value={form.subject}
        onChange={(event) => setForm({ ...form, subject: event.target.value })}
        className={`${field} mt-1`}
      >
        {SUBJECTS.map((subject) => (
          <option key={subject.key} value={subject.key}>
            {subject.key}
          </option>
        ))}
      </select>

      <label className="eyebrow mt-3 block">Solved</label>
      <input
        type="number"
        min="1"
        max="200"
        value={form.count}
        onChange={(event) => setForm({ ...form, count: event.target.value })}
        className={`${field} mt-1`}
      />

      <label className="eyebrow mt-3 block">Note (optional)</label>
      <input
        type="text"
        value={form.notes}
        onChange={(event) => setForm({ ...form, notes: event.target.value })}
        placeholder="Rotational motion, Q21-40"
        className={`${field} mt-1`}
      />

      <button
        type="submit"
        disabled={saving}
        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-400 px-3 py-2 text-xs font-semibold text-emerald-950 transition hover:brightness-110 disabled:opacity-50"
      >
        <Plus className="h-3.5 w-3.5" />
        {saving ? "Saving…" : "Add to week"}
      </button>
    </form>
  );
}