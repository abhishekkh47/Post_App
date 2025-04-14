import { Response, NextFunction } from "express";
import BaseController from "./base.controller";
import { RequireActiveUser } from "middleware";
import Config from "../config";

class CommonController extends BaseController {
  @RequireActiveUser()
  async uploadFileInChat(req: any, res: Response, next: NextFunction) {
    try {
      const {
        params: { chatId },
        files,
      } = req;
      let filename: string[] = [];
      for (let file of files) {
        filename.push(file?.filename);
        if (!filename) {
          return this.BadRequest(res, "Upload a valid file");
        }
      }
      this.Ok(res, { message: "success", filename });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }

  /**
   * @description Check the app status if it is in maintenance mode
   * @param req
   * @param res
   * @param next
   */
  public async status(req: any, res: Response, next: NextFunction) {
    try {
      if (Config.MAINTENANCE_MODE === "true") {
        this.UnderMaintenance(res, {
          message: "Service in maintenance mode",
        });
      } else {
        this.Ok(res, { message: "Service is up and running" });
      }
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }
}

export default new CommonController();
