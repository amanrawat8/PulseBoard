import { Bell, CheckCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/api/notifications";
import { queryKeys } from "@/api/query-keys";
import { useSocketEvent } from "@/hooks/use-socket-event";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types";

export function NotificationBell() {
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const queryClient = useQueryClient();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useSocketEvent<Notification>("notifications:new", (notification) => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    toast(notification.message, { description: "Just now" });
  });

  useSocketEvent<{ unreadCount: number }>("notifications:unreadCount", () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2.5">
          <p className="text-sm font-semibold">Notifications</p>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => markAllRead.mutate()}
            >
              <CheckCheck className="size-3.5" /> Mark all read
            </Button>
          )}
        </div>
        <div className="h-px bg-border" />
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-muted-foreground">
              You're all caught up
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() =>
                      !notification.isRead && markRead.mutate(notification.id)
                    }
                    className={cn(
                      "flex w-full flex-col items-start gap-1 px-3 py-3 text-left text-sm transition-colors hover:bg-accent",
                      !notification.isRead && "bg-primary/5"
                    )}
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <p
                        className={cn(
                          "leading-snug",
                          !notification.isRead && "font-medium"
                        )}
                      >
                        {notification.message}
                      </p>
                      {!notification.isRead && (
                        <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
