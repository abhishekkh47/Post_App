import { Response, NextFunction } from "express";
import BaseController from "./base.controller";
import {
  ERR_MSGS,
  getDataFromCache,
  REDIS_KEYS,
  setDataToCache,
  CACHING,
} from "utils";
import { MessageService, AuthService, GroupService } from "services";
import { IMessage, IUser } from "types";
import { RequireActiveUser } from "middleware/requireActiveUser";
import Config from "../config";

class ChatController extends BaseController {
  @RequireActiveUser()
  async getConversations(req: any, res: Response, next: NextFunction) {
    try {
      if (Config.CACHING === CACHING.ENABLED) {
        const cachedData = await getDataFromCache(
          `${REDIS_KEYS.GET_CONVERSATIONS}_${req._id}`
        );
        if (cachedData) {
          return this.Ok(res, JSON.parse(cachedData));
        }
      }
      const [conversations, groupConversations] = await Promise.all([
        MessageService.getUserConversations(req._id),
        GroupService.getGroupConversations(req._id),
      ]);
      setDataToCache(
        `${REDIS_KEYS.GET_CONVERSATIONS}_${req._id}`,
        JSON.stringify({ conversations, groupConversations })
      );
      this.Ok(res, { conversations, groupConversations });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }

  @RequireActiveUser()
  async getMessagesWith(req: any, res: Response, next: NextFunction) {
    try {
      const otherUser: IUser | null = await AuthService.findUserById(
        req.params.userId
      );
      if (!otherUser) {
        return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
      }

      const messages: IMessage[] = await MessageService.getConversation(
        req._id,
        otherUser._id
      );
      await MessageService.markMessagesAsRead(otherUser._id, req._id);

      const io = req.io;
      io.to(otherUser._id).emit("messagesRead", { userId: req._id });
      this.Ok(res, { messages });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }

  @RequireActiveUser()
  async deleteConversation(req: any, res: Response, next: NextFunction) {
    try {
      const otherUser: IUser | null = await AuthService.findUserById(
        req.params.userId
      );
      if (!otherUser) {
        return this.BadRequest(res, ERR_MSGS.USER_NOT_FOUND);
      }

      await MessageService.deleteConversation(req._id, otherUser._id);
      this.Ok(res, { message: "Conversation deleted successfully" });
    } catch (error) {
      this.InternalServerError(res, (error as Error).message);
    }
  }
}

export default new ChatController();
