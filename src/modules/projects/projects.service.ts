import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type { Role } from "../../generated/prisma/client.js";
import type { CreateProjectInput } from "./projects.schema.js";

interface AuthUser {
  id: string;
  role: Role;
}

export function createProject(data: CreateProjectInput, user: AuthUser) {
  return prisma.project.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      clientId: data.clientId,
      createdById: user.id,
    },
  });
}

export function listProjects(user: AuthUser) {
  if (user.role === "ADMIN") {
    return prisma.project.findMany({
      include: { client: true },
      orderBy: { createdAt: "desc" },
    });
  }

  if (user.role === "PM") {
    return prisma.project.findMany({
      where: { createdById: user.id },
      include: { client: true },
      orderBy: { createdAt: "desc" },
    });
  }

  return prisma.project.findMany({
    where: { tasks: { some: { assignedToId: user.id } } },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProject(projectId: string, user: AuthUser) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { client: true, tasks: true },
  });

  if (!project) {
    throw new AppError(404, "Project not found");
  }

  if (user.role === "PM" && project.createdById !== user.id) {
    throw new AppError(403, "You do not have access to this project");
  }

  if (
    user.role === "DEVELOPER" &&
    !project.tasks.some((task) => task.assignedToId === user.id)
  ) {
    throw new AppError(403, "You do not have access to this project");
  }

  return project;
}
