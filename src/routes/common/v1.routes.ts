import { CommonController } from "controllers";
import { Router } from "express";
import { AuthMiddleware } from "middleware";
import { upload } from "utils";

const commonRoutes = Router();

commonRoutes.post(
  "/upload-chat-multimedia/:chatId",
  [AuthMiddleware.Auth, upload.array("chatMedia")],
  async (req: any, res: any, next: any) => {
    try {
      await CommonController.uploadFileInChat(req, res, next);
    } catch (error) {
      next(error);
    }
  }
);

export default commonRoutes;
