import { NextFunction, Response } from "express";
import BaseController from "./base.controller";
import { AuthService, NotificationService } from "services";
import { authValidations } from "validations";
import { ERR_MSGS, SUCCESS_MSGS } from "utils";
import { IUser } from "types";

class NotificationController extends BaseController {
  /**
   * @description get all notificaitions for the user
   * @param req
   * @param res
   * @param next
   */
  async getNotifications(req: any, res: Response, next: NextFunction) {
    try {
      const user: IUser | null = await AuthService.findUserById(req._id);
      if (!user) {
        return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
      }
      const notifications = await NotificationService.getNotification(user);
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
  async updateNotification(req: any, res: Response, next: NextFunction) {
    return authValidations.readNotificationValidation(
      req.body,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { notificationId } = req.body;
            const user: IUser | null = await AuthService.findUserById(req._id);
            if (!user) {
              return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
            }
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
