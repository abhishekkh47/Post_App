import { IBase } from "./base";
import mongoose from "mongoose";

export interface IGroups {
  name: string;
  description: string;
  createdBy: mongoose.Schema.Types.ObjectId; // Reference to the user who created the group
  profile_pic: string; // Optional group avatar
  members: [
    {
      userId: mongoose.Schema.Types.ObjectId; // Reference to User
      role: string; // "admin" or "member"
      joinedAt: Date;
    }
  ];
}

export interface IGroupMessages {
  groupId: mongoose.Schema.Types.ObjectId; // Reference to the group
  senderId: mongoose.Schema.Types.ObjectId; // User who sent the message
  content: string;
  attachments: string[]; // Optional array of attachment URLs
  readBy: [
    {
      userId: mongoose.Schema.Types.ObjectId;
      readAt: Date;
    }
  ];
}
