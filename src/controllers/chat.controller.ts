import { Response, NextFunction } from "express";
import BaseController from "./base.controller";
import { ERR_MSGS } from "utils";
import { MessageService, AuthService } from "services";
import { IConversation, IMessage, IUser } from "types";
import { chatValidations } from "validations/chat.validation";

class ChatController extends BaseController {
  async getConversations(req: any, res: Response, next: NextFunction) {
    try {
      const user: IUser | null = await AuthService.findUserById(req._id);
      if (!user) {
        return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
      }
      const conversations: IConversation[] =
        await MessageService.getUserConversations(user._id);
      this.Ok(res, { conversations });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }

  async getMessagesWith(req: any, res: Response, next: NextFunction) {
    try {
      const user: IUser | null = await AuthService.findUserById(req._id);
      if (!user) {
        return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
      }
      const otherUser: IUser | null = await AuthService.findUserById(
        req.params.userId
      );
      if (!otherUser) {
        return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
      }

      const messages: IMessage[] = await MessageService.getConversation(
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
      const user: IUser | null = await AuthService.findUserById(req._id);
      if (!user) {
        return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
      }
      const otherUser: IUser | null = await AuthService.findUserById(
        req.params.userId
      );
      if (!otherUser) {
        return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
      }

      await MessageService.deleteConversation(user._id, otherUser._id);
      this.Ok(res, { message: "Conversation deleted successfully" });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }

  /**
   * Create a group chat
   */
  async createChatGroup(req: any, res: Response, next: NextFunction) {
    return chatValidations.createGroupValidation(
      req.body,
      res,
      async (validate: boolean) => {
        if (validate) {
          try {
            const {
              members,
              name,
              profile_pic = null,
              description = null,
            } = req.body;
            const user: IUser | null = await AuthService.findUserById(req._id);
            if (!user) {
              return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
            }

            await MessageService.createChatGroup(
              user,
              name,
              members,
              description,
              profile_pic
            );
            this.Ok(res, { message: "Group created successfully" });
          } catch (error) {
            this.InternalServerError(res, (error as Error).message);
          }
        }
      }
    );
  }
}

export default new ChatController();
