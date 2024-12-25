import { Router } from "express";
import { AuthMiddleware } from "middleware";
import { PostController } from "controllers";

export const postRoutes = Router();

postRoutes.post("/create-post", AuthMiddleware.Auth, async (req, res, next) => {
  try {
    await PostController.createPost(req, res, next);
  } catch (error) {
    next(error);
  }
});

postRoutes.get("/get-posts", AuthMiddleware.Auth, async (req, res, next) => {
  try {
    await PostController.getPost(req, res, next);
  } catch (error) {
    next(error);
  }
});

postRoutes.get("/get-post/:id", AuthMiddleware.Auth, async (req, res, next) => {
  try {
    await PostController.getPostById(req, res, next);
  } catch (error) {
    next(error);
  }
});

postRoutes.delete(
  "/delete-post",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await PostController.deleteUserPostById(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);
