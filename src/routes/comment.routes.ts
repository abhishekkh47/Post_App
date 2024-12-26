import { Router } from "express";
import { CommentController } from "controllers";
import { AuthMiddleware } from "middleware";
export const commentRoutes = Router();

commentRoutes.post(
  "/create-comment",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await CommentController.createComment(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

commentRoutes.get(
  "/get-post-comments/:id",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await CommentController.getCommentByPostId(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

commentRoutes.get(
  "/get-comment/:id",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await CommentController.getCommentById(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

commentRoutes.delete(
  "/delete-comment/:id",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await CommentController.deleteCommentById(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

commentRoutes.get(
  "/get-user-comments/:id",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await CommentController.getAllCommentsByUserId(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);
