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
import { EXAM_SCOPES, SUBJECTS, WEIGHTS } from "@/lib/plan";

const fieldClass =
  "mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm outline-none transition focus:border-emerald-400/50";

export default function AddChapterDialog({ defaultSubject = "Physics", onCreate }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [scope, setScope] = useState("Both");
  const [weightage, setWeightage] = useState("Medium");
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onCreate({ name: name.trim(), subject, exam_scope: scope, weightage });
    setSaving(false);
    setOpen(false);
    setName("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="rounded-xl border-white/10 bg-white/[0.03] text-sm text-foreground hover:bg-white/[0.07]"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add chapter
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-[hsl(222_26%_8%)] text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">Add a chapter</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label className="eyebrow">Chapter name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rotational Motion"
              className={fieldClass}
              autoFocus
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label className="eyebrow">Subject</Label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={fieldClass}
              >
                {SUBJECTS.map((s) => (
                  <option key={s.key} value={s.key} className="bg-[#0d121b]">
                    {s.key}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="eyebrow">Scope</Label>
              <select value={scope} onChange={(e) => setScope(e.target.value)} className={fieldClass}>
                {EXAM_SCOPES.map((s) => (
                  <option key={s} value={s} className="bg-[#0d121b]">
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="eyebrow">Weightage</Label>
              <select
                value={weightage}
                onChange={(e) => setWeightage(e.target.value)}
                className={fieldClass}
              >
                {WEIGHTS.map((w) => (
                  <option key={w} value={w} className="bg-[#0d121b]">
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button
            type="submit"
            disabled={saving || !name.trim()}
            className="w-full rounded-xl bg-emerald-400 font-semibold text-emerald-950 hover:brightness-110"
          >
            {saving ? "Adding…" : "Add chapter"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}