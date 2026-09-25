import { cn } from "@/lib/utils";
import { PRIORITY_LABELS } from "@/lib/format";
import type { TaskPriority } from "@/types";

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  LOW: "bg-muted text-muted-foreground",
  MEDIUM: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  HIGH: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  CRITICAL: "bg-red-500/15 text-red-600 dark:text-red-400",
};

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        PRIORITY_STYLES[priority]
      )}
    >
      {priority === "CRITICAL" && (
        <span className="size-1.5 rounded-full bg-current" />
      )}
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
