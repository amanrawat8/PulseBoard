import type { Request } from "express";
import { AppError } from "./AppError.js";

export function getAuthUser(req: Request) {
  if (!req.user) {
    throw new AppError(401, "Unauthenticated");
  }
  return req.user;
}
