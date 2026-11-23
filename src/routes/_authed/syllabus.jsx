import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useSyllabus } from "@/lib/useSyllabus";
import { STATUSES, SUBJECTS } from "@/lib/plan";
import ChapterRow from "@/components/syllabus/ChapterRow";
import AddChapterDialog from "@/components/syllabus/AddChapterDialog";

export const Route = createFileRoute("/_authed/syllabus")({
  component: Syllabus,
  head: () => ({ meta: [{ title: "Syllabus · Ascend" }] }),
});

function Syllabus() {
  const { chapters, reload } = useSyllabus();
  const [subject, setSubject] = useState("All");
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");

  const all = chapters || [];
  const mastered = all.filter((c) => c.status === "Mastered").length;
  const pct = all.length ? Math.round((mastered / all.length) * 100) : 0;

  const filtered = all.filter((c) => {
    if (subject !== "All" && c.subject !== subject) return false;
    if (status !== "All" && c.status !== status) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const update = async (chapter, patch) => {
    await base44.entities.Chapter.update(chapter.id, patch);
    await reload();
  };

  const create = async (payload) => {
    await base44.entities.Chapter.create({ ...payload, status: "Not Started", confidence: 0, revision_count: 0, order_index: all.length + 1 });
    await reload();
  };

  const groups =
    subject === "All" ? SUBJECTS.map((s) => s.key) : [subject];

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Syllabus tracker</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold">Mains + Advanced, mapped.</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Move each chapter from Not Started to Mastered. Confidence and revision counts decide
            what gets suggested next.
          </p>
        </div>
        <AddChapterDialog onCreate={create} />
      </header>

      <section className="surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Overall mastery</p>
            <p className="mt-1 font-heading text-2xl font-semibold">
              {mastered}
              <span className="text-sm font-normal text-muted-foreground"> / {all.length} chapters</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => {
              const list = all.filter((c) => c.subject === s.key);
              const done = list.filter((c) => c.status === "Mastered").length;
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
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex flex-wrap rounded-xl border border-white/[0.07] bg-white/[0.03] p-1">
          {["All", ...SUBJECTS.map((s) => s.key)].map((key) => (
            <button
              key={key}
              onClick={() => setSubject(key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                subject === key
                  ? "bg-white/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {key === "Mathematics" ? "Maths" : key}
            </button>
          ))}
        </div>
        <div className="relative min-w-[180px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chapters"
            className="h-9 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-9 pr-3 text-xs outline-none transition focus:border-emerald-400/40"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-xs outline-none focus:border-emerald-400/40"
        >
          {["All", ...STATUSES].map((s) => (
            <option key={s} value={s} className="bg-[#0d121b]">
              {s === "All" ? "All statuses" : s}
            </option>
          ))}
        </select>
      </div>

      {groups.map((groupKey) => {
        const list = filtered.filter((c) => c.subject === groupKey);
        if (!list.length) return null;
        return (
          <section key={groupKey} className="surface overflow-hidden">
            <header className="flex items-center justify-between border-b border-white/[0.05] px-4 py-3">
              <h2 className="font-heading text-sm font-semibold">{groupKey}</h2>
              <span className="text-[10px] text-muted-foreground">
                {list.filter((c) => c.status === "Mastered").length} mastered · {list.length} shown
              </span>
            </header>
            <ul>
              {list.map((chapter) => (
                <ChapterRow key={chapter.id} chapter={chapter} onUpdate={update} />
              ))}
            </ul>
          </section>
        );
      })}

      {filtered.length === 0 && (
        <p className="surface px-4 py-10 text-center text-xs text-muted-foreground">
          No chapters match those filters.
        </p>
      )}
    </div>
  );
}