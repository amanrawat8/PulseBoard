import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/requireRole.js";
import { validateBody } from "../../middleware/validateBody.js";
import { createProjectSchema } from "./projects.schema.js";
import * as projectsController from "./projects.controller.js";
import { createTaskSchema } from "../tasks/tasks.schema.js";
import * as tasksController from "../tasks/tasks.controller.js";

export const projectsRouter = Router();

projectsRouter.use(authenticate);
projectsRouter.post(
  "/",
  requireRole("ADMIN", "PM"),
  validateBody(createProjectSchema),
  projectsController.create
);
projectsRouter.get("/", projectsController.list);
projectsRouter.get("/:id", projectsController.getOne);

projectsRouter.post(
  "/:projectId/tasks",
  requireRole("ADMIN", "PM"),
  validateBody(createTaskSchema),
  tasksController.create
);