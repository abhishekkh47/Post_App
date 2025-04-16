import "module-alias/register";
import express from "express";
import mongoose from "mongoose";
import DotEnv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import { createServer } from "http";
import { createRedisClient, setupWebSocket, currentDateOnly } from "utils";
DotEnv.config();
import Config from "./config";
import i18n from "./i18n/i18n";
import Morgan from "morgan";
import * as rfs from "rotating-file-stream";
import Path from "path";
import router from "./routes";
import { errorHandler, maintenanceModeHandler } from "middleware";
import { vapidConfig } from "services/webPush.service";

const server = async () => {
  try {
    const app = express();
    const httpServer = createServer(app);
    const io = setupWebSocket(httpServer);
    const accessLogStream = rfs.createStream(
      `${currentDateOnly()}-access.log`,
      {
        interval: "1d",
        path: Path.join(__dirname, "logs"),
      }
    );

    Config.NODE_ENV === "development"
      ? app.use(Morgan("dev", { stream: accessLogStream }))
      : app.use(Morgan("combined", { stream: accessLogStream }));
    app.use(bodyParser.json());
    app.use(i18n.init);

    app.use(
      cors({
        origin: function (origin, callback) {
          callback(null, true); // ✅ Dynamically allow all origins
        },
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Allow only these methods
        credentials: true, // Allow cookies and credentials to be sent with requests
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );
    app.use((req: any, res, next) => {
      console.log(req.path);
      req.io = io;
      next();
    });

    // app.use(
    //   maintenanceModeHandler as (
    //     req: express.Request,
    //     res: express.Response,
    //     next: express.NextFunction
    //   ) => void
    // );

    app.use("/", router);
    app.use(
      "/uploads",
      express.static(Path.join(__dirname, "uploads"), {
        setHeaders: (res) => {
          res.set("Cache-Control", "public, max-age=86400");
        },
      })
    );
    app.use(
      errorHandler as (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => void
    );

    /*
    while using redis labs server, we can create the redis client here, since we are using env variables 
    env variables are loaded once this file is executed and env data is loaded here 
    and then only we should create the redis client
    but if we are using local redis server, we can create the redis client in utils/redis.ts file
    */
    createRedisClient();
    vapidConfig();
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
