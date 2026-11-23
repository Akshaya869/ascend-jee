import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpenCheck,
  CalendarClock,
  Compass,
  GraduationCap,
  NotebookPen,
  Repeat,
  Timer,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/_authed/guidance")({
  component: Guidance,
  head: () => ({ meta: [{ title: "Guidance · Ascend" }] }),
});

const SECTIONS = [
  {
    icon: GraduationCap,
    title: "Your phase: Class 12",
    intro:
      "Class 12 is the closing stretch. New learning is almost done; from here the score is built by revision quality and test discipline.",
    points: [
      "Finish the Class 12 syllabus first, but keep one Class 11 revision block every single day.",
      "Boards and JEE overlap heavily in Chemistry and Maths. Study once at JEE depth, then trim to the board answer format.",
      "From January, two full mocks a week, each followed by analysis as long as the test itself.",
      "No chapter is 'done' until you have solved its previous-year questions untimed, then timed.",
    ],
  },
  {
    icon: Repeat,
    title: "Learn → Practise → Revise",
    intro:
      "One chapter should pass through four touches. Anything less fades by the exam.",
    points: [
      "First pass: concept plus 20 problems while the theory is fresh.",
      "Next day: redo only the five hardest problems, from scratch.",
      "Day 7: close the book and recall the chapter map, then attempt a mixed set.",
      "Day 21: timed problem set. If accuracy holds, mark the chapter Practiced, then Mastered after a mock-level performance.",
    ],
  },
  {
    icon: Timer,
    title: "The weekly rhythm",
    intro: "Consistency beats intensity. Build a week you can repeat for months.",
    points: [
      "All three subjects every day. No subject skipped for more than one day.",
      "Two timed problem blocks per subject each week.",
      "Sunday: one full mock in the real exam slot, then a fixed three-hour analysis block.",
      "One evening fully off. Recovery is part of the plan, not a break from it.",
    ],
  },
  {
    icon: NotebookPen,
    title: "The error notebook",
    intro: "Your mistakes are the highest-yield study material you own.",
    points: [
      "One page per mistake: the question, where you slipped, and the correct idea in one line.",
      "Tag every entry as concept, calculation, misread or time.",
      "Review the notebook before every mock, never after.",
      "When a chapter stops producing new entries, it is ready to be marked Mastered.",
    ],
  },
];

const PLAYBOOKS = [
  {
    subject: "Physics",
    color: "text-sky-300",
    dot: "bg-sky-400",
    points: [
      "Derive every formula once from first principles; then stop memorising.",
      "Mechanics, electrodynamics and modern physics carry the most marks. Protect them.",
      "Draw the diagram before writing a single equation.",
      "Advanced rewards multi-concept problems: practise combining two chapters in one question.",
    ],
  },
  {
    subject: "Chemistry",
    color: "text-violet-300",
    dot: "bg-violet-400",
    points: [
      "Inorganic is a memory map: learn trends, exceptions and then the compound tables.",
      "Organic is mechanisms, not reactions. Follow the electrons and most reactions predict themselves.",
      "Physical chemistry: 20 mole-based numericals daily keeps the speed alive.",
      "NCERT lines matter in Mains. Read them once a week, actively.",
    ],
  },
  {
    subject: "Maths",
    color: "text-amber-300",
    dot: "bg-amber-400",
    points: [
      "One chapter at a time, then 30 problems before moving on.",
      "Learn the standard substitutions and identities cold; they save minutes in the exam.",
      "Keep a one-page formula sheet per chapter and revise it weekly.",
      "Calculus and coordinate geometry decide ranks. Give them the hardest problems you can find.",
    ],
  },
];

const MAINS_VS_ADVANCED = [
  { label: "Pace", mains: "~90 seconds per question", advanced: "3–5 minutes per question" },
  { label: "Depth", mains: "Single concept, formula recall", advanced: "Multi-concept, layered reasoning" },
  { label: "Material", mains: "NCERT + previous-year Mains questions", advanced: "JEE Advanced PYQs + tough problem sets" },
  { label: "Marking", mains: "Straightforward +4 / −1", advanced: "Partial marking, multi-correct questions" },
  { label: "Skill to train", mains: "Speed with accuracy", advanced: "Stamina and structured thinking" },
];

function Guidance() {
  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">Guidance</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">A playbook, not a pep talk.</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Built for a Class 12 aspirant sitting both papers. Use it with the planner and the forecast:
          the plan decides the day, the forecast decides the month.
        </p>
      </header>

      <section className="surface relative overflow-hidden p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-medium text-emerald-300">
            <Compass className="h-3.5 w-3.5" /> Class 12 · JEE Main + Advanced
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-muted-foreground">
            <Zap className="h-3.5 w-3.5" /> Revision over new learning
          </span>
        </div>
        <h2 className="mt-4 max-w-2xl font-heading text-xl font-semibold">
          Three rules for the closing stretch
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Never zero",
              body: "A 40-minute honest block beats a skipped day. Streaks protect momentum.",
            },
            {
              title: "Test before you feel ready",
              body: "Mocks are diagnostics. A low score with a good analysis is worth more than a comfortable revision day.",
            },
            {
              title: "Revise what you miss",
              body: "Your error notebook, not the syllabus, decides the next chapter you open.",
            },
          ].map((rule) => (
            <div
              key={rule.title}
              className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4"
            >
              <p className="font-heading text-sm font-semibold">{rule.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{rule.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {SECTIONS.map((section) => (
          <section key={section.title} className="surface p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.05] text-emerald-300">
                <section.icon className="h-4 w-4" />
              </span>
              <h2 className="font-heading text-sm font-semibold">{section.title}</h2>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{section.intro}</p>
            <ul className="mt-4 space-y-2.5">
              {section.points.map((point) => (
                <li key={point} className="flex gap-2.5 text-xs leading-relaxed">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                  <span className="text-foreground/85">{point}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="surface p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.05] text-amber-300">
            <BookOpenCheck className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-heading text-sm font-semibold">Mains vs Advanced</h2>
            <p className="text-[11px] text-muted-foreground">
              Same syllabus, two different games
            </p>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <th className="pb-2 font-medium"> </th>
                <th className="pb-2 font-medium">JEE Main</th>
                <th className="pb-2 font-medium">JEE Advanced</th>
              </tr>
            </thead>
            <tbody>
              {MAINS_VS_ADVANCED.map((row) => (
                <tr key={row.label} className="border-t border-white/[0.05]">
                  <td className="py-2.5 pr-4 font-medium text-muted-foreground">{row.label}</td>
                  <td className="py-2.5 pr-4 text-foreground/90">{row.mains}</td>
                  <td className="py-2.5 text-foreground/90">{row.advanced}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {PLAYBOOKS.map((book) => (
          <section key={book.subject} className="surface p-5">
            <h2 className={`flex items-center gap-2 font-heading text-sm font-semibold ${book.color}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${book.dot}`} />
              {book.subject}
            </h2>
            <ul className="mt-3.5 space-y-2.5">
              {book.points.map((point) => (
                <li key={point} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/25" />
                  {point}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="surface p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.05] text-violet-300">
            <CalendarClock className="h-4 w-4" />
          </span>
          <h2 className="font-heading text-sm font-semibold">The last 60 days</h2>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "45 days out", body: "Stop starting new chapters. Only revision, mocks and fixes." },
            { title: "Every other day", body: "Alternate a full mock with a deep analysis day. No exceptions." },
            { title: "Revision cycles", body: "Compress to 3–4 days. Formula sheets every morning, 20 minutes." },
            { title: "Sleep", body: "Seven hours. The paper rewards a calm, rested brain more than one extra chapter." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {item.title}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-foreground/85">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}