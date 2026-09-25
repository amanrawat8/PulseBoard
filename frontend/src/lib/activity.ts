import type { ActivityEvent, TaskActivityLog, TaskStatus } from "@/types";

export interface ActivityDisplayItem {
  id: string;
  taskId: string;
  projectId: string;
  taskTitle: string;
  projectName: string;
  fromStatus: TaskStatus | null;
  toStatus: TaskStatus;
  changedByName: string;
  createdAt: string;
}

/** Normalizes a DB-fetched activity log row (REST, nested relations) into the display shape. */
export function fromActivityLog(log: TaskActivityLog): ActivityDisplayItem {
  return {
    id: log.id,
    taskId: log.taskId,
    projectId: log.projectId,
    taskTitle: log.task?.title ?? "Untitled task",
    projectName: log.project?.name ?? "Unknown project",
    fromStatus: log.fromStatus,
    toStatus: log.toStatus,
    changedByName: log.changedBy?.name ?? "Someone",
    createdAt: log.createdAt,
  };
}

/** Normalizes a live `activity:new` socket payload (flat shape) into the display shape. */
export function fromActivityEvent(evt: ActivityEvent): ActivityDisplayItem {
  return {
    id: evt.id,
    taskId: evt.taskId,
    projectId: evt.projectId,
    taskTitle: evt.taskTitle,
    projectName: evt.projectName,
    fromStatus: evt.fromStatus,
    toStatus: evt.toStatus,
    changedByName: evt.changedBy.name,
    createdAt: evt.createdAt,
  };
}
