import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import { useProfile } from "@/lib/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fmtMinutes } from "@/lib/plan";

export const Route = createFileRoute("/_authed/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings · Ascend" }] }),
});

const TARGET_PRESETS = [240, 300, 360, 420];
const fieldClass =
  "mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm outline-none transition focus:border-emerald-400/50";

function SettingsPage() {
  const { profile, saveProfile } = useProfile();
  const { user, logout } = useAuth();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      exam_date: profile.exam_date || "",
      daily_target_minutes: profile.daily_target_minutes,
    });
  }, [profile]);

  const save = async (event) => {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    await saveProfile({
      exam_date: form.exam_date,
      daily_target_minutes: Math.max(30, Number(form.daily_target_minutes) || 300),
    });
    setSaving(false);
    toast.success("Settings saved");
  };

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">Settings</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">Your targets.</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          The exam date powers the countdown and the forecast. The daily target shapes your plan and
          progress rings.
        </p>
      </header>

      {!form ? (
        <div className="h-64 animate-pulse rounded-2xl bg-white/[0.04]" />
      ) : (
        <form onSubmit={save} className="surface space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="eyebrow">Exam date</Label>
              <Input
                type="date"
                value={form.exam_date}
                onChange={(e) => setForm({ ...form, exam_date: e.target.value })}
                className={fieldClass}
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Use your JEE Main session date. Update it when the next session is announced.
              </p>
            </div>
            <div>
              <Label className="eyebrow">Daily focus target</Label>
              <Input
                type="number"
                min="30"
                step="15"
                value={form.daily_target_minutes}
                onChange={(e) =>
                  setForm({ ...form, daily_target_minutes: e.target.value })
                }
                className={`${fieldClass} font-mono`}
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {TARGET_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setForm({ ...form, daily_target_minutes: preset })}
                    className={`rounded-lg border px-2 py-1 text-[10px] transition ${
                      Number(form.daily_target_minutes) === preset
                        ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                        : "border-white/10 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {fmtMinutes(preset)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-5">
            <p className="text-[11px] text-muted-foreground">
              Currently aiming for {fmtMinutes(profile.daily_target_minutes)} of focused work a day.
            </p>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-emerald-400 px-5 font-semibold text-emerald-950 hover:brightness-110"
            >
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      )}

      <section className="surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] text-xs font-semibold">
              {(user?.full_name || user?.email || "A").slice(0, 1).toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-medium">{user?.full_name || "Aspirant"}</p>
              <p className="text-[11px] text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => logout()}
            className="rounded-xl border-white/10 bg-white/[0.03] text-xs text-muted-foreground hover:text-foreground"
          >
            <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign out
          </Button>
        </div>
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
          Your syllabus, sessions and tests are private to your account. Nothing is shared with other
          users.
        </p>
      </section>
    </div>
  );
}