import { NextFunction, Request, Response } from "express";
import BaseController from "./base.controller";
import { NetworkError } from "middleware";
import { AuthService } from "services";
import { IUser, IUserSignup } from "types";
import { authValidations } from "validations";

class AuthController extends BaseController {
  public async signup(req: Request, res: Response, next: NextFunction) {
    return authValidations.userSignupValidation(
      req.body,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const {
              body: { email, password, firstName, lastName },
            } = req;

            if (!email || !password || !firstName || !lastName) {
              return this.BadRequest(res, "Please provide all details");
            }

            const userIfExists: IUser | null =
              await AuthService.findUserByEmail(email);
            if (userIfExists) {
              return this.BadRequest(res, "User already exists");
            }

            const userObj: IUserSignup = {
              email,
              password,
              firstName,
              lastName,
            };
            const response = await AuthService.userSignup(userObj);

            this.Ok(res, response);
          } catch (error) {
            this.BadRequest(res, "Bad Request : Please provide all details");
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

            if (!email || !password) {
              return this.BadRequest(
                res,
                "Please provide a valid username and password"
              );
            }

            const userIfExists: IUser | null =
              await AuthService.findUserByEmail(email);
            if (!userIfExists) {
              return this.BadRequest(res, "User do not exists");
            }

            const response = await AuthService.userLogin(
              userIfExists,
              password
            );

            this.Ok(res, response);
          } catch (error) {
            throw new NetworkError(
              "Bad Request : Please provide all details",
              400
            );
          }
        }
      }
    );
  }

  public async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken || refreshToken == "") {
        return this.BadRequest(res, "Invalid refresh token");
      }
      const response = await AuthService.getRefreshToken(refreshToken);
      this.Ok(res, response);
    } catch (error) {
      throw new NetworkError(`Error - ${(error as Error).message}`, 400);
    }
  }
}

export default new AuthController();
