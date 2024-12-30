import mongoose from "mongoose";
import { IFollows, MongooseModel } from "types";

export type IFollowsSchema = MongooseModel<IFollows> & mongoose.Document;
const schema = new mongoose.Schema<IFollowsSchema>(
  {
    followerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    followeeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

export const FollowTable = mongoose.model<IFollowsSchema>("follow", schema);
