import { Response, NextFunction } from "express";
import BaseController from "./base.controller";
import { ERR_MSGS } from "utils";
import { MessageService, AuthService } from "services";

class ChatController extends BaseController {
  async getConversations(req: any, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.findUserById(req._id);
      if (!user) {
        return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
      }
      const conversations = await MessageService.getUserConversations(user._id);
      this.Ok(res, { conversations });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }

  async getMessagesWith(req: any, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.findUserById(req._id);
      if (!user) {
        return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
      }
      const otherUser = await AuthService.findUserById(req.params.userId);
      if (!otherUser) {
        return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
      }

      const messages = await MessageService.getConversation(
        user._id,
        otherUser._id
      );
      await MessageService.markMessagesAsRead(otherUser._id, user._id);

      const io = req.io;
      io.to(otherUser._id).emit("messagesRead", { userId: user._id });
      this.Ok(res, { messages });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }

  async deleteConversation(req: any, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.findUserById(req._id);
      if (!user) {
        return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
      }
      const otherUser = await AuthService.findUserById(req.params.userId);
      if (!otherUser) {
        return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
      }

      await MessageService.deleteConversation(user._id, otherUser._id);
      this.Ok(res, { message: "Conversation deleted successfully" });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }
}

export default new ChatController();
