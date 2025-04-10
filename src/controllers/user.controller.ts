import { NextFunction, Response } from "express";
import BaseController from "./base.controller";
import { AuthService, FollowService, UserService } from "services";
import { authValidations } from "validations";
import {
  verifyToken,
  ERR_MSGS,
  SUCCESS_MSGS,
  getDataFromCache,
  REDIS_KEYS,
  setDataToCache,
  CACHING,
} from "utils";
import { IUser } from "types";
import { RequireActiveUser } from "middleware/requireActiveUser";
import Config from "../config";

class UserController extends BaseController {
  /**
   * @description Delete user
   * @param req
   * @param res
   * @param next
   */
  @RequireActiveUser()
  async deleteUser(req: any, res: Response, next: NextFunction) {
    await UserService.deleteUser(req._id);
    this.Ok(res, { message: SUCCESS_MSGS.SUCCESS });
  }

  @RequireActiveUser()
  async toggleProfileType(req: any, res: Response, next: NextFunction) {
    await UserService.toggleProfileType(req.user);
    this.Ok(res, { message: SUCCESS_MSGS.SUCCESS });
  }

  /**
   * @description Send email link to reset password
   * @param req
   * @param res
   * @param next
   */
  @RequireActiveUser()
  async sendPasswordResetLink(req: any, res: Response, next: NextFunction) {
    return authValidations.sendPasswordResetLinkValidation(
      req.body,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { email } = req.body;
            const user: IUser | null = await AuthService.findUserByEmail(email);
            if (!user) {
              return this.BadRequest(res, ERR_MSGS.EMAIL_NOT_FOUND);
            }
            await UserService.sendResetLink(user);
            this.Ok(res, { message: SUCCESS_MSGS.LINK_SENT });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  /**
   * @description Reset password using link sent on email
   * @param req
   * @param res
   * @param next
   */
  @RequireActiveUser()
  async resetPasswordUsingEmailLink(
    req: any,
    res: Response,
    next: NextFunction
  ) {
    return authValidations.resetPasswordUsingLinkValidation(
      req.body,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { newPassword, confirmPassword, token } = req.body;
            if (newPassword !== confirmPassword) {
              return this.BadRequest(res, ERR_MSGS.PASSWORD_DONT_MATCH);
            }
            const validateToken = verifyToken(token);
            if (validateToken?.status && validateToken.status == 401) {
              return this.UnAuthorized(res as any, ERR_MSGS.INVALID_REQUEST);
            }
            await UserService.resetPassword(req.user, newPassword);
            this.Ok(res, { message: ERR_MSGS.PASSWORD_UPDATED });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  /**
   * @description User Profile
   * @param req
   * @param res
   * @param next
   */
  @RequireActiveUser()
  async getUserProfile(req: any, res: Response, next: NextFunction) {
    return authValidations.getUserProfileValidation(
      req.params,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { userId } = req.params;
            if (Config.CACHING === CACHING.ENABLED) {
              const cachedData = await getDataFromCache(
                `${REDIS_KEYS.GET_USER_PROFILE}`
              );
              if (cachedData) {
                return this.Ok(res, JSON.parse(cachedData));
              }
            }
            const [userDetails, isFollowing] = await Promise.all([
              AuthService.findUserById(userId),
              FollowService.ifUserFollowed(req._id, userId),
            ]);
            setDataToCache(
              `${REDIS_KEYS.GET_ALL_USERS}`,
              JSON.stringify({ userDetails, isFollowing })
            );
            this.Ok(res, { userDetails, isFollowing });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  /**
   * @description Search User Profile
   * @param req
   * @param res
   * @param next
   */
  @RequireActiveUser()
  async searchUsers(req: any, res: Response, next: NextFunction) {
    return authValidations.searchUserProfileValidation(
      req.query,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { search } = req.query;
            const users = await UserService.searchUsers(search);
            this.Ok(res, { users });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  /**
   * @description Send notifications to user
   * @param req
   * @param res
   * @param next
   */
  @RequireActiveUser()
  async notifyUser(req: any, res: Response, next: NextFunction) {
    return authValidations.sendNotificationValidation(
      req.body,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { recipientId, message } = req.body;
            await UserService.sendNotification(req._id, recipientId, message);
            this.Ok(res, { message: SUCCESS_MSGS.NOTIFICATION_SENT });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  /**
   * @description get all users
   * @param req
   * @param res
   * @param next
   */
  @RequireActiveUser()
  async getAllUsers(req: any, res: Response, next: NextFunction) {
    try {
      if (Config.CACHING === CACHING.ENABLED) {
        const cachedData = await getDataFromCache(
          `${REDIS_KEYS.GET_ALL_USERS}`
        );
        if (cachedData) {
          return this.Ok(res, JSON.parse(cachedData));
        }
      }
      const users: IUser[] = await UserService.getAllUsers();
      setDataToCache(`${REDIS_KEYS.GET_ALL_USERS}`, JSON.stringify(users));
      this.Ok(res, { users });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }

  /**
   * @description update profile picture
   */
  @RequireActiveUser()
  async updateProfilePicture(req: any, res: Response, next: NextFunction) {
    try {
      const { file } = req;
      const filename = file?.filename;
      if (!filename) {
        return this.BadRequest(res, "Upload a valid file");
      }
      await UserService.updateProfilePicture(req.user, filename);
      this.Ok(res, { message: "success", filename });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }

  /**
   * @description update profile details
   */
  @RequireActiveUser()
  async updateProfileDetails(req: any, res: Response, next: NextFunction) {
    authValidations.updateProfileValidation(
      req.body,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { firstName, lastName = "", bio = "" } = req.body;
            if (!firstName || !firstName.length) {
              return this.BadRequest(res, "Please provide a valid firstName");
            }

            const updatedProfile = await UserService.updateProfileDetails(
              req.user,
              {
                firstName,
                lastName,
                bio,
              }
            );
            this.Ok(res, { updatedProfile });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }
}

export default new UserController();
