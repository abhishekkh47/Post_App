import webpush from "web-push";
import Config from "../config";
import { PushSubscriptionTable } from "models/pushSubscription";
import { ObjectId } from "mongodb";

export const vapidConfig = () => {
  webpush.setVapidDetails(
    "mailto:abhishekkhandelwal47@gmail.com",
    Config.PUBLIC_VAPID_KEY!,
    Config.PRIVATE_VAPID_KEY!
  );
};

class WebPushService {
  async saveSubscription(
    userId: string,
    subscription: webpush.PushSubscription
  ): Promise<boolean> {
    try {
      await PushSubscriptionTable.findOneAndUpdate(
        {
          userId: new ObjectId(userId),
          "subscription.endpoint": subscription.endpoint,
        },
        {
          userId: new ObjectId(userId),
          subscription,
        },
        { upsert: true, new: true }
      );
      return true;
    } catch (error) {
      console.error("Error saving subscription:", error);
      return false;
    }
  }

  async sendPushNotification(
    receiverId: string,
    title: string,
    body: string,
    url?: string,
    icon?: string
  ): Promise<boolean> {
    try {
      // Find all subscriptions for this user
      const subscriptions = await PushSubscriptionTable.find({
        userId: new ObjectId(receiverId),
      });

      if (!subscriptions.length) {
        console.log(`No subscriptions found for user ${receiverId}`);
        return false;
      }

      // Prepare notification payload
      const notificationPayload = JSON.stringify({
        title,
        body,
        url: url || "/",
        icon:
          icon ||
          "https://asset.cloudinary.com/dwinhws99/db21266c28bd8d9d13a2b4089594ddb8",
      });

      // Send notification to all subscriptions
      const sendPromises = subscriptions.map(async (sub: any) => {
        try {
          await webpush.sendNotification(sub.subscription, notificationPayload);
          return true;
        } catch (error: any) {
          console.error(`Error sending notification: ${error.message}`);

          // If subscription is expired or invalid, remove it
          if (error.statusCode === 410) {
            await PushSubscriptionTable.deleteOne({ _id: sub._id });
            console.log(`Removed invalid subscription for user ${receiverId}`);
          }

          return false;
        }
      });

      const results = await Promise.all(sendPromises);
      return results.some(Boolean); // Return true if at least one notification was sent
    } catch (error) {
      console.error("Error sending push notification:", error);
      return false;
    }
  }

  // Helper function to send notification for a new message
  async sendMessageNotification(
    senderId: string,
    receiverId: string,
    senderName: string = "abhishek",
    messagePreview: string = "message"
  ): Promise<boolean> {
    return await this.sendPushNotification(
      receiverId,
      `New message from ${senderName}`,
      messagePreview,
      `/messages/${senderId}` // URL to open when notification is clicked
    );
  }

  // Helper function to send notification for a new like
  async sendLikeNotification(
    senderId: string,
    receiverId: string,
    senderName: string = "abhishek",
    postId: string
  ): Promise<boolean> {
    return await this.sendPushNotification(
      receiverId,
      `New like from ${senderName}`,
      `${senderName} liked your post`,
      `/posts/${postId}` // URL to open when notification is clicked
    );
  }

  // Helper function to send notification for a new comment
  async sendCommentNotification(
    senderId: string,
    receiverId: string,
    senderName: string = "abhishek",
    postId: string,
    commentPreview: string = "comment"
  ): Promise<boolean> {
    return await this.sendPushNotification(
      receiverId,
      `New comment from ${senderName}`,
      commentPreview,
      `/posts/${postId}` // URL to open when notification is clicked
    );
  }
}

export default new WebPushService();
