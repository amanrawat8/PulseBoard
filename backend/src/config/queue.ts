import "dotenv/config";
import Queue from "bull";

export const overdueTaskQueue = new Queue("overdue-tasks", process.env.REDIS_URL!);
