import { prisma } from "../../config/prisma.js";
import type { Role } from "../../generated/prisma/client.js";

interface AuthUser {
  id: string;
  role: Role;
}

const FEED_LIMIT = 20;

export function getMissedActivity(user: AuthUser, after?: Date) {
  const baseWhere = after ? { createdAt: { gt: after } } : {};

  if (user.role === "ADMIN") {
    return prisma.taskActivityLog.findMany({
      where: baseWhere,
      take: FEED_LIMIT,
      orderBy: { createdAt: "desc" },
      include: { task: true, project: true, changedBy: true },
    });
  }

  if (user.role === "PM") {
    return prisma.taskActivityLog.findMany({
      where: { ...baseWhere, project: { createdById: user.id } },
      take: FEED_LIMIT,
      orderBy: { createdAt: "desc" },
      include: { task: true, project: true, changedBy: true },
    });
  }

  return prisma.taskActivityLog.findMany({
    where: { ...baseWhere, task: { assignedToId: user.id } },
    take: FEED_LIMIT,
    orderBy: { createdAt: "desc" },
    include: { task: true, project: true, changedBy: true },
  });
}
