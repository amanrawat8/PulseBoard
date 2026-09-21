import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/requireRole.js";
import { validateBody } from "../../middleware/validateBody.js";
import { validateQuery } from "../../middleware/validateQuery.js";
import {
  updateTaskSchema,
  updateTaskStatusSchema,
  taskFilterSchema,
} from "./tasks.schema.js";
import * as tasksController from "./tasks.controller.js";

export const tasksRouter = Router();

tasksRouter.use(authenticate);
tasksRouter.get("/", validateQuery(taskFilterSchema), tasksController.list);
tasksRouter.get("/:id", tasksController.getOne);
tasksRouter.patch(
  "/:id",
  requireRole("ADMIN", "PM"),
  validateBody(updateTaskSchema),
  tasksController.update
);
tasksRouter.patch(
  "/:id/status",
  validateBody(updateTaskStatusSchema),
  tasksController.updateStatus
);
