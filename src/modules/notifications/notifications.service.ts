import { prisma } from "../../config/prisma.js";
import type { NotificationType } from "../../generated/prisma/enums.js";
import { getIo } from "../../sockets/ioInstance.js";
import { AppError } from "../../utils/AppError.js";





async function emitUnreadCount(userId: string): Promise<void> {
    const unreadCount = await prisma.notification.count({
        where: {userId, isRead: false },
    });

    getIo().to(`user:${userId}`).emit("notifications:unreadCount", { unreadCount });
}



export async function createNotification(
    userId: string,
    type: NotificationType,
    message: string,
    relatedTaskId?: string
) {
    const notification = await prisma.notification.create({
        data: { userId, type, message, relatedTaskId: relatedTaskId ?? null },
    });

    getIo().to(`user:${userId}`).emit("notifications:new", notification);
    await emitUnreadCount(userId);

    return notification;
}


export function listNotifications(userId: string) {
    return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
    });
}


export async function markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
    });

    if(!notification || notification.userId !== userId) {
        throw new AppError(404, "Notification not found");
    }

    const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }, 
    });

    await emitUnreadCount(userId);
    return updated;

}



export async function markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
        where: { userId, isRead: false},
        data: {isRead: true},

    });

    await emitUnreadCount(userId);
}