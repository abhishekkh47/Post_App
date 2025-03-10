import mongoose from "mongoose";
import { IPostReaction, MongooseModel, EReactionType } from "types";

export type IPostReactionSchema = MongooseModel<IPostReaction> &
  mongoose.Document;

const schema = new mongoose.Schema<IPostReactionSchema>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "post",
    },
    type: {
      type: mongoose.Schema.Types.String,
      required: true,
      default: EReactionType.LIKE,
    },
  },
  { timestamps: true }
);

export const PostReactionTable = mongoose.model<IPostReaction>(
  "post_reaction",
  schema
);
