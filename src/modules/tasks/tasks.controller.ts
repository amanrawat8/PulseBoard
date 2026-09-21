import type { Request, Response } from "express";
import { getAuthUser } from "../../utils/getAuthUser.js";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  UpdateTaskStatusInput,
  TaskFilterInput,
} from "./tasks.schema.js";
import * as tasksService from "./tasks.service.js";

export async function create(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const data = req.body as CreateTaskInput;
  const task = await tasksService.createTask(req.params.projectId as string, data, user);
  res.status(201).json(task);
}

export async function list(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const filters = (req.validatedQuery ?? {}) as TaskFilterInput;
  const tasks = await tasksService.listTasks(user, filters);
  res.json(tasks);
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const task = await tasksService.getTask(req.params.id as string, user);
  res.json(task);
}

export async function update(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const data = req.body as UpdateTaskInput;
  const task = await tasksService.updateTask(req.params.id as string, data, user);
  res.json(task);
}

export async function updateStatus(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  const { status } = req.body as UpdateTaskStatusInput;
  const task = await tasksService.updateTaskStatus(req.params.id as string, status, user);
  res.json(task);
}
