import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toISO } from "@/lib/plan";

const TYPES = ["Full Mains", "Full Advanced", "Part Test", "Chapter Test", "Other"];
const SUBJECT_FIELDS = [
  { label: "Physics", marks: "physics_marks", max: "physics_max" },
  { label: "Chemistry", marks: "chemistry_marks", max: "chemistry_max" },
  { label: "Maths", marks: "maths_marks", max: "maths_max" },
];

const fieldClass =
  "mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm outline-none transition focus:border-emerald-400/50";

function blankForm() {
  return {
    name: "",
    test_date: toISO(),
    test_type: "Full Mains",
    physics_marks: "",
    physics_max: 100,
    chemistry_marks: "",
    chemistry_max: 100,
    maths_marks: "",
    maths_max: 100,
    duration_minutes: 180,
    notes: "",
  };
}

export default function TestFormDialog({ onCreate }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blankForm());
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const changeType = (type) => {
    const max = type === "Full Advanced" ? 60 : 100;
    setForm((prev) => ({
      ...prev,
      test_type: type,
      physics_max: max,
      chemistry_max: max,
      maths_max: max,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    await onCreate({
      name: form.name.trim(),
      test_date: form.test_date,
      test_type: form.test_type,
      physics_marks: Number(form.physics_marks) || 0,
      physics_max: Number(form.physics_max) || 0,
      chemistry_marks: Number(form.chemistry_marks) || 0,
      chemistry_max: Number(form.chemistry_max) || 0,
      maths_marks: Number(form.maths_marks) || 0,
      maths_max: Number(form.maths_max) || 0,
      duration_minutes: Number(form.duration_minutes) || 180,
      notes: form.notes,
    });
    setSaving(false);
    setOpen(false);
    setForm(blankForm());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl bg-emerald-400 px-4 text-sm font-semibold text-emerald-950 hover:brightness-110">
          <Plus className="mr-1.5 h-4 w-4" /> Log test
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[hsl(222_26%_8%)] text-foreground sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">Log a test</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label className="eyebrow">Test name</Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Mains Full Test 12"
              className={fieldClass}
              autoFocus
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="eyebrow">Date</Label>
              <Input
                type="date"
                value={form.test_date}
                onChange={(e) => set("test_date", e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <Label className="eyebrow">Type</Label>
              <select
                value={form.test_type}
                onChange={(e) => changeType(e.target.value)}
                className={fieldClass}
              >
                {TYPES.map((type) => (
                  <option key={type} value={type} className="bg-[#0d121b]">
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <p className="eyebrow">Marks scored / maximum</p>
            {SUBJECT_FIELDS.map((field) => (
              <div key={field.marks} className="grid grid-cols-[1fr_78px_78px] items-center gap-2">
                <span className="text-xs text-muted-foreground">{field.label}</span>
                <Input
                  type="number"
                  min="0"
                  value={form[field.marks]}
                  onChange={(e) => set(field.marks, e.target.value)}
                  placeholder="0"
                  className="h-9 rounded-lg border-white/10 bg-white/[0.04] font-mono text-sm"
                />
                <Input
                  type="number"
                  min="0"
                  value={form[field.max]}
                  onChange={(e) => set(field.max, e.target.value)}
                  className="h-9 rounded-lg border-white/10 bg-white/[0.02] font-mono text-sm text-muted-foreground"
                />
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="eyebrow">Duration (minutes)</Label>
              <Input
                type="number"
                min="0"
                value={form.duration_minutes}
                onChange={(e) => set("duration_minutes", e.target.value)}
                className={`${fieldClass} font-mono`}
              />
            </div>
            <div>
              <Label className="eyebrow">Notes</Label>
              <Input
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Silly mistakes in kinematics"
                className={fieldClass}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={saving || !form.name.trim()}
            className="w-full rounded-xl bg-emerald-400 font-semibold text-emerald-950 hover:brightness-110"
          >
            {saving ? "Saving…" : "Save test"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}