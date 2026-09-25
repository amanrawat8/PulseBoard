import type { Project, Task, User } from "@/types";

/** Mirrors the backend's authorization rules — used only to shape the UI, never as the real access boundary. */
export function canUpdateTaskStatus(user: User, task: Task): boolean {
  if (user.role === "ADMIN") return true;
  if (user.role === "PM") return task.project?.createdById === user.id;
  if (user.role === "DEVELOPER") return task.assignedToId === user.id;
  return false;
}

export function canEditTask(user: User, task: Task): boolean {
  if (user.role === "ADMIN") return true;
  if (user.role === "PM") return task.project?.createdById === user.id;
  return false;
}

export function canManageProjectsAndTasks(user: User): boolean {
  return user.role === "ADMIN" || user.role === "PM";
}

export function canManageProject(user: User, project: Project): boolean {
  if (user.role === "ADMIN") return true;
  return user.role === "PM" && project.createdById === user.id;
}
