export default function StatCard({ icon: Icon, label, value, hint, tone = "primary" }) {
  const tones = {
    primary: "text-emerald-300 bg-emerald-400/10",
    amber: "text-amber-300 bg-amber-400/10",
    sky: "text-sky-300 bg-sky-400/10",
    violet: "text-violet-300 bg-violet-400/10",
  };

  return (
    <div className="surface surface-hover p-5">
      <div className="flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 font-heading text-2xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}