import { useCallback, useEffect, useRef, useState } from "react";

function brownBuffer(ctx, seconds = 4) {
  const length = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
  return buffer;
}

function whiteBuffer(ctx, seconds = 4) {
  const length = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}

export function useAmbientSound() {
  const [mode, setMode] = useState("off");
  const [volume, setVolume] = useState(0.35);
  const nodeRef = useRef(null);

  const stop = useCallback(() => {
    const node = nodeRef.current;
    nodeRef.current = null;
    if (!node) return;
    try {
      node.source.stop();
      node.source.disconnect();
      node.gain.disconnect();
      node.ctx.close();
    } catch {
      /* already closed */
    }
  }, []);

  const start = useCallback(
    (nextMode, nextVolume) => {
      stop();
      if (nextMode === "off") return;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const source = ctx.createBufferSource();
      source.buffer = nextMode === "rain" ? whiteBuffer(ctx) : brownBuffer(ctx);
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      if (nextMode === "rain") {
        filter.type = "bandpass";
        filter.frequency.value = 1100;
        filter.Q.value = 0.6;
      } else {
        filter.type = "lowpass";
        filter.frequency.value = 900;
      }

      const gain = ctx.createGain();
      gain.gain.value = nextVolume;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();
      nodeRef.current = { ctx, source, gain };
    },
    [stop]
  );

  useEffect(() => {
    if (nodeRef.current) nodeRef.current.gain.gain.value = volume;
  }, [volume]);

  useEffect(() => stop, [stop]);

  const select = useCallback(
    (nextMode) => {
      setMode(nextMode);
      start(nextMode, volume);
    },
    [start, volume]
  );

  return { mode, volume, setVolume, select };
}