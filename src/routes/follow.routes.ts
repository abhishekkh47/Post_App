import { FollowController } from "controllers/index";
import { Router } from "express";
import { AuthMiddleware } from "middleware";

const followRouter = Router();

followRouter.post(
  "/follow-user",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await FollowController.followUser(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

followRouter.post(
  "/unfollow-user",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await FollowController.unFollowUser(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);
