import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  assignedToId: z.string().uuid().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  dueDate: z.coerce.date(),
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  assignedToId: z.string().uuid().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  dueDate: z.coerce.date().optional(),
});
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const updateTaskStatusSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
});
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;

export const taskFilterSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  dueFrom: z.coerce.date().optional(),
  dueTo: z.coerce.date().optional(),
});
export type TaskFilterInput = z.infer<typeof taskFilterSchema>;
