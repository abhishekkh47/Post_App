import mongoose from "mongoose";
import { IComment, MongooseModel } from "types";

export type ICommentSchema = MongooseModel<IComment> & mongoose.Document;

const schema = new mongoose.Schema<ICommentSchema>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "posts",
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "comments",
      default: null,
    },
    content: {
      type: mongoose.Schema.Types.String,
      required: true,
      default: null,
    },
    type: {
      type: mongoose.Schema.Types.String,
      required: true,
      default: null,
    },
    likes: {
      type: mongoose.Schema.Types.Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

export const CommentTable = mongoose.model<ICommentSchema>("comments", schema);
