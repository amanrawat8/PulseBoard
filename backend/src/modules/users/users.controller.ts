import type { Request, Response } from "express";
import type { ListUsersQuery } from "./users.schema.js";
import * as usersService from "./users.service.js";

export async function list(req: Request, res: Response): Promise<void> {
  const { role } = (req.validatedQuery ?? {}) as ListUsersQuery;
  const users = await usersService.listUsers(role);
  res.json(users);
}
