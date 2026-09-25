import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/format";
import type { TaskStatus } from "@/types";

const STATUS_VARIANT: Record<
  TaskStatus,
  "secondary" | "accent" | "warning" | "success"
> = {
  TODO: "secondary",
  IN_PROGRESS: "accent",
  IN_REVIEW: "warning",
  DONE: "success",
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABELS[status]}</Badge>;
}
