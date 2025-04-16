import mongoose from "mongoose";
import { IPushSubscription, MongooseModel } from "types";

export type IPushSubscriptionSchema = MongooseModel<IPushSubscription> &
  mongoose.Document;

const schema = new mongoose.Schema<IPushSubscriptionSchema>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    subscription: {
      endpoint: {
        type: String,
        required: true,
      },
      expirationTime: {
        type: String,
        default: null,
      },
      keys: {
        p256dh: {
          type: String,
          required: true,
        },
        auth: {
          type: String,
          required: true,
        },
      },
    },
  },
  { timestamps: true }
);

// Create a unique index to prevent duplicate subscriptions
schema.index({ userId: 1, "subscription.endpoint": 1 }, { unique: true });

export const PushSubscriptionTable = mongoose.model<IPushSubscriptionSchema>(
  "push_subscription",
  schema
);
