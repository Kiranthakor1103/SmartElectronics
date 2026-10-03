import { Router, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { sendSupportTicketEmail } from "../utils/mailer";
import { SupportTicket } from "../models/SupportTicket";

const router = Router();

router.post("/", asyncHandler(async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    throw new AppError("Name, email, and message are required fields.", 400);
  }

  const ticketId = `KT-${Date.now().toString().slice(-6)}`;

  // 1. Save ticket in database
  let savedTicket = null;
  try {
    savedTicket = await SupportTicket.create({
      ticketId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject?.trim() || "General Inquiry",
      message: message.trim(),
      status: "open",
    });
  } catch (dbErr: any) {
    console.warn("[Contact] Could not persist ticket in MongoDB:", dbErr.message);
  }

  // 2. Dispatch email notification to admin (supportsmatel23@yopmail.com)
  const mailResult = await sendSupportTicketEmail({
    ticketId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject?.trim() || "General Inquiry",
    message: message.trim(),
  });

  if (savedTicket && mailResult.success) {
    savedTicket.adminNotified = true;
    await savedTicket.save().catch(() => {});
  }

  return res.status(200).json({
    success: true,
    message: "Thank you for reaching out! Your support ticket has been forwarded to our admin team.",
    ticketId,
  });
}));

export default router;
