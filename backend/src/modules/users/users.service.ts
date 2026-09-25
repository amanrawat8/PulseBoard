import { prisma } from "../../config/prisma.js";
import type { Role } from "../../generated/prisma/client.js";

export function listUsers(role?: Role) {
  return prisma.user.findMany({
    where: role ? { role } : {},
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  });
}
