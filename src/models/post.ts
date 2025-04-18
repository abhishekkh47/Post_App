import mongoose from "mongoose";
import { IPost, MongooseModel } from "types";

export type IPostSchema = MongooseModel<IPost> & mongoose.Document;

const schema = new mongoose.Schema<IPostSchema>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    post: {
      type: mongoose.Schema.Types.String,
      required: false,
      default: null,
    },
    type: { type: mongoose.Schema.Types.Number, required: true },
    edited: {
      type: mongoose.Schema.Types.Boolean,
      required: false,
      default: false,
    },
    attachments: [
      {
        type: mongoose.Schema.Types.String,
        required: false,
        default: null,
      },
    ],
    reactions: {
      type: mongoose.Schema.Types.Number,
      required: false,
      default: 0,
    },
    comments: {
      type: mongoose.Schema.Types.Number,
      required: false,
      default: 0,
    },
  },
  { timestamps: true }
);

export const PostTable = mongoose.model<IPostSchema>("post", schema);
