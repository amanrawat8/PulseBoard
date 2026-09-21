import type { Request, Response } from "express";
import { getAuthUser } from "../../utils/getAuthUser.js";
import * as notificationsService from "./notifications.service.js";

export async function list(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const notifications = await notificationsService.listNotifications(user.id);
  res.json(notifications);
}

export async function markRead(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const notification = await notificationsService.markAsRead(
    req.params.id as string,
    user.id
  );
  res.json(notification);
}

export async function markAllRead(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  await notificationsService.markAllAsRead(user.id);
  res.status(204).send();
}
