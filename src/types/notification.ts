import mongoose from "mongoose";
import { IBase } from "./base";

export interface INotification extends IBase {
  senderId: mongoose.Schema.Types.ObjectId;
  receiverId: mongoose.Schema.Types.ObjectId;
  message: string;
  isRead: boolean;
}
