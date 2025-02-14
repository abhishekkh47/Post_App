import mongoose from "mongoose";
import { IFriends, MongooseModel } from "types";

export type IFriendsSchema = MongooseModel<IFriends> & mongoose.Document;
const schema = new mongoose.Schema<IFriendsSchema>(
  {
    // user who is following the other person
    followerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    // user who is being followed
    followeeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
  },
  { timestamps: true }
);

export const FriendsTable = mongoose.model<IFriendsSchema>("friend", schema);
