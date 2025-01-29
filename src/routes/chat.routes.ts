import { ChatController } from "controllers";
import { Router } from "express";
import { AuthMiddleware } from "middleware";

export const chatRoutes = Router();

chatRoutes.get(
  "/conversations",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await ChatController.getConversations(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

chatRoutes.get(
  "/messages/:userId",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await ChatController.getMessagesWith(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

chatRoutes.delete(
  "/conversation/:userId",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await ChatController.deleteConversation(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);
