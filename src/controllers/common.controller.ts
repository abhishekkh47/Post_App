import { Response, NextFunction } from "express";
import BaseController from "./base.controller";
import { RequireActiveUser } from "middleware";
import Config from "../config";
import { WebPushService } from "services";

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

  /**
   * @description subscribe for web push notification service
   * @param req
   * @param res
   * @param next
   */
  @RequireActiveUser()
  async subscribeWebPush(req: any, res: Response, next: NextFunction) {
    try {
      const { subscription } = req.body;
      const userId = req._id; // Assuming authMiddleware adds user to req

      if (!subscription || !subscription.endpoint) {
        return this.BadRequest(res, "Subscription information is required");
      }

      const success = await WebPushService.saveSubscription(
        userId,
        subscription
      );

      if (success) {
        this.Ok(res, { message: "Subscription saved successfully" });
      } else {
        this.InternalServerError(res, {
          message: "Failed to save subscription",
        });
      }
    } catch (error) {
      console.error("Error in subscribe endpoint:", error);
      this.InternalServerError(res, (error as Error).message);
    }
  }
}

export default new CommonController();
