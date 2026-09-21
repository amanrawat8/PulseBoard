import { z } from "zod";

export const createClientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
