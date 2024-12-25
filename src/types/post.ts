import mongoose from "mongoose";
import { IBase } from "./base";

export interface IPost extends IBase {
  userId: mongoose.Schema.Types.ObjectId;
  post: string;
  type: EPostType;
}

enum EPostType {
  TEXT = 1,
  IMAGE = 2,
}

export interface ICreatePost {
  userId: string;
  post: string;
  type: EPostType;
}
