import { NetworkError } from "middleware";
import { MessageTable } from "models";
import { ObjectId } from "mongodb";
import { IConversation, IMessage } from "types";

class MessageService {
  async sendMessage(
    senderId: string,
    receiverId: string,
    content: string,
    attachments?: string[]
  ): Promise<IMessage> {
    try {
      const message = await MessageTable.create({
        senderId,
        receiverId,
        content,
        attachments,
        isRead: false,
      });
      const newMessage = await MessageTable.findOne({ _id: message._id })
        .populate("senderId", "firstName lastName profile_pic")
        .populate("receiverId", "firstName lastName profile_pic");
      if (!newMessage) {
        return message.toObject();
      }
      return newMessage;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  async getConversation(userId1: string, userId2: string): Promise<IMessage[]> {
    try {
      const messages = await MessageTable.find({
        $or: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      })
        .sort({ createdAt: 1 })
        .select("senderId receiverId content isRead attachments createdAt")
        .populate("senderId", "firstName lastName profile_pic")
        .populate("receiverId", "firstName lastName profile_pic");

      return messages;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  async getUserConversations(userId: string): Promise<IConversation[]> {
    try {
      const conversations = await MessageTable.aggregate([
        {
          $match: {
            $or: [
              { senderId: new ObjectId(userId) },
              { receiverId: new ObjectId(userId) },
            ],
          },
        },
        {
          $sort: { createdAt: 1 },
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ["$senderId", new ObjectId(userId)] },
                "$receiverId",
                "$senderId",
              ],
            },
            lastMessage: { $last: "$$ROOT" },
            unreadCount: {
              $sum: {
                $cond: [{ $eq: ["$isRead", false] }, 1, 0],
              },
            },
          },
        },
        {
          $sort: { "lastMessage.createdAt": -1 },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        { $unwind: "$userDetails" },
      ]).exec();

      return conversations;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  async markMessagesAsRead(
    senderId: string,
    receiverId: string
  ): Promise<void> {
    try {
      await MessageTable.updateMany(
        {
          senderId,
          receiverId,
          isRead: false,
        },
        { $set: { isRead: true } }
      );
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  async deleteConversation(userId1: string, userId2: string): Promise<void> {
    try {
      await MessageTable.deleteMany({
        $or: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      });
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }
}

export default new MessageService();
