import { NetworkError } from "middleware/errorHandler.middleware";
import { FollowTable } from "models/follows";
import { IFollowUser } from "types/common";

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
}

export default new FollowService();
