import mongoose from "mongoose";
import { IBase } from "./base";

export interface IPostReaction extends IBase {
  userId: mongoose.Schema.Types.ObjectId;
  postId: mongoose.Schema.Types.ObjectId;
  type: EReactionType;
}

export enum EReactionType {
  LIKE = "like",
}
