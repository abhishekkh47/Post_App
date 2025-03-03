import { Router } from "express";
import { NotificationController } from "controllers";
import { AuthMiddleware } from "middleware";
const notificaitionRoutes = Router();

/**
 * get notifications
 */
notificaitionRoutes.get(
  "/get-notifications",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await NotificationController.getNotifications(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * get notifications
 */
notificaitionRoutes.put(
  "/read-notification",
  AuthMiddleware.Auth,
  async (req, res, next) => {
    try {
      await NotificationController.updateNotification(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

export default notificaitionRoutes;
