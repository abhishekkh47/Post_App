import { NextFunction, Response } from "express";
import BaseController from "./base.controller";
import { followValidations } from "validations";
import { AuthService, FollowService } from "services";
import { ERR_MSGS, SUCCESS_MSGS } from "utils";

class FollowController extends BaseController {
  /**
   * @description Follow a user
   * @param req
   * @param res
   * @param next
   */
  async followUser(req: any, res: Response, next: NextFunction) {
    return followValidations.followValidation(
      req.body,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const user = await AuthService.findUserById(req._id);
            if (!user) {
              return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
            }
            await FollowService.followUser(user, req.body);
            this.Ok(res, { message: SUCCESS_MSGS.SUCCESS });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  /**
   * @description Unfollow a user
   * @param req
   * @param res
   * @param next
   */
  async unFollowUser(req: any, res: Response, next: NextFunction) {
    return followValidations.unfollowValidation(
      req.body,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const user = await AuthService.findUserById(req._id);
            if (!user) {
              return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
            }

            await FollowService.unFollowUser(req.body);
            this.Ok(res, { message: SUCCESS_MSGS.SUCCESS });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  /**
   * @description get users who follow the user
   * @param req
   * @param res
   * @param next
   */
  async getFollowers(req: any, res: Response, next: NextFunction) {
    return followValidations.getFollowersValidation(
      req.params,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const user = await AuthService.findUserById(req._id);
            if (!user) {
              return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
            }
            const followers = await FollowService.getUserFollowers(
              req.params.userId
            );
            this.Ok(res, { followers });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  /**
   * @description get profiles followed by user
   * @param req
   * @param res
   * @param next
   */
  async getFollowing(req: any, res: Response, next: NextFunction) {
    return followValidations.getFollowersValidation(
      req.params,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const user = await AuthService.findUserById(req._id);
            if (!user) {
              return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
            }
            const following = await FollowService.getUserFollowing(
              req.params.userId
            );
            this.Ok(res, { following });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  /**
   * @description get profiles followed by user or follower of user
   * @param req
   * @param res
   * @param next
   */
  async getFriends(req: any, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.findUserById(req._id);
      if (!user) {
        return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
      }
      const friends = await FollowService.getUserFriends(req._id);
      this.Ok(res, { friends });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }
}

export default new FollowController();
