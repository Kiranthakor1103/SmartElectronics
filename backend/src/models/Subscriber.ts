import mongoose, { Schema, Document } from "mongoose";

export interface ISubscriber extends Document {
  email: string;
  source: string;
  status: "active" | "unsubscribed";
  welcomeEmailSent: boolean;
  subscribedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriberSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
    },
    source: {
      type: String,
      default: "footer_tech_drop_alerts",
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "unsubscribed"],
      default: "active",
      index: true,
    },
    welcomeEmailSent: {
      type: Boolean,
      default: false,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Subscriber = mongoose.model<ISubscriber>("Subscriber", SubscriberSchema);
