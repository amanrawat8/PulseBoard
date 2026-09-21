import "dotenv/config";
import { createServer } from "node:http";
import app from "./app.js";
import { initSocket } from "./sockets/index.js";
import { scheduleOverdueTaskJob } from "./jobs/overdueTasks.job.js";

const PORT = Number(process.env.PORT) || 4000;

const httpServer = createServer(app);
initSocket(httpServer);



httpServer.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});


await scheduleOverdueTaskJob();