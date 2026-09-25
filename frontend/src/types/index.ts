export type Role = "ADMIN" | "PM" | "DEVELOPER";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type NotificationType = "TASK_ASSIGNED" | "TASK_IN_REVIEW";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  clientId: string;
  client?: Client;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
  _count?: { tasks: number };
}

export interface Task {
  id: string;
  projectId: string;
  project?: Project;
  title: string;
  description: string | null;
  assignedToId: string | null;
  assignedTo?: User | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
  activityLogs?: TaskActivityLog[];
}

export interface TaskActivityLog {
  id: string;
  taskId: string;
  task?: Task;
  projectId: string;
  project?: Project;
  changedById: string;
  changedBy?: User;
  fromStatus: TaskStatus | null;
  toStatus: TaskStatus;
  createdAt: string;
}

/** Live payload shape emitted over the `activity:new` socket event (flatter than TaskActivityLog). */
export interface ActivityEvent {
  id: string;
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
  fromStatus: TaskStatus | null;
  toStatus: TaskStatus;
  changedBy: { id: string; name: string };
  createdAt: string;
  assignedToId: string | null;
  projectOwnerId: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  relatedTaskId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardAdmin {
  role: "ADMIN";
  totalProjects: number;
  totalTasksByStatus: Record<string, number>;
  overdueTaskCount: number;
  onlineUserCount: number;
}

export interface DashboardPm {
  role: "PM";
  projectsSummary: { id: string; name: string; taskCount: number }[];
  tasksByPriority: Record<string, number>;
  upcomingDueThisWeek: Task[];
}

export interface DashboardDeveloper {
  role: "DEVELOPER";
  assignedTasks: Task[];
}

export type Dashboard = DashboardAdmin | DashboardPm | DashboardDeveloper;

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  dueFrom?: string;
  dueTo?: string;
}

export interface ApiErrorShape {
  error: {
    message: string;
    details?: unknown;
  };
}
