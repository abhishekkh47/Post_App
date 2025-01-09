import { NextFunction, Response } from "express";
import BaseController from "./base.controller";
import { AuthService, UserService } from "services";
import { authValidations } from "validations/auth.validation";
import { verifyToken, ERR_MSGS, SUCCESS_MSGS } from "utils";

class UserController extends BaseController {
  async deleteUser(req: any, res: Response, next: NextFunction) {
    const user = await AuthService.findUserById(req._id);
    if (!user) {
      return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
    }
    await UserService.deleteUser(req._id);
    this.Ok(res, { message: SUCCESS_MSGS.SUCCESS });
  }

  async toggleProfileType(req: any, res: Response, next: NextFunction) {
    const user = await AuthService.findUserById(req._id);
    if (!user) {
      return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
    }
    await UserService.toggleProfileType(user);
    this.Ok(res, { message: SUCCESS_MSGS.SUCCESS });
  }

  /**
   * @description Send email link to reset password
   * @param req
   * @param res
   * @param next
   */
  async sendPasswordResetLink(req: any, res: Response, next: NextFunction) {
    return authValidations.sendPasswordResetLinkValidation(
      req.body,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { email } = req.body;
            const user = await AuthService.findUserByEmail(email);
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
            const user = await AuthService.findUserByEmail(validateToken.email);
            if (!user) {
              return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
            }
            await UserService.resetPassword(user, newPassword);
            this.Ok(res, { message: ERR_MSGS.PASSWORD_UPDATED });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }
}

export default new UserController();
