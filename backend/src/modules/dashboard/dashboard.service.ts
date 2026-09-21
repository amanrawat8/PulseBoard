import { prisma } from "../../config/prisma.js";
import type { Role } from "../../generated/prisma/enums.js";
import { getOnlineCount } from "../../sockets/presence.js";
import { listTasks } from "../tasks/tasks.service.js";




interface AuthUser {
    id: string;
    role: Role;
}


async function getAdminDashboard() {
    const [totalProjects, taskByStatus, overdueTaskCount] = await Promise.all([
        prisma.project.count(),
        prisma.task.groupBy({ by: ["status"], _count: {_all: true } } ),
        prisma.task.count({ where: { isOverdue: true }}),
    ]);


    return {
        role: "ADMIN" as const,
        totalProjects,
        totalTasksByStatus: Object.fromEntries(
            taskByStatus.map((row) => [row.status, row._count._all]) 
        ),
        overdueTaskCount,
        onlineUserCount: getOnlineCount(),
    };
}


async function getPmDashboard(user: AuthUser) {
    const projects = await prisma.project.findMany({
        where: { createdById: user.id },
        include: {_count: {select: {tasks: true } } },
    });

    const projectIds = projects.map((p) => p.id);


    const [tasksByPriority, upcomingDueThisWeek] = await Promise.all([
        prisma.task.groupBy({
            by: ["priority"],
            where: { projectId: { in: projectIds } },
            _count: { _all: true },
        }),

        prisma.task.findMany({
            where: {
                projectId: { in: projectIds },
                status: { not: "DONE"},
                dueDate: {
                    gte: new Date(),
                    lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            },
            orderBy: { dueDate: "asc"},
            include: { assignedTo: true },
        }), 
    ]);


    return {
        role: "PM" as const,
        projectsSummary: projects.map((p) => ({
            id: p.id,
            name: p.name,
            taskCount: p._count.tasks, 
        })),
        tasksByPriority: Object.fromEntries(
            tasksByPriority.map((row) => [row.priority, row._count._all ])
        ),
        upcomingDueThisWeek,
    };
}



async function getDeveloperdashboard(user: AuthUser) {
    const assignedTasks = await listTasks(user, {});
    return {
        role: "DEVELOPER" as const,
        assignedTasks,
    };
}


export function getDashboard(user: AuthUser) {
    if(user.role === "ADMIN") return getAdminDashboard();
    if(user.role === "PM") return getPmDashboard(user);
    return getDeveloperdashboard(user);
}