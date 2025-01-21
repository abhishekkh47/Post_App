import { NetworkError } from "middleware";
import { FollowTable } from "models";
import { IFollowUser, IUser } from "types";

class FollowService {
  async followUser(followUser: IFollowUser): Promise<boolean> {
    try {
      await FollowTable.create(followUser);
      return true;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  async unFollowUser(unFollowUser: IFollowUser): Promise<boolean> {
    try {
      await FollowTable.findOneAndDelete(unFollowUser);
      return true;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  async ifUserFollowed(
    user: Partial<IUser>,
    followedUser: Partial<IUser>
  ): Promise<boolean> {
    try {
      const ifUserFollowed = await FollowTable.findOne({
        followeeId: user._id,
        followerId: followedUser,
      });
      if (ifUserFollowed) return true;
      else return false;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }
}

export default new FollowService();
