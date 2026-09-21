import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/requireRole.js";
import { validateBody } from "../../middleware/validateBody.js";
import { createClientSchema } from "./clients.schema.js";
import * as clientsController from "./clients.controller.js";

export const clientsRouter = Router();

clientsRouter.use(authenticate, requireRole("ADMIN", "PM"));
clientsRouter.post("/", validateBody(createClientSchema), clientsController.create);
clientsRouter.get("/", clientsController.list);
