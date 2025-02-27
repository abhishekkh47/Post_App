import { Router } from "express";
import { UserController } from "controllers";
import { AuthMiddleware } from "middleware";
const userRoutes = Router();

userRoutes.delete(
  "/delete-user",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await UserController.deleteUser(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * To toggle profile as private and public
 */
userRoutes.put(
  "/toggle-profile-type",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await UserController.toggleProfileType(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * To send reset password link via email
 */
userRoutes.post("/send-reset-link", async (req, res, next) => {
  try {
    await UserController.sendPasswordResetLink(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * To reset password using email link
 */
userRoutes.post("/reset-password", async (req, res, next) => {
  try {
    await UserController.resetPasswordUsingEmailLink(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * To reset password using email link
 */
userRoutes.get(
  "/get-profile/:userId",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await UserController.getUserProfile(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * To search user mathing a given string
 */
userRoutes.get("/search-user", AuthMiddleware.Auth, async (req, res, next) => {
  try {
    await UserController.searchUsers(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * send notifications
 */
userRoutes.post("/notify", AuthMiddleware.Auth, async (req, res, next) => {
  try {
    await UserController.notifyUser(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * get notifications
 */
userRoutes.get(
  "/get-notifications",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await UserController.getNotifications(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

export default userRoutes;
