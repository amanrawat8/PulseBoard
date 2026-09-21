import { z } from "zod";

export const activityFeedQuerySchema = z.object({
  after: z.coerce.date().optional(),
});
export type ActivityFeedQuery = z.infer<typeof activityFeedQuerySchema>;
