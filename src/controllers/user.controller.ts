import { NextFunction, Request, Response } from "express";
import BaseController from "./base.controller";
import { AuthService, UserService } from "services";
import { IRequestUser } from "types";
import { NetworkError } from "middleware";

class UserController extends BaseController {
  async deleteUser(req: any, res: Response, next: NextFunction) {
    const user = await AuthService.findUserById(req._id);
    if (!user) {
      throw new NetworkError("User do not exists", 400);
    }
    await UserService.deleteUser(req._id);
    this.Ok(res, { message: "success" });
  }
}

export default new UserController();
