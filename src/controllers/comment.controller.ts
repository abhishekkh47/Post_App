import { Response, NextFunction } from "express";
import BaseController from "./base.controller";
import { commentValidations } from "validations";
import { CommentService } from "services";
import {
  CACHING,
  getDataFromCache,
  REDIS_KEYS,
  removeDataFromCache,
  setDataToCache,
  SUCCESS_MSGS,
} from "utils";
import { RequireActiveUser } from "middleware/requireActiveUser";
import Config from "../config";

class CommentController extends BaseController {
  /**
   * @description Add comment to a post
   * @param req
   * @param res
   * @param next
   */
  @RequireActiveUser()
  async createComment(req: any, res: Response, next: NextFunction) {
    return commentValidations.createCommentValidation(
      req.body,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { _id, user, body } = req;
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
  @RequireActiveUser()
  async getCommentByPostId(req: any, res: Response, next: NextFunction) {
    return commentValidations.getCommentByPostIdValidation(
      req.params,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const {
              params: { postId },
            } = req;
            if (Config.CACHING === CACHING.ENABLED) {
              const cachedData = await getDataFromCache(
                `${REDIS_KEYS.GET_POST_COMMENTS}_${postId}`
              );
              if (cachedData) {
                return this.Ok(res, JSON.parse(cachedData));
              }
            }
            const comments = await CommentService.getCommentByPostId(postId);
            if (Config.CACHING === CACHING.ENABLED) {
              setDataToCache(
                `${REDIS_KEYS.GET_POST_COMMENTS}_${postId}`,
                JSON.stringify({ comments })
              );
            }
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
  @RequireActiveUser()
  async getCommentById(req: any, res: Response, next: NextFunction) {
    return commentValidations.getCommentByCommentIdValidation(
      req.params,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { params } = req;
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
  @RequireActiveUser()
  async deleteCommentById(req: any, res: Response, next: NextFunction) {
    return commentValidations.deleteCommentValidation(
      req.params,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const { params } = req;
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
  @RequireActiveUser()
  async getAllCommentsByUserId(req: any, res: Response, next: NextFunction) {
    return commentValidations.getCommentsByUserIdValidation(
      req.params,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const {
              params: { userId },
            } = req;
            if (Config.CACHING === CACHING.ENABLED) {
              const cachedData = await getDataFromCache(
                `${REDIS_KEYS.GET_COMMENTS_BY_USER}_${userId}`
              );
              if (cachedData) {
                return this.Ok(res, JSON.parse(cachedData));
              }
            }
            const comments = await CommentService.getAllCommentsByUserId(
              userId
            );
            if (Config.CACHING === CACHING.ENABLED) {
              setDataToCache(
                `${REDIS_KEYS.GET_COMMENTS_BY_USER}_${userId}`,
                JSON.stringify({ comments })
              );
            }
            this.Ok(res, { comments });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  /**
   * @description Like a comment
   * @param req
   * @param res
   * @param next
   */
  @RequireActiveUser()
  async likeDislikeAComment(req: any, res: Response, next: NextFunction) {
    return commentValidations.likeCommentValidation(
      req.body,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const {
              body: { commentId, postId, like = true },
            } = req;
            const comments = await CommentService.likeDislikeAComment(
              commentId,
              req._id,
              like
            );
            removeDataFromCache(`${REDIS_KEYS.GET_POST_COMMENTS}_${postId}`);
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
