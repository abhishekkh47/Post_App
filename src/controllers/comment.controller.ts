import { Response, NextFunction } from "express";
import BaseController from "./base.controller";
import { commentValidations } from "validations";
import { CommentService, AuthService } from "services";
import { ERR_MSGS, SUCCESS_MSGS } from "utils";

class CommentController extends BaseController {
  /**
   * @description Add comment to a post
   * @param req
   * @param res
   * @param next
   */
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
              return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
            }
            await CommentService.createComment(user, body);
            this.Ok(res, { message: SUCCESS_MSGS.SUCCESS });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  /**
   * @description Get all comments on a post
   * @param req
   * @param res
   * @param next
   */
  async getCommentByPostId(req: any, res: Response, next: NextFunction) {
    return commentValidations.getCommentByPostIdValidation(
      req.params,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { _id, params } = req;
            const user = await AuthService.findUserById(_id);
            if (!user) {
              return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
            }
            const comments = await CommentService.getCommentByPostId(
              params.postId
            );
            this.Ok(res, { comments });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  /**
   * @description Get comment by commentId
   * @param req
   * @param res
   * @param next
   */
  async getCommentById(req: any, res: Response, next: NextFunction) {
    return commentValidations.getCommentByCommentIdValidation(
      req.params,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { _id, params } = req;
            const user = await AuthService.findUserById(_id);
            if (!user) {
              return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
            }
            const comments = await CommentService.getCommentById(
              params.commentId
            );
            this.Ok(res, { comments });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  /**
   * @description Delete a comment
   * @param req
   * @param res
   * @param next
   */
  async deleteCommentById(req: any, res: Response, next: NextFunction) {
    return commentValidations.deleteCommentValidation(
      req.params,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { _id, params } = req;
            const user = await AuthService.findUserById(_id);
            if (!user) {
              return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
            }
            await CommentService.deleteComment(params.commentId);
            this.Ok(res, { message: SUCCESS_MSGS.COMMENT_DELETED });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  /**
   * @description Get all comments made by user
   * @param req
   * @param res
   * @param next
   */
  async getAllCommentsByUserId(req: any, res: Response, next: NextFunction) {
    return commentValidations.getCommentsByUserIdValidation(
      req.params,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { _id, params } = req;
            const user = await AuthService.findUserById(_id);
            if (!user) {
              return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
            }
            const comments = await CommentService.getAllCommentsByUserId(
              params.userId
            );
            this.Ok(res, { comments });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }
}

export default new CommentController();
