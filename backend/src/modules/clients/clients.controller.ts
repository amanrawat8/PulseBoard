import type { Request, Response } from "express";
import type { CreateClientInput } from "./clients.schema.js";
import * as clientsService from "./clients.service.js";

export async function create(req: Request, res: Response): Promise<void> {
  const data = req.body as CreateClientInput;
  const client = await clientsService.createClient(data);
  res.status(201).json(client);
}

export async function list(_req: Request, res: Response): Promise<void> {
  const clients = await clientsService.listClients();
  res.json(clients);
}
