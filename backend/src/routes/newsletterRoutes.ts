import { Router, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { Subscriber } from "../models/Subscriber";
import { sendNewsletterWelcomeEmail } from "../utils/mailer";

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/newsletter/subscribe
 * Subscribes an email to the exclusive tech drop newsletter list.
 */
router.post(
  "/subscribe",
  asyncHandler(async (req: Request, res: Response) => {
    const { email, source = "footer_tech_drop_alerts" } = req.body;

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      throw new AppError("Please provide a valid email address.", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if subscriber already exists
    const existing = await Subscriber.findOne({ email: normalizedEmail });

    if (existing) {
      if (existing.status === "active") {
        return res.status(200).json({
          success: true,
          message: "You're already subscribed to tech drop alerts! Keep an eye on your inbox.",
          alreadySubscribed: true,
          data: {
            email: existing.email,
            subscribedAt: existing.subscribedAt,
          },
        });
      }

      // Re-activate previously unsubscribed user
      existing.status = "active";
      existing.subscribedAt = new Date();
      await existing.save();

      // Dispatch welcome email asynchronously
      void sendNewsletterWelcomeEmail(normalizedEmail).then((mailResult) => {
        if (mailResult.success) {
          existing.welcomeEmailSent = true;
          void existing.save().catch(() => {});
        }
      });

      return res.status(200).json({
        success: true,
        message: "Welcome back! Your subscription to exclusive tech drop alerts is reactivated.",
        alreadySubscribed: false,
        data: {
          email: existing.email,
          subscribedAt: existing.subscribedAt,
        },
      });
    }

    // Create new subscriber
    const newSubscriber = await Subscriber.create({
      email: normalizedEmail,
      source: String(source).trim(),
      status: "active",
      subscribedAt: new Date(),
    });

    // Dispatch welcome email asynchronously
    void sendNewsletterWelcomeEmail(normalizedEmail).then((mailResult) => {
      if (mailResult.success) {
        newSubscriber.welcomeEmailSent = true;
        void newSubscriber.save().catch(() => {});
      }
    });

    return res.status(201).json({
      success: true,
      message: "🎉 Success! You're subscribed to exclusive tech drop alerts.",
      alreadySubscribed: false,
      data: {
        id: newSubscriber._id,
        email: newSubscriber.email,
        subscribedAt: newSubscriber.subscribedAt,
      },
    });
  })
);

/**
 * GET /api/newsletter/subscribers
 * Retrieves list of newsletter subscribers for admin reporting.
 */
router.get(
  "/subscribers",
  asyncHandler(async (req: Request, res: Response) => {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const status = req.query.status as string | undefined;

    const query: Record<string, unknown> = {};
    if (status && ["active", "unsubscribed"].includes(status)) {
      query.status = status;
    }

    const [subscribers, totalActive, totalAll] = await Promise.all([
      Subscriber.find(query).sort({ subscribedAt: -1 }).limit(limit).lean(),
      Subscriber.countDocuments({ status: "active" }),
      Subscriber.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      count: subscribers.length,
      totalActive,
      totalAll,
      data: subscribers,
    });
  })
);

/**
 * POST /api/newsletter/unsubscribe
 * Allows an email to opt out of newsletter alerts.
 */
router.post(
  "/unsubscribe",
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      throw new AppError("Please provide a valid email address.", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const subscriber = await Subscriber.findOne({ email: normalizedEmail });

    if (!subscriber || subscriber.status === "unsubscribed") {
      return res.status(200).json({
        success: true,
        message: "You have been unsubscribed from tech drop alerts.",
      });
    }

    subscriber.status = "unsubscribed";
    await subscriber.save();

    return res.status(200).json({
      success: true,
      message: "You have been successfully unsubscribed from tech drop alerts.",
    });
  })
);

export default router;
