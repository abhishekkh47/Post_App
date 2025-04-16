import mongoose from "mongoose";
import { IBase } from "./base";

export interface IPushSubscription extends IBase {
  userId: mongoose.Schema.Types.ObjectId;
  subscription: {
    endpoint: string;
    expirationTime: string | null;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
}
