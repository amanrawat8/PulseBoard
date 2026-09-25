import { FolderKanban, LayoutDashboard, ListChecks, Zap } from "lucide-react";
import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex items-center gap-2.5 px-6 py-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Zap className="size-4" fill="currentColor" />
        </div>
        <div className="min-w-0">
          <p className="font-display text-sm font-bold leading-none text-white">
            PulseBoard
          </p>
          <p className="mt-1 truncate text-[11px] text-sidebar-foreground/50">
            Client Project Dashboard
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-white"
              )
            }
          >
            <item.icon className="size-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-4 py-4 text-[11px] text-sidebar-foreground/40">
        Real-time client project dashboard
      </div>
    </aside>
  );
}
