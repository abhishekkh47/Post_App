import mongoose from "mongoose";
import { INotification, MongooseModel } from "types";

export type INotificationSchema = MongooseModel<INotification> &
  mongoose.Document;

const schema = new mongoose.Schema<INotificationSchema>(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    message: {
      type: mongoose.Schema.Types.String,
      required: true,
      default: null,
    },
    isRead: {
      type: mongoose.Schema.Types.Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

export const NotificationTable = mongoose.model<INotificationSchema>(
  "notification",
  schema
);
