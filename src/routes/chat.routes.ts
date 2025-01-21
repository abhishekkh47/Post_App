import { ChatController } from "controllers";
import { Router } from "express";
import { AuthMiddleware } from "middleware";

export const chatRoutes = Router();

chatRoutes.get(
  "/conversations",
  AuthMiddleware.Auth,
  ChatController.getConversations
);

chatRoutes.get(
  "/messages/:userId",
  AuthMiddleware.Auth,
  ChatController.getMessagesWith
);

chatRoutes.delete(
  "/conversation/:userId",
  AuthMiddleware.Auth,
  ChatController.deleteConversation
);
