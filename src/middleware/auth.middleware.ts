import BaseController from "controllers/base.controller";
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "utils";

class AuthMiddleware extends BaseController {
  Auth = (req: Request, res: Response, next: NextFunction) => {
    try {
      const authorization = (req as any).headers["authorization"].split(" ");
      if (authorization.length < 2 || authorization[0] != "Bearer") {
        return this.UnAuthorized(res as any, "Invalid token");
      }
      const token = authorization[1];
      if (!token) {
        return this.UnAuthorized(res as any, "Unauthorized: No token provided");
      }
      const response = verifyToken(token);
      if (response?.status && response.status == 401) {
        return this.UnAuthorized(res as any, "Invalid Token");
      }
      (req as any)._id = response._id;
      next();
    } catch (error) {
      return this.UnAuthorized(res as any, "Invalid Token");
    }
  };
}

export default new AuthMiddleware();
