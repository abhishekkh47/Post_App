import { NotificationTable } from "models";
import { NetworkError } from "middleware";
import { IUser } from "types";

class NotificationService {
  /**
   * @description get notification for the user
   * @param user
   * @returns {*}
   */
  async getNotification(user: IUser): Promise<any> {
    try {
      const notifications = await NotificationTable.find({
        receiverId: user._id,
      })
        .populate("senderId", "firstName lastName profile_pic")
        .lean();
      return notifications;
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }

  /**
   * @description mark notification as read
   * @param notificationId
   * @returns {*}
   */
  async updateNotification(notificationId: string): Promise<any> {
    try {
      await NotificationTable.findOneAndUpdate(
        {
          _id: notificationId,
        },
        { $set: { isRead: true } }
      );
    } catch (error) {
      throw new NetworkError((error as Error).message, 400);
    }
  }
}

export default new NotificationService();
