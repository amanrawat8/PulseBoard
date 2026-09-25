import { LogOut, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-context";
import { getInitials } from "@/lib/format";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  PM: "Project Manager",
  DEVELOPER: "Developer",
};

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
        <Avatar className="size-8 border">
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
          <span className="text-sm font-semibold text-foreground">{user.name}</span>
          <span className="truncate text-xs text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="opacity-100 data-[disabled]:opacity-100">
          <ShieldCheck className="text-muted-foreground" />
          {ROLE_LABELS[user.role] ?? user.role}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
