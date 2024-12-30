import { NextFunction, Response } from "express";
import BaseController from "./base.controller";

class FollowController extends BaseController {
  async followUser(req: any, res: Response, next: NextFunction) {}

  async unFollowUser(req: any, res: Response, next: NextFunction) {}
}

export default new FollowController();
