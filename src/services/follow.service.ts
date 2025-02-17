import { NetworkError } from "middleware";
import { FriendsTable, UserTable } from "models";
import { IFollowUser, IUser } from "types";
import { ObjectId } from "mongodb";

class FollowService {
  async followUser(followUser: IFollowUser): Promise<boolean> {
    try {
      await Promise.all([
        FriendsTable.create(followUser),
        UserTable.findOneAndUpdate(
          { _id: followUser.followerId },
          { $inc: { followers: 1 } }
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
          { _id: unFollowUser.followerId },
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
   * @param user
   * @param followedUser id of user being followed
   * @returns {boolean}
   */
  async ifUserFollowed(
    user: Partial<IUser>,
    followedUser: Partial<IUser>
  ): Promise<boolean> {
    try {
      if (user.toString() == followedUser.toString()) return true;
      const ifUserFollowed = await FriendsTable.findOne({
        followerId: user._id,
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
}

export default new FollowService();
