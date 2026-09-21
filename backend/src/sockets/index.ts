import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import type { Socket } from "socket.io";
import { setIo } from "./ioInstance.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { prisma } from "../config/prisma.js";
import { trackConnect, trackDisconnect } from "./presence.js";


export function initSocket(httpServer: HttpServer): void {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            credentials: true,
        },
    });

    setIo(io);

    io.use((socket, next) => {
        const token = socket.handshake.auth.token as string | undefined;

        if(!token) {
            next(new Error("Missing access token"));
            return;
        }

        try {
            const payload = verifyAccessToken(token);
            socket.data.user = { id: payload.sub, role: payload.role };
            next();
        } catch {
            next(new Error("Invalid or expired access token"));
        }
    });

    io.on("connection", (socket) => {
        void handleConnection(io, socket);
    });
}



async function handleConnection(io: Server, socket: Socket): Promise<void> {
    const user = socket.data.user as { id: string, role: "ADMIN" | "PM" | "DEVELOPER"};

    socket.join(`user:${user.id}`);


    if(user.role === "ADMIN") {
        socket.join("global:activity");
    } else if(user.role === "PM") {
        const projects = await prisma.project.findMany({
            where: { createdById: user.id},
            select: { id: true },
        });

        for(const project of projects) {
            socket.join(`project:${project.id}`);
        }
    }

    const onlineCount = trackConnect(user.id);
    io.to("global:activity").emit("presence:update", {onlineCount});

    socket.on("disconnect", () => {
        const count = trackDisconnect(user.id);
        io.to("global:activity").emit("presence:update", { onlineCount: count });
    });
}
