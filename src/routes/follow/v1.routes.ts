import { FollowController } from "controllers/index";
import { Router } from "express";
import { AuthMiddleware } from "middleware";

const followRoutes = Router();

followRoutes.post(
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

followRoutes.post(
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

followRoutes.get(
  "/followers/:userId",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await FollowController.getFollowers(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

followRoutes.get(
  "/following/:userId",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await FollowController.getFollowing(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

followRoutes.get("/my-friends", AuthMiddleware.Auth, async (req, res, next) => {
  try {
    await FollowController.getFriends(req, res, next);
  } catch (error) {
    next(error);
  }
});

export default followRoutes;
