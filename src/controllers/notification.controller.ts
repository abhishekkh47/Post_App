import { NextFunction, Response } from "express";
import BaseController from "./base.controller";
import { NotificationService } from "services";
import { authValidations } from "validations";
import {
  getDataFromCache,
  REDIS_KEYS,
  setDataToCache,
  SUCCESS_MSGS,
} from "utils";
import { RequireActiveUser } from "middleware/requireActiveUser";

class NotificationController extends BaseController {
  /**
   * @description get all notificaitions for the user
   * @param req
   * @param res
   * @param next
   */
  @RequireActiveUser()
  async getNotifications(req: any, res: Response, next: NextFunction) {
    try {
      const cachedData = await getDataFromCache(
        `${REDIS_KEYS.GET_NOTIFICATIONS}_${req._id}`
      );
      if (cachedData) {
        return this.Ok(res, JSON.parse(cachedData));
      }
      const notifications = await NotificationService.getNotification(req.user);
      setDataToCache(
        `${REDIS_KEYS.GET_NOTIFICATIONS}_${req._id}`,
        JSON.stringify({ notifications })
      );
      this.Ok(res, { notifications });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }

  /**
   * @description update and mark notification as read
   * @param req
   * @param res
   * @param next
   */
  @RequireActiveUser()
  async updateNotification(req: any, res: Response, next: NextFunction) {
    return authValidations.readNotificationValidation(
      req.body,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { notificationId } = req.body;
            await NotificationService.updateNotification(notificationId);
            this.Ok(res, { message: SUCCESS_MSGS.SUCCESS });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }
}

export default new NotificationController();
