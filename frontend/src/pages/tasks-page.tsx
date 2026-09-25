import { useSearchParams } from "react-router-dom";
import { ListChecks } from "lucide-react";

import { TaskRow } from "@/components/tasks/task-row";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/api/tasks";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/lib/format";
import type { TaskPriority, TaskStatus } from "@/types";

const STATUS_OPTIONS: TaskStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
const PRIORITY_OPTIONS: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const status = (searchParams.get("status") as TaskStatus | null) ?? undefined;
  const priority = (searchParams.get("priority") as TaskPriority | null) ?? undefined;
  const dueFrom = searchParams.get("dueFrom") ?? undefined;
  const dueTo = searchParams.get("dueTo") ?? undefined;

  const { data: tasks = [], isLoading } = useTasks({ status, priority, dueFrom, dueTo });

  function updateParam(key: string, value: string | undefined) {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next, { replace: true });
  }

  const hasFilters = Boolean(status || priority || dueFrom || dueTo);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select
            value={status ?? "ANY"}
            onValueChange={(v) => updateParam("status", v === "ANY" ? undefined : v)}
          >
            <SelectTrigger size="sm" className="w-[150px]">
              <SelectValue placeholder="Any status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ANY">Any status</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Priority</Label>
          <Select
            value={priority ?? "ANY"}
            onValueChange={(v) => updateParam("priority", v === "ANY" ? undefined : v)}
          >
            <SelectTrigger size="sm" className="w-[150px]">
              <SelectValue placeholder="Any priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ANY">Any priority</SelectItem>
              {PRIORITY_OPTIONS.map((p) => (
                <SelectItem key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Due from</Label>
          <Input
            type="date"
            className="h-8 w-[150px] text-sm"
            value={dueFrom ?? ""}
            onChange={(e) => updateParam("dueFrom", e.target.value || undefined)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Due to</Label>
          <Input
            type="date"
            className="h-8 w-[150px] text-sm"
            value={dueTo ?? ""}
            onChange={(e) => updateParam("dueTo", e.target.value || undefined)}
          />
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => setSearchParams({}, { replace: true })}
          >
            Clear filters
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <ListChecks className="size-4" />
          {tasks.length} task{tasks.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[68px] rounded-lg" />
          ))
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
            No tasks match these filters
          </div>
        ) : (
          tasks.map((task) => <TaskRow key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}
