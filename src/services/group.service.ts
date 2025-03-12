import { NetworkError } from "middleware";
import { GroupMessageTable, GroupTable, MessageTable } from "models";
import { ObjectId } from "mongodb";
import { IConversation, IGroupConversation, IMessage } from "types";

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

  async getGroupConversations(userId: string): Promise<IGroupConversation[]> {
    try {
      // Get all groups where the user is a member
      const userGroups = await GroupTable.aggregate([
        {
          $match: {
            "members.userId": new ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "group_messages",
            let: { groupId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$groupId", "$$groupId"] },
                },
              },
              { $sort: { createdAt: -1 } },
              { $limit: 1 },
            ],
            as: "lastMessageArray",
          },
        },
        {
          $addFields: {
            lastMessage: { $arrayElemAt: ["$lastMessageArray", 0] },
            // This will count unread messages for this user
            unreadCount: {
              $size: {
                $filter: {
                  input: "$lastMessageArray",
                  as: "msg",
                  cond: {
                    $not: { $in: [new ObjectId(userId), "$$msg.readBy"] },
                  },
                },
              },
            },
            type: "group", // Add a type field to distinguish from one-to-one
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            createdBy: 1,
            members: 1,
            lastMessage: 1,
            unreadCount: 1,
            type: 1,
            // lastMessageArray: 0, // Remove the array since we've extracted what we need
          },
        },
        {
          $sort: { "lastMessage.createdAt": -1 },
        },
      ]).exec();
      return userGroups;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }
}

export default new GroupService();
