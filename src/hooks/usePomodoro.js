import { useCallback, useEffect, useRef, useState } from "react";

export const PHASE_LABEL = { focus: "Deep focus", short: "Short break", long: "Long break" };

const KEY = "ascend.pomodoro.v1";
const LOG_KEY = "ascend.pomodoro.logged";

function chime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const gain = ctx.createGain();
    gain.gain.value = 0.06;
    gain.connect(ctx.destination);
    [880, 1174].forEach((freq, index) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      osc.start(ctx.currentTime + index * 0.22);
      osc.stop(ctx.currentTime + index * 0.22 + 0.2);
    });
    setTimeout(() => ctx.close(), 900);
  } catch {
    /* audio not available */
  }
}

function msFor(durations, phase) {
  const minutes = Number(durations[phase]) || Number(durations.focus) || 25;
  return Math.max(1, minutes) * 60000;
}

function createState(durations, { phase = "focus", focusCount = 0, strict = false, running = false } = {}) {
  const ms = msFor(durations, phase);
  return {
    phase,
    focusCount,
    strict,
    running,
    remainingMs: ms,
    blockMs: ms,
    deadline: running ? Date.now() + ms : null,
    blockStartedAt: running && phase === "focus" ? Date.now() : null,
  };
}

function restore(durations) {
  if (typeof window === "undefined") return null;
  try {
    const stored = JSON.parse(window.localStorage.getItem(KEY) || "null");
    if (!stored || !PHASE_LABEL[stored.phase]) return null;
    if (stored.running && stored.deadline) {
      const left = stored.deadline - Date.now();
      if (left > 0) return stored;
      return { ...stored, remainingMs: 0 };
    }
    return stored;
  } catch {
    return null;
  }
}

export function usePomodoro({ focus = 25, short = 5, long = 15, interval = 4, onBlockComplete }) {
  const durationsRef = useRef({ focus, short, long });
  durationsRef.current = { focus, short, long };
  const intervalRef = useRef(interval);
  intervalRef.current = Math.max(2, Number(interval) || 4);
  const completeRef = useRef(onBlockComplete);
  completeRef.current = onBlockComplete;

  const [state, setState] = useState(
    () => restore(durationsRef.current) || createState(durationsRef.current)
  );
  const [now, setNow] = useState(() => Date.now());
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state]);

  useEffect(() => {
    if (!state.running || !state.deadline) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [state.running, state.deadline]);

  const secondsLeft =
    state.running && state.deadline
      ? Math.max(0, Math.ceil((state.deadline - now) / 1000))
      : Math.max(0, Math.ceil(state.remainingMs / 1000));

  const total = Math.max(1, Math.round((state.blockMs || msFor(durationsRef.current, state.phase)) / 1000));
  const finishing = state.running && secondsLeft <= 0;

  useEffect(() => {
    if (!finishing) return;
    chime();
    const finished = state;
    const isFocus = finished.phase === "focus";
    const nextCount = isFocus ? finished.focusCount + 1 : finished.focusCount;
    const nextPhase = isFocus
      ? nextCount % intervalRef.current === 0
        ? "long"
        : "short"
      : "focus";

    if (isFocus) {
      const token = String(finished.blockStartedAt || finished.deadline);
      let alreadyLogged = false;
      try {
        alreadyLogged = window.localStorage.getItem(LOG_KEY) === token;
        if (!alreadyLogged) window.localStorage.setItem(LOG_KEY, token);
      } catch {
        /* storage unavailable */
      }
      if (!alreadyLogged) {
        const minutes = Math.max(
          1,
          Math.round((finished.blockMs || msFor(durationsRef.current, "focus")) / 60000)
        );
        completeRef.current?.({ minutes });
      }
    }

    setState(
      createState(durationsRef.current, {
        phase: nextPhase,
        focusCount: nextCount,
        strict: finished.strict,
        running: finished.strict,
      })
    );
  }, [finishing, state]);

  useEffect(() => {
    setState((prev) => {
      if (prev.running) return prev;
      const ms = msFor(durationsRef.current, prev.phase);
      return { ...prev, remainingMs: ms, blockMs: ms, deadline: null };
    });
  }, [focus, short, long]);

  const start = useCallback(({ strict = false } = {}) => {
    setState((prev) => {
      const base =
        prev.phase === "focus"
          ? prev
          : createState(durationsRef.current, {
              phase: "focus",
              focusCount: prev.focusCount,
              strict,
            });
      const ms = base.remainingMs > 0 ? base.remainingMs : msFor(durationsRef.current, "focus");
      return {
        ...base,
        strict,
        running: true,
        remainingMs: ms,
        blockMs: base.blockMs || ms,
        deadline: Date.now() + ms,
        blockStartedAt: base.blockStartedAt || Date.now(),
      };
    });
  }, []);

  const toggle = useCallback(() => {
    setState((prev) => {
      if (prev.running && prev.strict) return prev;
      if (prev.running) {
        const left = Math.max(0, (prev.deadline || Date.now()) - Date.now());
        return { ...prev, running: false, deadline: null, remainingMs: left };
      }
      const ms = prev.remainingMs > 0 ? prev.remainingMs : msFor(durationsRef.current, prev.phase);
      return {
        ...prev,
        running: true,
        remainingMs: ms,
        blockMs: prev.blockMs || ms,
        deadline: Date.now() + ms,
        blockStartedAt:
          prev.phase === "focus" ? prev.blockStartedAt || Date.now() : prev.blockStartedAt,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState((prev) => {
      if (prev.running && prev.strict) return prev;
      return createState(durationsRef.current, {
        phase: prev.phase,
        focusCount: prev.focusCount,
        strict: prev.strict,
      });
    });
  }, []);

  const skip = useCallback(() => {
    setState((prev) => {
      if (prev.running && prev.strict) return prev;
      if (prev.phase !== "focus") {
        return createState(durationsRef.current, {
          phase: "focus",
          focusCount: prev.focusCount,
          strict: prev.strict,
        });
      }
      const nextCount = prev.focusCount + 1;
      const nextPhase = nextCount % intervalRef.current === 0 ? "long" : "short";
      return createState(durationsRef.current, {
        phase: nextPhase,
        focusCount: nextCount,
        strict: prev.strict,
      });
    });
  }, []);

  const selectPhase = useCallback((phase) => {
    setState((prev) => {
      if (prev.running || !PHASE_LABEL[phase]) return prev;
      return createState(durationsRef.current, {
        phase,
        focusCount: prev.focusCount,
        strict: prev.strict,
      });
    });
  }, []);

  const endBlock = useCallback(({ keepRounds }) => {
    const prev = stateRef.current;
    if (prev.running && prev.strict) return;
    const isFocus = prev.phase === "focus";
    const blockMs = prev.blockMs || msFor(durationsRef.current, prev.phase);
    const leftMs =
      prev.running && prev.deadline
        ? Math.max(0, prev.deadline - Date.now())
        : Math.max(0, prev.remainingMs);
    const minutes = Math.floor((blockMs - leftMs) / 60000);
    if (isFocus && minutes >= 1) completeRef.current?.({ minutes, partial: true });
    setState(
      createState(durationsRef.current, {
        phase: keepRounds && isFocus ? "short" : "focus",
        focusCount: keepRounds ? prev.focusCount : 0,
        strict: prev.strict,
      })
    );
  }, []);

  const endFocus = useCallback(() => endBlock({ keepRounds: true }), [endBlock]);
  const endSession = useCallback(() => endBlock({ keepRounds: false }), [endBlock]);

  return {
    phase: state.phase,
    phaseLabel: PHASE_LABEL[state.phase],
    running: state.running,
    strict: state.strict,
    locked: state.running && state.strict,
    secondsLeft,
    total,
    focusCount: state.focusCount,
    start,
    toggle,
    reset,
    skip,
    selectPhase,
    endFocus,
    endSession,
  };
}