import { Moon, Sun } from "lucide-react";
import { useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useTheme } from "@/hooks/use-theme";
import { UserMenu } from "./user-menu";

function getTitle(pathname: string): string {
  if (pathname.startsWith("/projects/")) return "Project Details";
  if (pathname.startsWith("/projects")) return "Projects";
  if (pathname.startsWith("/tasks")) return "Tasks";
  return "Dashboard";
}

export function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm">
      <h1 className="font-display text-lg font-semibold">
        {getTitle(location.pathname)}
      </h1>
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
        <NotificationBell />
        <div className="mx-1 h-6 w-px bg-border" />
        <UserMenu />
      </div>
    </header>
  );
}
