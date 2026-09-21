import { prisma } from "../config/prisma.js";
import { overdueTaskQueue } from "../config/queue.js";

const REPEAT_INTERVAL_MS = 5 * 60 * 1000; // every 5 minutes

async function flagOverdueTasks(): Promise<void> {
  const result = await prisma.task.updateMany({
    where: {
      dueDate: { lt: new Date() },
      isOverdue: false,
      status: { not: "DONE" },
    },
    data: { isOverdue: true },
  });

  if (result.count > 0) {
    console.log(`Flagged ${result.count} task(s) as overdue`);
  }
}

overdueTaskQueue.process(async () => {
  await flagOverdueTasks();
});

export async function scheduleOverdueTaskJob(): Promise<void> {
  await overdueTaskQueue.add(
    {},
    {
      repeat: { every: REPEAT_INTERVAL_MS },
      removeOnComplete: true,
      removeOnFail: true,
    }
  );
}
