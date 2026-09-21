import { prisma } from "../../config/prisma.js";
import type { CreateClientInput } from "./clients.schema.js";

export function createClient(data: CreateClientInput) {
  return prisma.client.create({
    data: {
      name: data.name,
      email: data.email ?? null,
      phone: data.phone ?? null,
    },
  });
}

export function listClients() {
  return prisma.client.findMany({ orderBy: { createdAt: "desc" } });
}
