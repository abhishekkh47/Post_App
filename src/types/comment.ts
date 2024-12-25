import mongoose from "mongoose";
import { IBase } from "./base";

export interface IComment extends IBase {
  userId: mongoose.Schema.Types.ObjectId;
  postId: mongoose.Schema.Types.ObjectId;
  parentId: mongoose.Schema.Types.ObjectId;
  content: string;
  type: ECommentType;
  likes: number;
}

export enum ECommentType {
  COMMENT = "comment",
  REPLY = "reply",
}
