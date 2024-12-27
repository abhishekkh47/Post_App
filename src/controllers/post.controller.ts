import { NextFunction, Response } from "express";
import BaseController from "./base.controller";
import { NetworkError } from "middleware";
import { AuthService, PostService } from "services";
import { ICreatePost } from "types";
import { POST_TYPE } from "utils";
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
              throw new NetworkError("User do not exists", 400);
            }
            const postObj: ICreatePost = {
              userId: user._id,
              post: body.post,
              type: POST_TYPE.TEXT,
            };

            await PostService.createPost(postObj);
            this.Ok(res, { message: "Post created successfully" });
          } catch (error) {
            throw new NetworkError((error as Error).message, 400);
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
              throw new NetworkError("User do not exists", 400);
            }
            const posts = await PostService.getAllPostByUser(params.userId);
            this.Ok(res, { posts });
          } catch (error) {
            throw new NetworkError((error as Error).message, 400);
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
              throw new NetworkError("User do not exists", 400);
            }
            const post = await PostService.getPostById(params.postId);
            this.Ok(res, { post });
          } catch (error) {
            throw new NetworkError((error as Error).message, 400);
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
              throw new NetworkError("User do not exists", 400);
            }
            await PostService.deleteUserPost(user, params.postId);
            this.Ok(res, { message: "Post deleted successfully" });
          } catch (error) {
            throw new NetworkError((error as Error).message, 400);
          }
        }
      }
    );
  }
}

export default new PostController();
