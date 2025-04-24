import { NextFunction, Response } from "express";
import BaseController from "./base.controller";
import { followValidations } from "validations";
import { FollowService } from "services";
import {
  CACHING,
  getDataFromCache,
  REDIS_KEYS,
  setDataToCache,
  SUCCESS_MSGS,
} from "utils";
import { RequireActiveUser } from "middleware/requireActiveUser";
import Config from "../config";

class FollowController extends BaseController {
  /**
   * @description Follow a user
   * @param req
   * @param res
   * @param next
   */
  @RequireActiveUser()
  async followUser(req: any, res: Response, next: NextFunction) {
    return followValidations.followValidation(
      req.body,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            await FollowService.followUser(req.user, req.body);
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
  @RequireActiveUser()
  async unFollowUser(req: any, res: Response, next: NextFunction) {
    return followValidations.unfollowValidation(
      req.body,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
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
  @RequireActiveUser()
  async getFollowers(req: any, res: Response, next: NextFunction) {
    return followValidations.getFollowersValidation(
      req.params,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
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
  @RequireActiveUser()
  async getFollowing(req: any, res: Response, next: NextFunction) {
    return followValidations.getFollowersValidation(
      req.params,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
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
  @RequireActiveUser()
  async getFriends(req: any, res: Response, next: NextFunction) {
    try {
      if (Config.CACHING === CACHING.ENABLED) {
        const cachedData = await getDataFromCache(
          `${REDIS_KEYS.GET_FRIENDS}_${req._id}`
        );
        if (cachedData) {
          return this.Ok(res, { friends: JSON.parse(cachedData) });
        }
      }
      const friends = await FollowService.getUserFriends(req._id);
      if (Config.CACHING === CACHING.ENABLED) {
        setDataToCache(
          `${REDIS_KEYS.GET_FRIENDS}_${req._id}`,
          JSON.stringify(friends)
        );
      }
      this.Ok(res, { friends });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }

  /**
   * @description get profiles recommended for user to follow
   * @param req
   * @param res
   * @param next
   */
  @RequireActiveUser()
  async getFriendRecommendations(req: any, res: Response, next: NextFunction) {
    try {
      let friends = [];
      if (req.user.following < 5) {
        friends = await FollowService.getFriendRecommendations(req._id);
      } else {
        friends = await FollowService.getFriendsOfFriendsRecommendations(
          req._id
        );
      }
      this.Ok(res, { friends });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }
}

export default new FollowController();
