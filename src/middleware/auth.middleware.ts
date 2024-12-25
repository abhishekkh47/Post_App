import BaseController from "controllers/base.controller";
import { Request, Response, NextFunction } from "express";
import { IRequestUser } from "types";
import { verifyToken } from "utils";

class AuthMiddleware extends BaseController {
  Auth = (req: any, res: Response, next: NextFunction) => {
    try {
      const token = req.headers["authorization"];
      if (!token) {
        return this.UnAuthorized(res as any, "Unauthorized: No token provided");
      }
      const response = verifyToken(token);
      if (response && response.status && response.status == 401) {
        return this.UnAuthorized(res as any, "Invalid Token");
      }
      req._id = response._id;
      next();
    } catch (error) {
      return this.UnAuthorized(res as any, "Invalid Token");
    }
  };
}

export default new AuthMiddleware();
