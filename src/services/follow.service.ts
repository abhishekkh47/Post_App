import { NetworkError } from "middleware/errorHandler.middleware";
import { FollowTable } from "models/follows";
import { IFollowUser } from "types/common";

class FollowService {
  async followUser(followUser: IFollowUser) {
    try {
      await FollowTable.create(followUser);
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  async unFollowUser(unFollowUser: IFollowUser) {
    try {
      await FollowTable.findOneAndDelete(unFollowUser);
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }
}

export default new FollowService();
