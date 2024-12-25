import { UserTable } from "models/user";
import { NetworkError } from "middleware";

class UserService {
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
