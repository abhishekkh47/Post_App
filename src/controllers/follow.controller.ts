import { NextFunction, Response } from "express";
import BaseController from "./base.controller";
import { followValidations } from "validations";
import { AuthService, FollowService } from "services/index";
import { ERR_MSGS } from "utils/constants";

class FollowController extends BaseController {
  async followUser(req: any, res: Response, next: NextFunction) {
    return followValidations.followValidation(
      req.body,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const user = await AuthService.findUserById(req._id);
            if (!user) {
              this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
            }
            await FollowService.followUser(req.body);
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  async unFollowUser(req: any, res: Response, next: NextFunction) {
    return followValidations.unfollowValidation(
      req.body,
      res,
      async (validate: boolean) => {
        try {
          const user = await AuthService.findUserById(req._id);
          if (!user) {
            this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
          }
          if (validate) {
            await FollowService.unFollowUser(req.body);
          }
        } catch (error) {
          this.InternalServerError(res, (error as Error).message);
        }
      }
    );
  }
}

export default new FollowController();
