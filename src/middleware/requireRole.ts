import type { NextFunction, Request, Response } from "express";
import type { Role } from "../generated/prisma/client.js";
import { AppError } from "../utils/AppError.js";

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new AppError(403, "You do not have permission to perform this action"));
      return;
    }
    next();
  };
}
