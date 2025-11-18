import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import http from "http";
import routes from "./routes";
import { connectDb } from "./config/db";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { initSocket } from "./sockets";

const app = express();

// CORS configuration - allow frontend origin
const allowedOrigins = env.socketCors === "*" 
  ? ["http://localhost:3000", "http://localhost:3001"]
  : env.socketCors.split(",").map(o => o.trim());

app.use(cors({ 
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || env.socketCors === "*") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api", routes);
app.use(errorHandler);

const server = http.createServer(app);
initSocket(server);

connectDb().then(() => {
  server.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
  });
});

export { app };

