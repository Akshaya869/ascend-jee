import { Link, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarDays,
  Timer,
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  Sparkles,
  Zap,
  GraduationCap,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/planner", label: "Planner", icon: CalendarDays },
  { to: "/pomodoro", label: "Focus", icon: Timer },
  { to: "/syllabus", label: "Syllabus", icon: BookOpen },
  { to: "/boards", label: "Boards", icon: GraduationCap },
  { to: "/tests", label: "Tests", icon: ClipboardCheck },
  { to: "/forecast", label: "Forecast", icon: TrendingUp },
  { to: "/advanced", label: "Advanced", icon: Zap },
  { to: "/assistant", label: "Assistant", icon: Sparkles },
  { to: "/settings", label: "Settings", icon: Settings },
];

function Brand({ compact = false }) {
  return (
    <Link to="/" className="flex items-center gap-3 px-1">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-300 to-emerald-600 font-heading text-sm font-bold text-emerald-950 shadow-[0_0_26px_-6px_rgba(52,211,153,0.75)]">
        A
      </span>
      <span className="leading-tight">
        <span className="block font-heading text-[15px] font-semibold tracking-tight">Ascend</span>
        {!compact && (
          <span className="block text-[9px] uppercase tracking-[0.24em] text-muted-foreground">
            JEE Study OS
          </span>
        )}
      </span>
    </Link>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const initial = (user?.full_name || user?.email || "A").slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/[0.06] bg-[hsl(222_30%_6%)]/70 px-4 py-6 backdrop-blur-xl lg:flex">
        <Brand />
        <nav className="mt-9 flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: !!item.exact }}
              activeProps={{ className: "bg-white/[0.07] text-foreground" }}
              inactiveProps={{
                className:
                  "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
              }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/[0.06] p-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/[0.07] text-xs font-semibold">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{user?.full_name || "Aspirant"}</p>
            <p className="truncate text-[10px] text-muted-foreground">{user?.email}</p>
          </div>
          <button
            onClick={() => logout()}
            title="Sign out"
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/[0.06] bg-background/80 px-4 py-3 backdrop-blur-xl lg:hidden">
          <Brand compact />
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.07] text-xs font-semibold">
            {initial}
          </span>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 lg:px-10 lg:pb-16 lg:pt-10">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.06] bg-background/95 backdrop-blur-xl lg:hidden">
        <div className="no-scrollbar flex overflow-x-auto px-2 py-2">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: !!item.exact }}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="flex min-w-[70px] flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium transition"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}