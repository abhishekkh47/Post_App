import mongoose from "mongoose";
import { IGroupChat, MongooseModel } from "types";

export type IGroupChatSchema = MongooseModel<IGroupChat> & mongoose.Document;

const schema = new mongoose.Schema<IGroupChatSchema>(
  {
    name: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user",
      },
    ],
    description: {
      type: mongoose.Schema.Types.String,
      required: false,
    },
    profile_pic: {
      type: mongoose.Schema.Types.String,
      required: false,
    },
  },
  { timestamps: true }
);

export const GroupTable = mongoose.model<IGroupChatSchema>("groups", schema);
