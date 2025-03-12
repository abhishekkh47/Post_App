import mongoose from "mongoose";
import { IGroups, MongooseModel } from "types";

export type IGroupsSchema = MongooseModel<IGroups> & mongoose.Document;

const schema = new mongoose.Schema<IGroupsSchema>(
  {
    name: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    description: {
      type: mongoose.Schema.Types.String,
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    profile_pic: {
      type: mongoose.Schema.Types.String,
      required: false,
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "user",
        },
        role: {
          type: mongoose.Schema.Types.String,
          required: false,
          default: "admin",
        },
        joinedAt: {
          type: mongoose.Schema.Types.Date,
          required: false,
          default: new Date(),
        },
      },
    ],
  },
  { timestamps: true }
);

export const GroupTable = mongoose.model<IGroupsSchema>("group", schema);
