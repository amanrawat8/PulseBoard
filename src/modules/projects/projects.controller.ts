import type { Request, Response } from "express";
import { getAuthUser } from "../../utils/getAuthUser.js";
import type { CreateProjectInput } from "./projects.schema.js";
import * as projectsService from "./projects.service.js";

export async function create(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const data = req.body as CreateProjectInput;
  const project = await projectsService.createProject(data, user);
  res.status(201).json(project);
}

export async function list(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const projects = await projectsService.listProjects(user);
  res.json(projects);
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const project = await projectsService.getProject(req.params.id as string, user);
  res.json(project);
}
