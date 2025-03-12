import mongoose from "mongoose";
import { IGroupMessages, MongooseModel } from "types";

export type IGroupMessagesSchema = MongooseModel<IGroupMessages> &
  mongoose.Document;

const schema = new mongoose.Schema<IGroupMessagesSchema>(
  {
    groupId: {
      type: mongoose.Schema.Types.String,
      required: true,
      ref: "group",
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    content: {
      type: mongoose.Schema.Types.String,
      required: false,
    },
    attachments: [
      {
        type: mongoose.Schema.Types.String,
        required: false,
      },
    ],
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "user",
        },
        readAt: {
          type: mongoose.Schema.Types.Date,
          required: false,
          default: new Date(),
        },
      },
    ],
  },
  { timestamps: true }
);

export const GroupMessageTable = mongoose.model<IGroupMessagesSchema>(
  "group_message",
  schema
);
