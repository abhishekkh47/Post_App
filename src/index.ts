import "module-alias/register";
import express from "express";
import mongoose from "mongoose";
import DotEnv from "dotenv";
import bodyParser from "body-parser";
DotEnv.config();
import Config from "./config";
import i18n from "./i18n/i18n";
import {
  defaultRoutes,
  authRoutes,
  userRoutes,
  postRoutes,
  commentRoutes,
} from "./routes";
import { errorHandler } from "middleware";

const server = async () => {
  try {
    const app = express();
    app.use(bodyParser.json());
    app.use(i18n.init);

    app.use("/", defaultRoutes);
    app.use("/auth", authRoutes);
    app.use("/user", userRoutes);
    app.use("/post", postRoutes);
    app.use("/comment", commentRoutes);
    app.use(
      errorHandler as (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => void
    );

    await mongoose.connect(Config.DB_PATH as string);

    app.listen(Config.PORT, () => {
      console.log(`Server running on Port ${Config.PORT}`);
    });
  } catch (error) {
    console.error("Error : ", error);
  }
};

export default server();
