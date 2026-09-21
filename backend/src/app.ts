import express  from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { projectsRouter } from "./modules/projects/projects.routes.js";
import { clientsRouter } from "./modules/clients/clients.routes.js";
import { tasksRouter } from "./modules/tasks/tasks.routes.js";
import { activityRouter } from "./modules/activity/activity.routes.js";
import { notificationsRouter } from "./modules/notifications/notifications.route.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true, 
}));

app.use(express.json());
app.use(cookieParser());


app.get("/health", (req, res) => {
    res.json({
        status: "ok"
    });
});


app.use("/auth", authRouter);

app.use("/clients", clientsRouter);
app.use("/projects", projectsRouter);
app.use("/tasks", tasksRouter);
app.use("/activity", activityRouter);
app.use("/notifications", notificationsRouter);
app.use("/dashboard", dashboardRouter);


app.use((req, res) => {
  res.status(404).json({
    error: { message: `Route not found: ${req.method} ${req.originalUrl}` },
  });
});



app.use(errorHandler);

export default app;


