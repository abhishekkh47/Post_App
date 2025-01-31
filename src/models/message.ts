import mongoose from "mongoose";
import { IMessage, MongooseModel } from "types";

export type IMessageSchema = MongooseModel<IMessage> & mongoose.Document;

const schema = new mongoose.Schema<IMessageSchema>({
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
  content: {
    type: mongoose.Schema.Types.String,
    required: true,
  },
  isRead: {
    type: mongoose.Schema.Types.Boolean,
    required: true,
  },
  attachments: [
    {
      type: mongoose.Schema.Types.String,
    },
  ],
});

export const MessageTable = mongoose.model<IMessageSchema>("messages", schema);
