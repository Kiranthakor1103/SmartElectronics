import mongoose, { Schema, Document } from "mongoose";

export interface ISupportTicket extends Document {
  ticketId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  adminNotified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema: Schema = new Schema(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    subject: { type: String, default: "General Inquiry" },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
      index: true,
    },
    adminNotified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const SupportTicket = mongoose.model<ISupportTicket>("SupportTicket", SupportTicketSchema);
