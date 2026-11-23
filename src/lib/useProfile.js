import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { DEFAULT_PROFILE } from "@/lib/plan";

function normalize(user) {
  if (!user) return null;
  return {
    ...user,
    exam_date: user.exam_date || "",
    daily_target_minutes:
      Number(user.daily_target_minutes) || DEFAULT_PROFILE.daily_target_minutes,
    pomodoro_focus: Number(user.pomodoro_focus) || DEFAULT_PROFILE.pomodoro_focus,
    pomodoro_short: Number(user.pomodoro_short) || DEFAULT_PROFILE.pomodoro_short,
    pomodoro_long: Number(user.pomodoro_long) || DEFAULT_PROFILE.pomodoro_long,
    long_break_interval:
      Number(user.long_break_interval) || DEFAULT_PROFILE.long_break_interval,
  };
}

export function useProfile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let alive = true;
    base44.auth
      .me()
      .then((user) => {
        if (alive) setProfile(normalize(user));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const saveProfile = async (patch) => {
    await base44.auth.updateMe(patch);
    setProfile((prev) => normalize({ ...(prev || {}), ...patch }));
  };

  return { profile, saveProfile };
}