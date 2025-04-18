import { NotificationTable } from "models";

export const deleteOldNotifications = async () => {
  console.log(
    "==========Start Cron to Deleting Absolete Notifications============="
  );

  const FIFTEEN_DAYS_AGO = new Date();
  FIFTEEN_DAYS_AGO.setDate(FIFTEEN_DAYS_AGO.getDate() - 15);

  let deletedNotifications: any = await NotificationTable.deleteMany({
    createdAt: { $lt: FIFTEEN_DAYS_AGO },
    isRead: true,
  });
  if (!deletedNotifications) {
    return false;
  }
  console.log(`${deletedNotifications.deletedCount} notifications deleted.`);
  return true;
};
