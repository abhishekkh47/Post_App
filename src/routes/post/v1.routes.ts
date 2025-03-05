import { Router } from "express";
import { AuthMiddleware } from "middleware";
import { PostController } from "controllers";

const postRoutes = Router();

postRoutes.post("/create-post", AuthMiddleware.Auth, async (req, res, next) => {
  try {
    await PostController.createPost(req, res, next);
  } catch (error) {
    next(error);
  }
});

postRoutes.get(
  "/get-posts-by-user/:userId",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await PostController.getPostByUser(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

postRoutes.get(
  "/get-post/:postId",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await PostController.getPostById(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

postRoutes.delete(
  "/delete-post/:postId",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await PostController.deleteUserPostById(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

postRoutes.get("/get-my-posts", AuthMiddleware.Auth, async (req, res, next) => {
  try {
    await PostController.getMyPosts(req, res, next);
  } catch (error) {
    next(error);
  }
});

postRoutes.put(
  "/edit-or-update-post",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await PostController.editOrUpdatePost(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

postRoutes.get("/get-feed", AuthMiddleware.Auth, async (req, res, next) => {
  try {
    await PostController.getMyFeed(req, res, next);
  } catch (error) {
    next(error);
  }
});

postRoutes.post("/like-post", AuthMiddleware.Auth, async (req, res, next) => {
  try {
    await PostController.likePost(req, res, next);
  } catch (error) {
    next(error);
  }
});

postRoutes.post(
  "/dislike-post",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await PostController.dislikePost(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

export default postRoutes;
