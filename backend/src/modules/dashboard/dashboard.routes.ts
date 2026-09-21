import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import * as dashboardController from "./dashboard.controller.js";

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);
dashboardRouter.get("/", dashboardController.getDashboard);

