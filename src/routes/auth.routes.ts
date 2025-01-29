import { Router } from "express";
import { AuthController } from "controllers";

export const authRoutes = Router();

authRoutes.post("/signup", async (req, res, next) => {
  await AuthController.signup(req, res, next);
});

authRoutes.post("/login", async (req, res, next) => {
  await AuthController.login(req, res, next);
});

authRoutes.post("/refresh-token", async (req, res, next) => {
  await AuthController.refreshToken(req, res, next);
});
