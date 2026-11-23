import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, GraduationCap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useBoards } from "@/lib/useBoards";
import { BOARD_RESOURCES, BOARD_SUBJECTS, boardSubjectMeta } from "@/lib/boardsSyllabus";
import BoardRow from "@/components/boards/BoardRow";

export const Route = createFileRoute("/_authed/boards")({
  component: Boards,
  head: () => ({ meta: [{ title: "Boards · Ascend" }] }),
});

function Boards() {
  const { topics, reload } = useBoards();
  const [subject, setSubject] = useState("All");
  const all = topics || [];
  const visible = subject === "All" ? all : all.filter((t) => t.subject === subject);
  const mastered = all.filter((t) => t.status === "Mastered").length;
  const pct = all.length ? Math.round((mastered / all.length) * 100) : 0;

  const update = async (topic, patch) => {
    await base44.entities.BoardTopic.update(topic.id, patch);
    await reload();
  };

  const grouped = [];
  for (const topic of visible) {
    const last = grouped[grouped.length - 1];
    if (last && last.unit === topic.unit) last.items.push(topic);
    else grouped.push({ unit: topic.unit, subject: topic.subject, items: [topic] });
  }

  const highLeft = all.filter((t) => t.weightage === "High" && t.status !== "Mastered").length;

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow">CBSE Class 12 boards</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">Board prep, side by side.</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Same chapters, different paper. Track the board side separately so presentation, NCERT
          lines and sample papers get their own revision cycle.
        </p>
      </header>

      <section className="surface p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Board syllabus mastery</p>
            <p className="mt-1 font-heading text-2xl font-semibold">
              {mastered}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / {all.length} topics
              </span>
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {highLeft} high-weightage topics still open
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {BOARD_SUBJECTS.map((s) => {
              const list = all.filter((t) => t.subject === s.key);
              const done = list.filter((t) => t.status === "Mastered").length;
              return (
                <span
                  key={s.key}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-muted-foreground"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                  {s.short}
                  <span className="font-mono">
                    {done}/{list.length}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-400 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </section>

      <section className="surface p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.05] text-amber-300">
            <GraduationCap className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-heading text-sm font-semibold">Official resources</h2>
            <p className="text-[11px] text-muted-foreground">
              Syllabus, sample papers and dates straight from the source
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {BOARD_RESOURCES.map((resource) => (
            <a
              key={resource.href}
              href={resource.href}
              target="_blank"
              rel="noreferrer"
              className="group rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 transition hover:border-amber-400/30 hover:bg-white/[0.05]"
            >
              <p className="flex items-center justify-between gap-2 text-xs font-medium">
                {resource.label}
                <ArrowUpRight className="h-3 w-3 text-muted-foreground transition group-hover:text-amber-300" />
              </p>
              <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                {resource.detail}
              </p>
            </a>
          ))}
        </div>
      </section>

      <div className="inline-flex flex-wrap rounded-xl border border-white/[0.07] bg-white/[0.03] p-1">
        {["All", ...BOARD_SUBJECTS.map((s) => s.key)].map((key) => (
          <button
            key={key}
            onClick={() => setSubject(key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              subject === key
                ? "bg-white/10 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {key === "Mathematics" ? "Maths" : key === "Computer Science" ? "CS" : key}
          </button>
        ))}
      </div>

      {all.length === 0 ? (
        <div className="h-64 animate-pulse rounded-2xl bg-white/[0.04]" />
      ) : (
        grouped.map((group) => (
          <section key={`${group.subject}-${group.unit}`} className="surface overflow-hidden">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.05] px-4 py-3">
              <div className="flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${boardSubjectMeta(group.subject).dot}`}
                />
                <h2 className="font-heading text-sm font-semibold">{group.unit}</h2>
                <span className="text-[10px] text-muted-foreground">{group.subject}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {group.items.filter((t) => t.status === "Mastered").length}/{group.items.length} mastered
              </span>
            </header>
            <ul>
              {group.items.map((topic) => (
                <BoardRow key={topic.id} topic={topic} onUpdate={update} />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}