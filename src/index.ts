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
import Morgan from "morgan";
import * as rfs from "rotating-file-stream";
import Path from "path";
import router from "./routes";
import { errorHandler } from "middleware";
import { currentDateOnly } from "utils";

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
