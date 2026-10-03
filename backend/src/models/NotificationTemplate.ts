import mongoose, { Schema, Document } from "mongoose";

export interface INotificationTemplate extends Document {
  name: string;
  code: string;
  category: "marketing" | "orders" | "inventory" | "security" | "system";
  channel: "in_app" | "email" | "push" | "sms";
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  badge?: string;
  themeColor: "blue" | "cyan" | "indigo" | "emerald" | "amber" | "rose";
  icon: string;
  active: boolean;
  isDefault: boolean;
  sentCount: number;
  lastSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationTemplateSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Template name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Template code is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["marketing", "orders", "inventory", "security", "system"],
      default: "marketing",
      index: true,
    },
    channel: {
      type: String,
      enum: ["in_app", "email", "push", "sms"],
      default: "in_app",
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message body is required"],
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
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    sentCount: {
      type: Number,
      default: 0,
    },
    lastSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const NotificationTemplate = mongoose.model<INotificationTemplate>(
  "NotificationTemplate",
  NotificationTemplateSchema
);
