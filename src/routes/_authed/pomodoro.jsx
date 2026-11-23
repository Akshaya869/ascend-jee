import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Flame, Flag, Lock, Pause, Play, RotateCcw, SkipForward, X } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";
import { useSyllabus } from "@/lib/useSyllabus";
import { useEntityList } from "@/lib/useEntityList";
import { usePomodoro } from "@/hooks/usePomodoro";
import { fmtMinutes, subjectMeta, toISO } from "@/lib/plan";
import TimerDial from "@/components/pomodoro/TimerDial";
import TimerSettings from "@/components/pomodoro/TimerSettings";
import SessionSetup from "@/components/pomodoro/SessionSetup";
import AmbientSound from "@/components/pomodoro/AmbientSound";

export const Route = createFileRoute("/_authed/pomodoro")({
  component: FocusPage,
  head: () => ({ meta: [{ title: "Focus · Ascend" }] }),
});

const CTX_KEY = "ascend.pomodoro.context";

function readContext() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(CTX_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

const PHASES = [
  ["focus", "Focus"],
  ["short", "Short break"],
  ["long", "Long break"],
];

function FocusPage() {
  const { profile, saveProfile } = useProfile();
  const { chapters } = useSyllabus();
  const { items: sessions, reload } = useEntityList(
    "StudySession",
    { date: toISO() },
    "-created_date",
    100
  );

  const [subject, setSubject] = useState(() => readContext().subject || "Physics");
  const [chapter, setChapter] = useState(() => readContext().chapter || "");
  const [blockLength, setBlockLength] = useState(() => readContext().blockLength || 0);
  const [strictMode, setStrictMode] = useState(() => readContext().strictMode ?? true);

  const focusMinutes = blockLength || profile?.pomodoro_focus || 25;
  const ctxRef = useRef({ subject, chapter });
  ctxRef.current = { subject, chapter };

  useEffect(() => {
    try {
      window.localStorage.setItem(
        CTX_KEY,
        JSON.stringify({ subject, chapter, blockLength, strictMode })
      );
    } catch {
      /* storage unavailable */
    }
  }, [subject, chapter, blockLength, strictMode]);

  const timer = usePomodoro({
    focus: focusMinutes,
    short: profile?.pomodoro_short || 5,
    long: profile?.pomodoro_long || 15,
    interval: profile?.long_break_interval || 4,
    onBlockComplete: async ({ minutes }) => {
      await base44.entities.StudySession.create({
        date: toISO(),
        subject: ctxRef.current.subject,
        chapter_name: ctxRef.current.chapter,
        minutes,
        mode: "Focus",
      });
      toast.success(`${minutes}m logged · ${ctxRef.current.subject}`);
      reload();
    },
  });

  const options = (chapters || []).filter((c) => c.subject === subject);
  const totalToday = (sessions || []).reduce((sum, s) => sum + (s.minutes || 0), 0);
  const meta = subjectMeta(subject);
  const interval = profile?.long_break_interval || 4;
  const cyclePos = timer.focusCount % interval;
  const locked = timer.locked;
  const canResume = timer.secondsLeft > 0 && timer.secondsLeft < timer.total;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Focus session</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold">Get your focus back.</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Pick the chapter, start a block and stay in it. Sessions keep running if you leave this
            page, and every finished block lands in your forecast.
          </p>
        </div>
        <div className="flex items-stretch gap-2">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-3 text-right">
            <p className="eyebrow">Logged today</p>
            <p className="mt-1 font-mono text-lg font-semibold">{fmtMinutes(totalToday)}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-3 text-right">
            <p className="eyebrow">Blocks</p>
            <p className="mt-1 font-mono text-lg font-semibold">{(sessions || []).length}</p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="surface relative overflow-hidden p-6 lg:col-span-2">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-xl border border-white/[0.07] bg-white/[0.03] p-1">
              {PHASES.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => timer.selectPhase(key)}
                  disabled={timer.running || locked}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-40 ${
                    timer.phase === key
                      ? "bg-white/10 text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {timer.strict && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/25 bg-amber-300/[0.08] px-2.5 py-1 text-[10px] font-medium text-amber-200">
                  <Flame className="h-3 w-3" />
                  Strict
                </span>
              )}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: interval }).map((_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 w-1.5 rounded-full ${
                      index < cyclePos ? "bg-emerald-400" : "bg-white/15"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="relative mt-6">
            <TimerDial
              secondsLeft={timer.secondsLeft}
              total={timer.total}
              phase={timer.phase}
              running={timer.running}
            />
          </div>

          <div className="relative mt-6 flex items-center justify-center gap-3">
            <button
              onClick={timer.reset}
              disabled={locked}
              title={locked ? "Locked in strict mode" : "Reset block"}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-muted-foreground transition hover:bg-white/5 hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              onClick={() => {
                if (timer.running) return timer.toggle();
                if (canResume && timer.strict) return timer.toggle();
                return timer.start({ strict: strictMode });
              }}
              disabled={locked}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-7 py-3 text-sm font-semibold text-emerald-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {locked ? (
                <Lock className="h-4 w-4" />
              ) : timer.running ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {locked
                ? "Locked in"
                : timer.running
                  ? "Pause"
                  : canResume
                    ? "Resume"
                    : timer.phase === "focus"
                      ? "Start focus"
                      : "Start break"}
            </button>

            <button
              onClick={timer.skip}
              disabled={locked}
              title={locked ? "Locked in strict mode" : "Skip phase"}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-muted-foreground transition hover:bg-white/5 hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          <div className="relative mt-3 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={timer.endFocus}
              disabled={locked}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-1.5 text-[11px] text-muted-foreground transition hover:bg-white/5 hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Flag className="h-3 w-3" />
              End focus
            </button>
            <button
              onClick={timer.endSession}
              disabled={locked}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-1.5 text-[11px] text-muted-foreground transition hover:bg-white/5 hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <X className="h-3 w-3" />
              End session
            </button>
          </div>

          <SessionSetup
            subject={subject}
            chapter={chapter}
            options={options}
            blockLength={blockLength}
            defaultFocus={profile?.pomodoro_focus || 25}
            strictMode={strictMode}
            locked={locked}
            onSubject={setSubject}
            onChapter={setChapter}
            onBlockLength={setBlockLength}
            onStrict={setStrictMode}
          />
        </section>

        <aside className="space-y-4">
          <section className="surface p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-sm font-semibold">Today's blocks</h2>
              <span className={`inline-flex items-center gap-1.5 text-[10px] ${meta.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                {subject}
              </span>
            </div>
            {(sessions || []).length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-xs text-muted-foreground">
                No focus blocks yet. Start the timer.
              </p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {sessions.map((s) => {
                  const m = subjectMeta(s.subject);
                  return (
                    <li key={s.id} className="flex items-center gap-3 text-xs">
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${m.dot}`} />
                      <span className="min-w-0 flex-1 truncate">{s.chapter_name || s.subject}</span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {s.minutes}m
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <AmbientSound />

          <TimerSettings profile={profile} onSave={saveProfile} />
        </aside>
      </div>
    </div>
  );
}