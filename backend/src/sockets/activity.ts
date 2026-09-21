import { getIo } from "./ioInstance.js";


export interface TaskActivityPayload {
    id: string;
    taskId: string;
    taskTitle: string;
    projectId: string;
    projectName: string;
    fromStatus: string | null;
    toStatus: string;
    changedBy: {id: string; name: string };
    createdAt: string;
    assignedToId: string | null;
    projectOwnerId: string;
}


export function emitTaskActivity(payload: TaskActivityPayload): void {
    const io = getIo();

    io.to("global:activity").emit("activity:new", payload);
    io.to(`project:${payload.projectId}`).emit("activity:new", payload);

    if(payload.assignedToId) {
        io.to(`user:${payload.assignedToId}`).emit("activity:new", payload);
    }
}