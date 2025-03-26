import { NetworkError } from "middleware";
import { GroupMessageTable, GroupTable } from "models";
import { ObjectId } from "mongodb";
import { IGroupConversation, IGroups } from "types";
import { GROUP_CHAT_USER_ROLE } from "utils/constants";
import { v4 as uuidv4 } from "uuid";

class GroupService {
  async createGroup(
    name: string,
    description: string,
    createdBy: string,
    members: string[]
  ) {
    try {
      const initialMembers = [
        {
          userId: createdBy,
          role: GROUP_CHAT_USER_ROLE.ADMIN,
          joinedAt: new Date(),
        },
        ...members.map((userId) => ({
          userId,
          role: GROUP_CHAT_USER_ROLE.MEMBER,
          joinedAt: new Date(),
        })),
      ];

      return await GroupTable.create({
        name,
        description,
        createdBy,
        members: initialMembers,
        inviteToken: uuidv4(),
      });
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  async addMember(
    groupId: string,
    users: string[],
    role: string = GROUP_CHAT_USER_ROLE.MEMBER
  ) {
    try {
      const membersToAdd = users.map((userId) => ({
        userId,
        role,
        joinedAt: new Date(),
      }));
      return await GroupTable.findByIdAndUpdate(
        groupId,
        {
          $push: {
            members: { $each: membersToAdd },
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
        .populate("groupId", "name");
      if (!newMessage) {
        return message.toObject();
      }
      return newMessage;
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
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate("senderId", "firstName lastName profile_pic");
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
    data: { name: string; description: string | null }
  ) {
    try {
      await GroupTable.findOneAndUpdate(
        { _id: new ObjectId(groupId) },
        { name: data.name, description: data?.description }
      );
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
              $sum: {
                $map: {
                  input: "$lastMessageArray",
                  as: "msg",
                  in: {
                    $cond: [
                      { $in: [new ObjectId(userId), "$$msg.readBy.userId"] },
                      0,
                      1,
                    ],
                  },
                },
              },
            },
            type: "group", // Add a type field to distinguish from one-to-one
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "members.userId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $addFields: {
            members: {
              $map: {
                input: "$members",
                as: "member",
                in: {
                  $mergeObjects: [
                    "$$member",
                    {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$userDetails",
                            as: "userDetail",
                            cond: {
                              $eq: ["$$userDetail._id", "$$member.userId"],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  ],
                },
              },
            },
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
            profile_pic: 1,
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

  async getGroupDetails(groupId: string) {
    try {
      const groupDetails = await GroupTable.aggregate([
        {
          $match: {
            _id: new ObjectId(groupId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "members.userId",
            foreignField: "_id",
            as: "usersDetails",
          },
        },
        {
          // Add user details into members array
          $addFields: {
            members: {
              $map: {
                input: "$members",
                as: "member",
                in: {
                  $mergeObjects: [
                    "$$member",
                    {
                      // Ensures that usersDetails is always an array
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: { $ifNull: ["$usersDetails", []] }, // Ensure usersDetails is an array
                            as: "user",
                            cond: { $eq: ["$$user._id", "$$member.userId"] },
                          },
                        },
                        0, // Get the first match
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
        {
          // Remove the usersDetails array as it's no longer needed
          $project: {
            usersDetails: 0,
          },
        },
      ]).exec();
      return groupDetails[0];
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  async updateUserRole(groupId: string, userId: string, role: string) {
    try {
      await GroupTable.findOneAndUpdate(
        { _id: new ObjectId(groupId), "members.userId": new ObjectId(userId) },
        { $set: { "members.$.role": role } }
      );
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  async updateGroupProfilePicture(groupId: string, filename: string) {
    try {
      await GroupTable.findOneAndUpdate(
        { _id: new ObjectId(groupId) },
        { $set: { profile_pic: filename } }
      );
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }
}

export default new GroupService();
