import { NextFunction, Response } from "express";
import BaseController from "./base.controller";
import { AuthService, PostService, UserService, FollowService } from "services";
import { ICreatePost } from "types";
import { ERR_MSGS, POST_TYPE, SUCCESS_MSGS } from "utils";
import { postValidations } from "validations";

class PostController extends BaseController {
  async createPost(req: any, res: Response, next: NextFunction) {
    return postValidations.createPostValidation(
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
            const postObj: ICreatePost = {
              userId: user._id,
              post: body.post,
              type: POST_TYPE.TEXT,
            };

            await PostService.createPost(postObj);
            this.Ok(res, { message: SUCCESS_MSGS.POST_CREATED });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  async getPostByUser(req: any, res: Response, next: NextFunction) {
    return postValidations.getPostsValidation(
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
            const [isPublicProfile, ifUserFollowed] = await Promise.all([
              UserService.isPublicProfile(params.userId),
              FollowService.ifUserFollowed(user, params.userId),
            ]);
            if (isPublicProfile || ifUserFollowed || _id == params.userId) {
              const posts = await PostService.getAllPostByUser(params.userId);
              this.Ok(res, { posts });
            } else {
              this.Ok(res, {
                message: "This is a private profile. Send request to follow.",
              });
            }
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  async getPostById(req: any, res: Response, next: NextFunction) {
    return postValidations.getPostDetailsUsingIdValidation(
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
            const post = await PostService.getPostById(params.postId);
            this.Ok(res, { post });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  async deleteUserPostById(req: any, res: Response, next: NextFunction) {
    return postValidations.deletePostByIdValidation(
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
            await PostService.deleteUserPost(user, params.postId);
            this.Ok(res, { message: SUCCESS_MSGS.POST_DELETED });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  async getMyPosts(req: any, res: Response, next: NextFunction) {
    try {
      const { _id } = req;
      const user = await AuthService.findUserById(_id);
      if (!user) {
        return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
      }
      const posts = await PostService.getAllPostByUser(_id);
      this.Ok(res, { posts });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }

  async editOrUpdatePost(req: any, res: Response, next: NextFunction) {
    return postValidations.editOrUpdatePostValidation(
      req.body,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const {
              _id,
              body: { postId, post },
            } = req;
            const user = await AuthService.findUserById(_id);
            if (!user) {
              return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
            }
            await PostService.editOrUpdatePost(user._id, postId, post);
            this.Ok(res, { message: SUCCESS_MSGS.SUCCESS });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }

  async getMyFeed(req: any, res: Response, next: NextFunction) {
    try {
      const { _id } = req;
      const user = await AuthService.findUserById(_id);
      if (!user) {
        return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
      }
      const posts = await PostService.getUserFeed(_id);
      this.Ok(res, { posts });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }
}

export default new PostController();
