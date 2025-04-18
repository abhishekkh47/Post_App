import cron from "node-cron";
import { deleteOldNotifications } from "./deleteOldNotifications";

const JOBS = [
  {
    /**
     * Logic for rotating auth tokens from admin
     * Time: at 00:00 every day
     */
    disabled: false,
    expression: "0 0 * * *",
    func: deleteOldNotifications,
  },
];

export const startCron = () => {
  JOBS.forEach((job) => {
    const { disabled, expression, func } = job;
    if (!disabled) {
      cron.schedule(expression, func);
    }
  });
};
