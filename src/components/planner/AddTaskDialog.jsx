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
import { SUBJECTS } from "@/lib/plan";

const fieldClass =
  "mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm outline-none transition focus:border-emerald-400/50";

export default function AddTaskDialog({ date, chapters = [], onCreate }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Physics");
  const [chapter, setChapter] = useState("");
  const [minutes, setMinutes] = useState(45);
  const [saving, setSaving] = useState(false);

  const options = chapters.filter((c) => c.subject === subject);

  const submit = async (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await onCreate({
      date,
      title: title.trim(),
      subject,
      chapter_name: chapter,
      target_minutes: Math.max(5, Number(minutes) || 45),
      status: "Todo",
    });
    setSaving(false);
    setOpen(false);
    setTitle("");
    setChapter("");
    setMinutes(45);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl bg-emerald-400 px-4 text-sm font-semibold text-emerald-950 hover:brightness-110">
          <Plus className="mr-1.5 h-4 w-4" /> Add block
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-[hsl(222_26%_8%)] text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">New study block</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label className="eyebrow">What will you do</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Rotational motion — problem set 4"
              className={fieldClass}
              autoFocus
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="eyebrow">Subject</Label>
              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setChapter("");
                }}
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
              <Label className="eyebrow">Minutes</Label>
              <Input
                type="number"
                min="5"
                step="5"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className={`${fieldClass} font-mono`}
              />
            </div>
          </div>
          <div>
            <Label className="eyebrow">Chapter (optional)</Label>
            <select
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              className={fieldClass}
            >
              <option value="" className="bg-[#0d121b]">
                Not linked
              </option>
              {options.map((c) => (
                <option key={c.id} value={c.name} className="bg-[#0d121b]">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="submit"
            disabled={saving || !title.trim()}
            className="w-full rounded-xl bg-emerald-400 font-semibold text-emerald-950 hover:brightness-110"
          >
            {saving ? "Adding…" : "Add to plan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}