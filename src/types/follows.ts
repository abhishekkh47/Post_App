import { IBase } from "./base";
import mongoose from "mongoose";

export interface IFollows extends IBase {
  followerId: mongoose.Schema.Types.ObjectId;
  followeeId: mongoose.Schema.Types.ObjectId;
}
