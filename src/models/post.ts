import mongoose from "mongoose";
import { IPost, MongooseModel } from "types";

export type IPostSchema = MongooseModel<IPost> & mongoose.Document;

const schema = new mongoose.Schema<IPostSchema>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    post: { type: mongoose.Schema.Types.String, required: true },
    type: { type: mongoose.Schema.Types.Number, required: true },
  },
  { timestamps: true }
);

export const PostTable = mongoose.model<IPostSchema>("post", schema);
