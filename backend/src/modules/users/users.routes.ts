import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/requireRole.js";
import { validateQuery } from "../../middleware/validateQuery.js";
import { listUsersQuerySchema } from "./users.schema.js";
import * as usersController from "./users.controller.js";

export const usersRouter = Router();

usersRouter.use(authenticate, requireRole("ADMIN", "PM"));
usersRouter.get("/", validateQuery(listUsersQuerySchema), usersController.list);
