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
