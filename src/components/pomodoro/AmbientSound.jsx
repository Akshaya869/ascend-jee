import { CloudRain, Waves, VolumeX } from "lucide-react";
import { useAmbientSound } from "@/hooks/useAmbientSound";

const OPTIONS = [
  { key: "off", label: "Off", icon: VolumeX },
  { key: "brown", label: "Brown", icon: Waves },
  { key: "rain", label: "Rain", icon: CloudRain },
];

export default function AmbientSound() {
  const { mode, volume, setVolume, select } = useAmbientSound();

  return (
    <section className="surface p-5">
      <h2 className="font-heading text-sm font-semibold">Ambient sound</h2>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Generated live in the browser, no downloads.
      </p>
      <div className="mt-3 inline-flex w-full rounded-xl border border-white/[0.07] bg-white/[0.03] p-1">
        {OPTIONS.map((option) => (
          <button
            key={option.key}
            onClick={() => select(option.key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium transition ${
              mode === option.key
                ? "bg-white/10 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <option.icon className="h-3.5 w-3.5" />
            {option.label}
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="eyebrow">Volume</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          disabled={mode === "off"}
          onChange={(event) => setVolume(Number(event.target.value))}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-emerald-400 disabled:opacity-40"
        />
      </div>
    </section>
  );
}