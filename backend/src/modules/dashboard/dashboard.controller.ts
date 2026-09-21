import type { Request, Response } from "express";
import { getAuthUser } from "../../utils/getAuthUser.js";
import * as dashboardService from "./dashboard.service.js";

export async function getDashboard(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const dashboard = await dashboardService.getDashboard(user);
  res.json(dashboard);
}
