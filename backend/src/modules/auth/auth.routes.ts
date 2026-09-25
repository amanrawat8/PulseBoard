import { Router } from "express";
import { validateBody } from "../../middleware/validateBody.js";
import { authenticate } from "../../middleware/auth.js";
import { loginSchema } from "./auth.schema.js";
import * as authController from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/login", validateBody(loginSchema), authController.login);
authRouter.post("/refresh", authController.refresh);
authRouter.post("/logout", authController.logout);
authRouter.get("/me", authenticate, authController.me);
