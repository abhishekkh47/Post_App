import mongoose from "mongoose";
import { IUser, MongooseModel } from "types";

export type IUserSchema = MongooseModel<IUser> & mongoose.Document;

const schema = new mongoose.Schema<IUserSchema>(
  {
    email: {
      type: mongoose.Schema.Types.String,
      required: true,
      unique: true,
    },
    password: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    firstName: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    lastName: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    bio: {
      type: mongoose.Schema.Types.String,
      required: false,
    },
    profile_pic: {
      type: mongoose.Schema.Types.String,
      required: false,
    },
    isPrivate: {
      type: mongoose.Schema.Types.Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

export const UserTable = mongoose.model<IUserSchema>("user", schema);
