import { UserTable } from "models/user";
import { NetworkError } from "middleware";
import { IUser } from "types";
import { TokenService } from "services";
import { getHashedPassword, sendResetEmail } from "utils";

class UserService {
  /**
   * @description Delete a user
   * @param userId
   * @returns {true} if user is deleted successfully
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      await UserTable.findOneAndDelete({ _id: userId });
      return true;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  /**
   * @description toggle profile type to private or public
   * @param user
   * @returns {true} if user is deleted successfully
   */
  async toggleProfileType(user: IUser): Promise<boolean> {
    try {
      let statusToUpdate = !user.isPrivate;
      await UserTable.findOneAndUpdate(
        { _id: user._id },
        { $set: { isPrivate: statusToUpdate } },
        { upsert: true }
      );
      return true;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  /**
   * @description send email to user containing password reset link
   * @param user
   * @returns {true} if user is deleted successfully
   */
  async sendResetLink(user: IUser): Promise<boolean> {
    try {
      let email = user.email;
      const resetToken = TokenService.generateToken(user);
      await sendResetEmail(email, resetToken);
      return true;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  /**
   * @description send email to user containing password reset link
   * @param user user details
   * @param newPassword password to be updated
   * @returns {true} if user is deleted successfully
   */
  async resetPassword(user: IUser, newPassword: string): Promise<boolean> {
    try {
      const hashedPassword = getHashedPassword(newPassword);
      await UserTable.findOneAndUpdate(
        { _id: user?._id },
        { $set: { password: hashedPassword } }
      );
      return true;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  /**
   * @description check if profile is public
   * @param user
   * @returns {boolean} whether profile is public or not
   */
  async isPublicProfile(userId: string): Promise<boolean> {
    try {
      const user = await UserTable.findOne({ _id: userId });
      if (user?.isPrivate) return false;
      else return true;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }
}

export default new UserService();
