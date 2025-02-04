import { Router } from "express";
import { UserController } from "controllers";
import { AuthMiddleware } from "middleware";
export const userRoutes = Router();

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
userRoutes.get("/get-profile/:userId", async (req, res, next) => {
  try {
    await UserController.getUserProfile(req, res, next);
  } catch (error) {
    next(error);
  }
});
