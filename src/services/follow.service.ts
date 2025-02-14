import { NetworkError } from "middleware";
import { FriendsTable, UserTable } from "models";
import { IFollowUser, IUser } from "types";

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
   * @description Get profiles followed by a user
   * @param userId
   * @returns {*} List of users being followed
   */
  async getUserFollowers(userId: string): Promise<any> {
    try {
      const followers = await FriendsTable.find({
        followerId: userId,
      }).populate("followeeId", "firstName lastName profile_pic");
      console.log("followers : ", JSON.stringify(followers));
      return followers;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  /**
   * @description Get profiles following the user
   * @param userId
   * @returns {*} List of users
   */
  async getUserFollowing(userId: string): Promise<any> {
    try {
      const followers = await FriendsTable.find({
        followeeId: userId,
      }).populate("followerId", "firstName lastName profile_pic");
      console.log("followees : ", JSON.stringify(followers));
      return followers;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }
}

export default new FollowService();
