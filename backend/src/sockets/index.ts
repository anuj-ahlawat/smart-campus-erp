import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config/env";
import { logger } from "../config/logger";

export let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: env.socketCors,
      methods: ["GET", "POST"]
    }
  });
  io.on("connection", (socket) => {
    logger.info(`Socket connected ${socket.id}`);
  });
};

