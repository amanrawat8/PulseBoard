import { useEffect, useMemo, useState } from "react";
import { Radio } from "lucide-react";

import { useActivityFeed } from "@/api/activity";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useSocketEvent } from "@/hooks/use-socket-event";
import {
  fromActivityEvent,
  fromActivityLog,
  type ActivityDisplayItem,
} from "@/lib/activity";
import { formatRelativeTime, getInitials, STATUS_LABELS } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ActivityEvent } from "@/types";

interface ActivityFeedProps {
  projectId?: string;
  title?: string;
  className?: string;
  maxHeight?: string;
}

export function ActivityFeed({
  projectId,
  title = "Live Activity",
  className,
  maxHeight = "h-[26rem]",
}: ActivityFeedProps) {
  const { data: fetched = [], isLoading } = useActivityFeed();
  const [liveItems, setLiveItems] = useState<ActivityDisplayItem[]>([]);
  const [justArrivedId, setJustArrivedId] = useState<string | null>(null);

  useSocketEvent<ActivityEvent>("activity:new", (event) => {
    const item = fromActivityEvent(event);
    setLiveItems((prev) => [item, ...prev].slice(0, 50));
    setJustArrivedId(item.id);
    setTimeout(() => setJustArrivedId((current) => (current === item.id ? null : current)), 2000);
  });

  // Keep relative timestamps ("2 mins ago") fresh without needing a refetch.
  const [, forceTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => forceTick((t) => t + 1), 30_000);
    return () => clearInterval(interval);
  }, []);

  const items = useMemo(() => {
    const historical = fetched.map(fromActivityLog);
    const merged = [...liveItems, ...historical];
    const seen = new Set<string>();
    const deduped: ActivityDisplayItem[] = [];
    for (const item of merged) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      deduped.push(item);
    }
    const scoped = projectId
      ? deduped.filter((item) => item.projectId === projectId)
      : deduped;
    return scoped.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [fetched, liveItems, projectId]);

  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Radio className="size-4 text-primary" />
          {title}
        </CardTitle>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-success" />
          </span>
          Live
        </span>
      </CardHeader>
      <CardContent className="px-0">
        <ScrollArea className={maxHeight}>
          <div className="space-y-1 px-5 pb-5">
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}

            {!isLoading && items.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No activity yet
              </p>
            )}

            {items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors",
                  justArrivedId === item.id && "bg-primary/5"
                )}
              >
                <Avatar className="size-8 border">
                  <AvatarFallback className="bg-secondary text-[11px]">
                    {getInitials(item.changedByName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">
                    <span className="font-medium">{item.changedByName}</span>{" "}
                    moved{" "}
                    <span className="font-medium">&ldquo;{item.taskTitle}&rdquo;</span>{" "}
                    <span className="text-muted-foreground">
                      {item.fromStatus ? STATUS_LABELS[item.fromStatus] : "—"} →{" "}
                    </span>
                    {STATUS_LABELS[item.toStatus]}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="truncate">{item.projectName}</span>
                    <span>&middot;</span>
                    <span className="shrink-0">{formatRelativeTime(item.createdAt)}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
