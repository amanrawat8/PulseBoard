import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { validateQuery } from "../../middleware/validateQuery.js";
import { activityFeedQuerySchema } from "./activity.schema.js";
import * as activityController from "./activity.controller.js";

export const activityRouter = Router();

activityRouter.use(authenticate);
activityRouter.get("/feed", validateQuery(activityFeedQuerySchema), activityController.feed);
