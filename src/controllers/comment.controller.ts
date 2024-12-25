import { Response, NextFunction } from "express";
import BaseController from "./base.controller";
import { NetworkError } from "middleware";
import { commentValidations } from "validations/comment.validation";
import { CommentService, AuthService } from "services";

class CommentController extends BaseController {
  async createComment(req: any, res: Response, next: NextFunction) {
    return commentValidations.createCommentValidation(
      req.body,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { _id, body } = req;
            const user = await AuthService.findUserById(_id);
            if (!user) {
              throw new NetworkError("User do not exists", 400);
            }
            await CommentService.createComment(user, body);
            this.Ok(res, { message: "Comment created successfully" });
          } catch (error) {
            throw new NetworkError((error as Error).message, 400);
          }
        }
      }
    );
  }

  async getCommentByPostId(req: any, res: Response, next: NextFunction) {
    try {
      this.Ok(res, { message: "Get comment successfully" });
    } catch (error) {
      next(error);
    }
  }

  async getCommentById(req: any, res: Response, next: NextFunction) {
    try {
      this.Ok(res, { message: "Get comment by id successfully" });
    } catch (error) {
      next(error);
    }
  }

  async deleteCommentById(req: any, res: Response, next: NextFunction) {
    return commentValidations.deleteCommentValidation(
      req.body,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { _id, body } = req;
            const user = await AuthService.findUserById(_id);
            if (!user) {
              throw new NetworkError("User do not exists", 400);
            }
            await CommentService.deleteComment(user, body);
            this.Ok(res, { message: "Comment deleted successfully" });
          } catch (error) {
            next(error);
          }
        }
      }
    );
  }
}

export default new CommentController();
