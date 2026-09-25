import { toast } from "sonner";
import { AlertTriangle, CalendarDays } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateTaskStatus } from "@/api/tasks";
import { useAuth } from "@/context/auth-context";
import { extractErrorMessage } from "@/lib/api-client";
import { formatDueDate, getInitials, STATUS_LABELS } from "@/lib/format";
import { canUpdateTaskStatus } from "@/lib/permissions";
import { TaskPriorityBadge } from "./priority-badge";
import { TaskStatusBadge } from "./status-badge";
import type { Task, TaskStatus } from "@/types";

const STATUS_OPTIONS: TaskStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

interface TaskRowProps {
  task: Task;
  showProject?: boolean;
  onClick?: () => void;
}

export function TaskRow({ task, showProject = true, onClick }: TaskRowProps) {
  const { user } = useAuth();
  const updateStatus = useUpdateTaskStatus();
  const canEditStatus = user ? canUpdateTaskStatus(user, task) : false;

  function handleStatusChange(status: TaskStatus) {
    updateStatus.mutate(
      { id: task.id, status },
      { onError: (error) => toast.error(extractErrorMessage(error)) }
    );
  }

  return (
    <div
      className="flex flex-col gap-3 rounded-lg border bg-card p-4 transition-shadow hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{task.title}</p>
          {task.isOverdue && (
            <span className="flex shrink-0 items-center gap-1 rounded-md bg-destructive/15 px-1.5 py-0.5 text-[11px] font-medium text-destructive">
              <AlertTriangle className="size-3" /> Overdue
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {showProject && task.project && (
            <span className="truncate">{task.project.name}</span>
          )}
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3" />
            {formatDueDate(task.dueDate)}
          </span>
          {task.assignedTo && (
            <span className="flex items-center gap-1.5">
              <Avatar className="size-4">
                <AvatarFallback className="text-[8px]">
                  {getInitials(task.assignedTo.name)}
                </AvatarFallback>
              </Avatar>
              {task.assignedTo.name}
            </span>
          )}
        </div>
      </div>

      <div
        className="flex shrink-0 items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <TaskPriorityBadge priority={task.priority} />
        {canEditStatus ? (
          <Select
            value={task.status}
            onValueChange={(value) => handleStatusChange(value as TaskStatus)}
          >
            <SelectTrigger size="sm" className="h-7 w-[132px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <TaskStatusBadge status={task.status} />
        )}
      </div>
    </div>
  );
}
