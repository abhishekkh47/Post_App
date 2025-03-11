import mongoose from "mongoose";
import { IBase } from "./base";

export interface IMessage extends IBase {
  senderId: mongoose.Schema.Types.ObjectId;
  receiverId: mongoose.Schema.Types.ObjectId;
  content: string;
  isRead: boolean;
  attachments?: string[];
}

export interface IConversation {
  _id: string;
  lastMessage: IMessage;
  userDetails: {
    _id: string;
    firstName: string;
    lastName: string;
    profile_pic?: string;
  };
}

export interface IGroupChat extends IBase {
  name: string;
  admin: mongoose.Schema.Types.ObjectId;
  members: mongoose.Schema.Types.ObjectId[];
  description: string;
  profile_pic: string;
}
