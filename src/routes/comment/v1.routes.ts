import { Router } from "express";
import { CommentController } from "controllers";
import { AuthMiddleware } from "middleware";
const commentRoutes = Router();

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
  "/get-post-comments/:postId",
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
  "/get-comment/:commentId",
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
  "/delete-comment/:commentId",
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
  "/get-user-comments/:userId",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await CommentController.getAllCommentsByUserId(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

commentRoutes.post(
  "/like-or-dislike-comment",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await CommentController.likeDislikeAComment(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

export default commentRoutes;
