import { Router } from "express";
import { UserController } from "controllers";
import { AuthMiddleware } from "middleware";
import { upload, MEDIA } from "utils";
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
 * To update password from settings using old password
 */
userRoutes.post(
  "/update-password",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await UserController.updatePasswordFromAppSettings(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get user profile using user id
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
 * send notifications
 */
userRoutes.get(
  "/get-all-users",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await UserController.getAllUsers(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * update profile picture
 */
userRoutes.put(
  "/update-profile-picture",
  [AuthMiddleware.Auth, upload.single(MEDIA.PROFILE)],
  async (req: any, res: any, next: any) => {
    try {
      await UserController.updateProfilePicture(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * update name and desription
 */
userRoutes.put(
  "/update-my-details",
  AuthMiddleware.Auth,
  async (req: any, res: any, next: any) => {
    try {
      await UserController.updateProfileDetails(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

export default userRoutes;
