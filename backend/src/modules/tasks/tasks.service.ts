import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type { Role, TaskStatus } from "../../generated/prisma/client.js";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilterInput,
} from "./tasks.schema.js";
import { emitTaskActivity } from "../../sockets/activity.js";
import * as notificationsService from "../notifications/notifications.service.js";


interface AuthUser {
  id: string;
  role: Role;
}

async function assertProjectAccessForWrite(projectId: string, user: AuthUser) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new AppError(404, "Project not found");
  }
  if (user.role === "DEVELOPER") {
    throw new AppError(403, "Developers cannot create or edit tasks");
  }
  if (user.role === "PM" && project.createdById !== user.id) {
    throw new AppError(403, "You do not manage this project");
  }
  return project;
}

export async function createTask(
  projectId: string,
  data: CreateTaskInput,
  user: AuthUser
) {
  await assertProjectAccessForWrite(projectId, user);

  const task = await prisma.task.create({
    data: {
      projectId,
      title: data.title,
      description: data.description ?? null,
      assignedToId: data.assignedToId ?? null,
      priority: data.priority ?? "MEDIUM",
      dueDate: data.dueDate,
    },
  });

  if (task.assignedToId) {
    await notificationsService.createNotification(
      task.assignedToId,
      "TASK_ASSIGNED",
      `You were assigned to "${task.title}"`,
      task.id
    );
  }

  return task;
}

function buildFilterWhere(filters: TaskFilterInput) {
  return {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.priority ? { priority: filters.priority } : {}),
    ...(filters.dueFrom || filters.dueTo
      ? {
          dueDate: {
            ...(filters.dueFrom ? { gte: filters.dueFrom } : {}),
            ...(filters.dueTo ? { lte: filters.dueTo } : {}),
          },
        }
      : {}),
  };
}

export function listTasks(user: AuthUser, filters: TaskFilterInput) {
  const filterWhere = buildFilterWhere(filters);

  if (user.role === "ADMIN") {
    return prisma.task.findMany({
      where: filterWhere,
      include: { project: true, assignedTo: true },
      orderBy: { dueDate: "asc" },
    });
  }

  if (user.role === "PM") {
    return prisma.task.findMany({
      where: { ...filterWhere, project: { createdById: user.id } },
      include: { project: true, assignedTo: true },
      orderBy: { dueDate: "asc" },
    });
  }

  return prisma.task.findMany({
    where: { ...filterWhere, assignedToId: user.id },
    include: { project: true, assignedTo: true },
    orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
  });
}

export async function getTask(taskId: string, user: AuthUser) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: true,
      assignedTo: true,
      activityLogs: { orderBy: { createdAt: "desc" }, include: { changedBy: true } },
    },
  });

  if (!task) {
    throw new AppError(404, "Task not found");
  }
  if (user.role === "PM" && task.project.createdById !== user.id) {
    throw new AppError(403, "You do not have access to this task");
  }
  if (user.role === "DEVELOPER" && task.assignedToId !== user.id) {
    throw new AppError(403, "You do not have access to this task");
  }

  return task;
}

export async function updateTask(
  taskId: string,
  data: UpdateTaskInput,
  user: AuthUser
) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new AppError(404, "Task not found");
  }
  await assertProjectAccessForWrite(task.projectId, user);

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined
        ? { description: data.description ?? null }
        : {}),
      ...(data.assignedToId !== undefined
        ? { assignedToId: data.assignedToId ?? null }
        : {}),
      ...(data.priority !== undefined ? { priority: data.priority } : {}),
      ...(data.dueDate !== undefined ? { dueDate: data.dueDate } : {}),
    },
  });

  if (data.assignedToId && data.assignedToId !== task.assignedToId) {
    await notificationsService.createNotification(
      data.assignedToId,
      "TASK_ASSIGNED",
      `You were assigned to "${updated.title}"`,
      updated.id
    );
  }

  return updated;
}

export async function updateTaskStatus(
  taskId: string,
  newStatus: TaskStatus,
  user: AuthUser
) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true },
  });
  if (!task) {
    throw new AppError(404, "Task not found");
  }

  const isAdmin = user.role === "ADMIN";
  const isOwningPM = user.role === "PM" && task.project.createdById === user.id;
  const isAssignedDeveloper =
    user.role === "DEVELOPER" && task.assignedToId === user.id;

  if (!isAdmin && !isOwningPM && !isAssignedDeveloper) {
    throw new AppError(403, "You cannot update this task's status");
  }

    const { updated, log } = await prisma.$transaction(async (tx) => {
    const updated = await tx.task.update({
      where: { id: taskId },
      data: { status: newStatus },
    });

    const log = await tx.taskActivityLog.create({
      data: {
        taskId,
        projectId: task.projectId,
        changedById: user.id,
        fromStatus: task.status,
        toStatus: newStatus,
      },
    });

    return { updated, log };
  });

  const changedByUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true },
  });

  emitTaskActivity({
    id: log.id,
    taskId: task.id,
    taskTitle: task.title,
    projectId: task.projectId,
    projectName: task.project.name,
    fromStatus: log.fromStatus,
    toStatus: log.toStatus,
    changedBy: { id: user.id, name: changedByUser?.name ?? "Unknown" },
    createdAt: log.createdAt.toISOString(),
    assignedToId: task.assignedToId,
    projectOwnerId: task.project.createdById,
  });

  if (newStatus === "IN_REVIEW") {
    await notificationsService.createNotification(
      task.project.createdById,
      "TASK_IN_REVIEW",
      `Task "${task.title}" was moved to In Review`,
      task.id
    );
  }

  return updated;
}
