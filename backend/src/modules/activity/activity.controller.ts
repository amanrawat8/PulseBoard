import type { Request, Response } from "express";
import { getAuthUser } from "../../utils/getAuthUser.js";
import type { ActivityFeedQuery } from "./activity.schema.js";
import * as activityService from "./activity.service.js";

export async function feed(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const { after } = (req.validatedQuery ?? {}) as ActivityFeedQuery;
  const events = await activityService.getMissedActivity(user, after);
  res.json(events);
}
