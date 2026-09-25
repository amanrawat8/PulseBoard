import { z } from "zod";

export const listUsersQuerySchema = z.object({
  role: z.enum(["ADMIN", "PM", "DEVELOPER"]).optional(),
});
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
