import { CommonController } from "controllers";
import { Router } from "express";
import { AuthMiddleware } from "middleware";
import { MEDIA, upload } from "utils";

const commonRoutes = Router();

commonRoutes.post(
  "/upload-chat-multimedia/:chatId",
  [AuthMiddleware.Auth, upload.array(MEDIA.CHAT, 10)],
  async (req: any, res: any, next: any) => {
    try {
      await CommonController.uploadFileInChat(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);
commonRoutes.get("/status", async (req, res, next) => {
  try {
    await CommonController.status(req, res, next);
  } catch (error) {
    next(error);
  }
});

export default commonRoutes;
