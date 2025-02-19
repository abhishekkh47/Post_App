import { NextFunction, Request, Response } from "express";
import BaseController from "./base.controller";
import { AuthService, UserService } from "services";
import { IUser, IUserSignup } from "types";
import { authValidations } from "validations";
import { decodeJwtToken, ERR_MSGS } from "utils";
import { UserTable } from "models";

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
            const { response, user } = await AuthService.userSignup(userObj);
            const userDetails = await UserService.getUserDetails(user._id);

            this.Ok(res, { ...response, user: userDetails });
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

            const [response, userDetails] = await Promise.all([
              AuthService.userLogin(userIfExists, password),
              UserService.getUserDetails(userIfExists._id),
            ]);
            if (!response) {
              return this.UnAuthorized(res, ERR_MSGS.INVALID_CREDENTIALS);
            }

            this.Ok(res, { ...response, user: userDetails });
          } catch (error) {
            this.BadRequest(res, ERR_MSGS.PROVIDE_ALL_DETAILS);
          }
        }
      }
    );
  }

  /**
   * @description Generate new login token uisng refresh token if existing token expired
   * @param req
   * @param res
   * @param next
   */
  public async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken || refreshToken == "") {
        return this.BadRequest(res, ERR_MSGS.INVALID_REFRESH_TOKEN);
      }
      let user: any;
      try {
        user = decodeJwtToken(refreshToken);
      } catch (error) {
        return this.BadRequest(res, "Refresh Token Expired");
      }
      user = await UserTable.findOne({ _id: user._id });
      if (!user) {
        return this.BadRequest(res, "User Not Found");
      }
      const [response, userDetails] = await Promise.all([
        AuthService.getRefreshToken(refreshToken),
        UserService.getUserDetails(user._id),
      ]);
      this.Ok(res, { ...response, user: userDetails });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }
}

export default new AuthController();
