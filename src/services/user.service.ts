import { UserTable } from "models/user";
import { NetworkError } from "middleware";

class UserService {
  /**
   * @description Delete a user
   * @param userId
   * @returns {true} if user is deleted successfully
   */
  async deleteUser(userId: string) {
    try {
      await UserTable.findOneAndDelete({ _id: userId });
      return true;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }
}

export default new UserService();
