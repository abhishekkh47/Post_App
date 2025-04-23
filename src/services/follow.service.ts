import { NetworkError } from "middleware";
import { FriendsTable, UserTable } from "models";
import { IFollowUser, IUser } from "types";
import { ObjectId } from "mongodb";
import { UserService } from "services";
import { NOTIFICATION_MSGS } from "utils";

class FollowService {
  async followUser(user: IUser, followUser: IFollowUser): Promise<boolean> {
    const { followerId, followeeId } = followUser;
    try {
      await Promise.all([
        FriendsTable.create(followUser),
        UserTable.findOneAndUpdate(
          { _id: followerId },
          { $inc: { following: 1 } }
        ),
        UserTable.findOneAndUpdate(
          { _id: followeeId },
          { $inc: { followers: 1 } }
        ),
        UserService.sendNotification(
          followerId,
          followeeId,
          NOTIFICATION_MSGS.FOLLOW
        ),
      ]);
      return true;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  async unFollowUser(unFollowUser: IFollowUser): Promise<boolean> {
    try {
      const { followeeId, followerId } = unFollowUser;
      await Promise.all([
        FriendsTable.findOneAndDelete({ followeeId, followerId }),
        UserTable.findOneAndUpdate(
          { _id: followerId },
          { $inc: { following: -1 } }
        ),
        UserTable.findOneAndUpdate(
          { _id: followeeId },
          { $inc: { followers: -1 } }
        ),
      ]);
      return true;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  /**
   * @description Check if user is followed or not
   * @param userId
   * @param followedUser id of user being followed
   * @returns {boolean}
   */
  async ifUserFollowed(userId: string, followedUser: string): Promise<boolean> {
    try {
      if (userId == followedUser) return true;
      const ifUserFollowed = await FriendsTable.findOne({
        followerId: userId,
        followeeId: followedUser,
      });
      if (ifUserFollowed) return true;
      else return false;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  /**
   * @description Get profiles following the user
   * @param userId
   * @returns {*} List of users following the user
   */
  async getUserFollowers(userId: string): Promise<any> {
    try {
      const followers = await FriendsTable.aggregate([
        {
          $match: {
            followeeId: new ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "followerId",
            foreignField: "_id",
            as: "users",
          },
        },
        {
          $unwind: {
            path: "$users",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $project: {
            userId: "$followeeId",
            users: {
              _id: "$users._id",
              email: "$users.email",
              firstName: "$users.firstName",
              lastName: "$users.lastName",
              bio: "$users.bio",
              profile_pic: "$users.profile_pic",
              isPrivate: "$users.isPrivate",
            },
          },
        },
        {
          $group: {
            _id: "$userId",
            users: { $push: "$users" },
          },
        },
        {
          $project: {
            userId: "$_id",
            users: 1,
            _id: 0,
          },
        },
      ]).exec();
      return followers.length ? followers[0] : [];
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  /**
   * @description Get profiles followed by user
   * @param userId
   * @returns {*} List of users being followed
   */
  async getUserFollowing(userId: string): Promise<any> {
    try {
      const following = await FriendsTable.aggregate([
        {
          $match: {
            followerId: new ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "followeeId",
            foreignField: "_id",
            as: "users",
          },
        },
        {
          $unwind: {
            path: "$users",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $project: {
            userId: "$followerId",
            users: {
              _id: "$users._id",
              email: "$users.email",
              firstName: "$users.firstName",
              lastName: "$users.lastName",
              bio: "$users.bio",
              profile_pic: "$users.profile_pic",
              isPrivate: "$users.isPrivate",
            },
          },
        },
        {
          $group: {
            _id: "$userId",
            users: { $push: "$users" },
          },
        },
        {
          $project: {
            userId: "$_id",
            users: 1,
            _id: 0,
          },
        },
      ]).exec();
      return following.length ? following[0] : [];
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  /**
   * @description Get profiles followed by user or follo the user
   * @param userId
   * @returns {*} List of users who are either in following or followers
   */
  async getUserFriends(userId: string): Promise<any> {
    try {
      const friends = await FriendsTable.aggregate([
        // Get the followers
        {
          $facet: {
            followers: [
              {
                $match: {
                  followeeId: new ObjectId(userId),
                },
              },
              {
                $lookup: {
                  from: "users",
                  localField: "followerId",
                  foreignField: "_id",
                  as: "users",
                },
              },
              {
                $unwind: {
                  path: "$users",
                  preserveNullAndEmptyArrays: false,
                },
              },
              {
                $project: {
                  userId: "$followeeId",
                  users: {
                    _id: "$users._id",
                    email: "$users.email",
                    firstName: "$users.firstName",
                    lastName: "$users.lastName",
                    bio: "$users.bio",
                    profile_pic: "$users.profile_pic",
                    isPrivate: "$users.isPrivate",
                  },
                },
              },
            ],
            following: [
              {
                $match: {
                  followerId: new ObjectId(userId),
                },
              },
              {
                $lookup: {
                  from: "users",
                  localField: "followeeId",
                  foreignField: "_id",
                  as: "users",
                },
              },
              {
                $unwind: {
                  path: "$users",
                  preserveNullAndEmptyArrays: false,
                },
              },
              {
                $project: {
                  userId: "$followerId",
                  users: {
                    _id: "$users._id",
                    email: "$users.email",
                    firstName: "$users.firstName",
                    lastName: "$users.lastName",
                    bio: "$users.bio",
                    profile_pic: "$users.profile_pic",
                    isPrivate: "$users.isPrivate",
                  },
                },
              },
            ],
          },
        },
        {
          $project: {
            friends: {
              $setUnion: ["$followers.users", "$following.users"],
            },
          },
        },
        {
          $unwind: {
            path: "$friends",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $group: {
            _id: "$friends._id",
            user: { $first: "$friends" },
          },
        },
        {
          $project: {
            _id: 0,
            user: 1,
          },
        },
      ]).exec();

      return friends.length ? friends.map((friend) => friend.user) : [];
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  /**
   * @description Get recommended users who are not yet followed
   * @param userId
   * @returns {*} List of users who are not followed by the users
   */
  async getFriendRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<IUser[]> {
    try {
      // Convert userId to ObjectId
      const userObjectId = new ObjectId(userId);

      // Find users that the current user is following
      const following = await FriendsTable.find({ followerId: userObjectId })
        .select("followeeId")
        .lean();

      // Extract just the IDs of followed users
      const followingIds = following.map((f) => f.followeeId);

      // Find popular users that aren't followed yet
      const recommendedUsers = await UserTable.aggregate([
        {
          $match: {
            _id: { $nin: [...followingIds, userObjectId] },
            // isPrivate: false, // Only recommend public profiles
          },
        },
        // Sort by popularity (followers count)
        { $sort: { followers: -1 } },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            profile_pic: 1,
            bio: 1,
            followers: 1,
            posts: 1,
          },
        },
      ]);

      return recommendedUsers;
    } catch (error) {
      throw error;
    }
  }

  async getFriendsOfFriendsRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<IUser[]> {
    try {
      const userObjectId = new ObjectId(userId);

      // Find users that the current user is already following
      const following = await FriendsTable.find({ followerId: userObjectId })
        .select("followeeId")
        .lean();

      const followingIds = following.map((f) => f.followeeId);
      // followingIds.push(userObjectId); // Add the user's own ID to exclude

      // Find friends of friends
      const recommendations = await FriendsTable.aggregate([
        { $match: { followerId: { $in: [...followingIds, userObjectId] } } },
        // Group by the followee to count how many connections they have
        {
          $group: {
            _id: "$followeeId",
            connectionCount: { $sum: 1 },
          },
        },
        // Filter out users that are already followed
        { $match: { _id: { $nin: [...followingIds, userObjectId] } } },
        // Sort by the number of mutual connections
        { $sort: { connectionCount: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        { $unwind: "$userDetails" },

        // Only recommend public profiles
        // { $match: { "userDetails.isPrivate": false } },

        {
          $project: {
            _id: "$userDetails._id",
            firstName: "$userDetails.firstName",
            lastName: "$userDetails.lastName",
            profile_pic: "$userDetails.profile_pic",
            bio: "$userDetails.bio",
            followers: "$userDetails.followers",
            posts: "$userDetails.posts",
            mutualConnections: "$connectionCount",
          },
        },
      ]);

      return recommendations;
    } catch (error) {
      throw error;
    }
  }
}

export default new FollowService();
