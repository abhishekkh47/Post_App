import mongoose from "mongoose";
import { IBase } from "./base";

export interface INotification extends IBase {
  senderId: mongoose.Schema.Types.ObjectId;
  receiverId: mongoose.Schema.Types.ObjectId;
  message: string;
  isRead: boolean;
  type: EnotificationType;
  contentId: mongoose.Schema.Types.ObjectId;
}

export enum EnotificationType {
  OTHER = 0,
  FOLLOW = 1,
  POST = 2,
  LIKE = 3,
  COMMENT = 4,
}
