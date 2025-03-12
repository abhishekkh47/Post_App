import { NetworkError } from "middleware";
import { GroupMessageTable, GroupTable, MessageTable } from "models";
import { ObjectId } from "mongodb";
import { IConversation, IMessage } from "types";

class GroupService {
  async createGroup(
    name: string,
    description: string,
    createdBy: string,
    members: string[]
  ) {
    try {
      const initialMembers = [
        { userId: createdBy, role: "admin", joinedAt: new Date() },
        ...members.map((userId) => ({
          userId,
          role: "member",
          joinedAt: new Date(),
        })),
      ];

      return await GroupTable.create({
        name,
        description,
        createdBy,
        members: initialMembers,
      });
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  async addMember(groupId: string, userId: string, role: string = "member") {
    try {
      return await GroupTable.findByIdAndUpdate(
        groupId,
        {
          $push: {
            members: {
              userId,
              role,
              joinedAt: new Date(),
            },
          },
        },
        { new: true }
      );
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  async removeMember(groupId: string, userId: string) {
    try {
      return await GroupTable.findByIdAndUpdate(
        groupId,
        {
          $pull: {
            members: { userId },
          },
        },
        { new: true }
      );
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  async getGroupById(groupId: string) {
    return await GroupTable.findById(groupId);
  }

  async getUserGroups(userId: string) {
    try {
      return await GroupTable.find({
        "members.userId": userId,
      });
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

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

  async sendGroupMessage(
    groupId: string,
    senderId: string,
    content: string,
    attachments: string[] = []
  ) {
    try {
      const message = await GroupMessageTable.create({
        groupId,
        senderId,
        content,
        attachments,
        createdAt: new Date(),
        readBy: [{ userId: senderId, readAt: new Date() }],
      });
      const newMessage = await GroupMessageTable.findOne({ _id: message._id })
        .populate("senderId", "firstName lastName profile_pic")
        .populate("receiverId", "firstName lastName profile_pic");
      if (!newMessage) {
        return message.toObject();
      }
      return message;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  async getGroupMessages(
    groupId: string,
    limit: number = 50,
    skip: number = 0
  ) {
    try {
      return await GroupMessageTable.find({ groupId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("senderId", "name email avatar");
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  async markGroupMessageAsRead(messageId: string, userId: string) {
    try {
      return await GroupMessageTable.findOneAndUpdate(
        { _id: messageId, "readBy.userId": { $ne: userId } },
        {
          $push: {
            readBy: { userId, readAt: new Date() },
          },
        },
        { new: true }
      );
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  async updateGroup(
    groupId: string,
    data: { name: string; description: string }
  ) {
    try {
      console.log("groupId : ", groupId);
      console.log("data : ", data);
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  async deleteGroup(groupId: string) {
    try {
      console.log("groupId : ", groupId);
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }
}

export default new GroupService();
