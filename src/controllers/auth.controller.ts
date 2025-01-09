import { NextFunction, Request, Response } from "express";
import BaseController from "./base.controller";
import { AuthService } from "services";
import { IUser, IUserSignup } from "types";
import { authValidations } from "validations";
import { ERR_MSGS } from "utils/constants";

class AuthController extends BaseController {
  public async signup(req: Request, res: Response, next: NextFunction) {
    return authValidations.userSignupValidation(
      req.body,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const {
              body: {
                email,
                password,
                firstName,
                lastName,
                bio = null,
                profile_pic = null,
                isPrivate = true,
              },
            } = req;

            if (!email || !password || !firstName || !lastName) {
              return this.BadRequest(res, ERR_MSGS.PROVIDE_ALL_DETAILS);
            }

            const userIfExists: IUser | null =
              await AuthService.findUserByEmail(email);
            if (userIfExists) {
              return this.BadRequest(res, ERR_MSGS.USER_EXISTS);
            }

            const userObj: IUserSignup = {
              email,
              password,
              firstName,
              lastName,
              bio,
              profile_pic,
              isPrivate,
            };
            const response = await AuthService.userSignup(userObj);

            this.Ok(res, response);
          } catch (error) {
            this.BadRequest(res, ERR_MSGS.PROVIDE_ALL_DETAILS);
          }
        }
      }
    );
  }

  public async login(req: Request, res: Response, next: NextFunction) {
    return authValidations.userLoginValidation(
      req.body,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const {
              body: { email, password },
            } = req;

            const userIfExists: IUser | null =
              await AuthService.findUserByEmail(email);
            if (!userIfExists) {
              return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
            }

            const response = await AuthService.userLogin(
              userIfExists,
              password
            );

            this.Ok(res, response);
          } catch (error) {
            this.BadRequest(res, ERR_MSGS.PROVIDE_ALL_DETAILS);
          }
        }
      }
    );
  }

  public async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken || refreshToken == "") {
        return this.BadRequest(res, ERR_MSGS.INVALIID_REFRESH_TOKEN);
      }
      const response = await AuthService.getRefreshToken(refreshToken);
      this.Ok(res, response);
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }
}

export default new AuthController();
