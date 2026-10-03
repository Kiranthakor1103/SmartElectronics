import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  recipient: string; // "all", "admin", or user ID
  role: "customer" | "admin" | "seller" | "all";
  channel: "in_app" | "email" | "push" | "sms";
  templateCode?: string;
  category: "marketing" | "orders" | "inventory" | "security" | "system";
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  badge?: string;
  themeColor: "blue" | "cyan" | "indigo" | "emerald" | "amber" | "rose";
  icon: string;
  read: boolean;
  isRead?: boolean;
  status: "pending" | "delivered" | "read" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    recipient: {
      type: String,
      default: "all",
      index: true,
    },
    role: {
      type: String,
      enum: ["customer", "admin", "seller", "all"],
      default: "all",
      index: true,
    },
    channel: {
      type: String,
      enum: ["in_app", "email", "push", "sms"],
      default: "in_app",
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "delivered", "read", "failed"],
      default: "delivered",
      index: true,
    },
    templateCode: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ["marketing", "orders", "inventory", "security", "system"],
      default: "marketing",
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    actionLabel: {
      type: String,
      default: "View Details",
      trim: true,
    },
    actionUrl: {
      type: String,
      default: "/products",
      trim: true,
    },
    badge: {
      type: String,
      default: "TECH DROP",
      trim: true,
    },
    themeColor: {
      type: String,
      enum: ["blue", "cyan", "indigo", "emerald", "amber", "rose"],
      default: "blue",
    },
    icon: {
      type: String,
      default: "Zap",
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

NotificationSchema.virtual("isRead").get(function () {
  return this.read;
});

export const Notification = mongoose.model<INotification>("Notification", NotificationSchema);
