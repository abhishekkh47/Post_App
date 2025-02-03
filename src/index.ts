import "module-alias/register";
import express from "express";
import mongoose from "mongoose";
import DotEnv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import { createServer } from "http";
import { setupWebSocket } from "utils";
DotEnv.config();
import Config from "./config";
import i18n from "./i18n/i18n";
import {
  defaultRoutes,
  authRoutes,
  userRoutes,
  postRoutes,
  commentRoutes,
  followRoutes,
  chatRoutes,
} from "./routes";
import { errorHandler } from "middleware";

const server = async () => {
  try {
    const app = express();
    const httpServer = createServer(app);
    const io = setupWebSocket(httpServer);
    app.use(bodyParser.json());
    app.use(i18n.init);

    app.use(
      cors({
        origin: "http://localhost:5173", // Allow only requests from this origin
        methods: ["GET", "POST", "PUT", "DELETE"], // Allow only these methods
        credentials: true, // Allow cookies and credentials to be sent with requests
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );
    app.use((req: any, res, next) => {
      console.log(req.path);
      req.io = io;
      next();
    });

    app.use("/", defaultRoutes);
    app.use("/auth", authRoutes);
    app.use("/user", userRoutes);
    app.use("/post", postRoutes);
    app.use("/comment", commentRoutes);
    app.use("/follow", followRoutes);
    app.use("/chat", chatRoutes);
    app.use(
      errorHandler as (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => void
    );

    await mongoose.connect(Config.DB_PATH as string);

    // app.listen(Config.PORT, () => {
    //   console.log(`Server running on Port ${Config.PORT}`);
    // });
    httpServer.listen(Config.PORT, () => {
      console.log(`Server running on Port ${Config.PORT}`);
      console.log(`WebSocket server is ready`);
    });
  } catch (error) {
    console.error("Error : ", error);
  }
};

export default server();
