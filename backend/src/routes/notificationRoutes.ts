import { Router, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { NotificationTemplate } from "../models/NotificationTemplate";
import { Notification } from "../models/Notification";
import { User } from "../models/User";
import { Subscriber } from "../models/Subscriber";
import { sendBroadcastNotificationEmail } from "../utils/mailer";

const router = Router();

// In-memory active SSE clients for real-time live push updates
const sseClients = new Set<Response>();

function broadcastLiveToClients(event: string, payload: unknown) {
  const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch {
      sseClients.delete(client);
    }
  }
}

const DEFAULT_TEMPLATES = [
  {
    name: "VIP Tech Drop Alert",
    code: "TECH_DROP_ALERT",
    category: "marketing",
    channel: "in_app",
    title: "⚡ VIP Tech Drop Alert: Next-Gen Flagships Now Live!",
    message: "Exclusive access is now open. Shop our limited stock of 4K OLED Smart TVs and gaming rigs before public launch.",
    actionLabel: "Explore Drop",
    actionUrl: "/products?deal=flash",
    badge: "LIMITED DROP",
    themeColor: "cyan",
    icon: "Zap",
    active: true,
    isDefault: true,
    sentCount: 1420,
  },
  {
    name: "Order Dispatched & Tracking",
    code: "ORDER_DISPATCHED",
    category: "orders",
    channel: "in_app",
    title: "📦 Your Tech Order Is Dispatched & Insured!",
    message: "Great news! Your SmartElectronics order has left our fulfillment hub with 100% brand warranty and express delivery.",
    actionLabel: "Track Package",
    actionUrl: "/orders",
    badge: "EXPRESS LOGISTICS",
    themeColor: "blue",
    icon: "Package",
    active: true,
    isDefault: true,
    sentCount: 890,
  },
  {
    name: "Exclusive VIP Promo Voucher",
    code: "VIP_PROMO_VOUCHER",
    category: "marketing",
    channel: "in_app",
    title: "🏷️ Secret Voucher: Flat ₹1,000 Off Orders Above ₹5,000",
    message: "Use voucher code MEGAOFF at checkout to receive an instant ₹1,000 discount on your tech cart.",
    actionLabel: "Apply Code",
    actionUrl: "/products",
    badge: "VIP VOUCHER",
    themeColor: "emerald",
    icon: "Ticket",
    active: true,
    isDefault: true,
    sentCount: 2310,
  },
  {
    name: "Hardware Restock Alert",
    code: "HARDWARE_RESTOCK",
    category: "inventory",
    channel: "in_app",
    title: "🔔 High-Demand Hardware Back In Stock!",
    message: "The Sony Bravia OLED 65-inch and RTX 4080 Gaming Rigs are officially replenished. Order while stock lasts.",
    actionLabel: "View Hardware",
    actionUrl: "/products?category=Gaming+Zone",
    badge: "RESTOCKED",
    themeColor: "amber",
    icon: "Boxes",
    active: true,
    isDefault: true,
    sentCount: 650,
  },
  {
    name: "Security & Role Shield Active",
    code: "SECURITY_SHIELD",
    category: "security",
    channel: "in_app",
    title: "🛡️ SmartElectronics Security Guard & 256-Bit SSL",
    message: "Your sessions are protected with end-to-end encryption, multi-tenant role guard, and genuine brand warranty guarantee.",
    actionLabel: "Security Center",
    actionUrl: "/warranty",
    badge: "SECURITY SHIELD",
    themeColor: "indigo",
    icon: "ShieldCheck",
    active: true,
    isDefault: true,
    sentCount: 4500,
  },
];

const DEFAULT_NOTIFICATIONS = [
  {
    recipient: "all",
    role: "customer",
    templateCode: "TECH_DROP_ALERT",
    category: "marketing",
    title: "⚡ VIP Tech Drop Alert: Next-Gen Flagships Now Live!",
    message: "Exclusive access is now open. Shop our limited stock of 4K OLED Smart TVs and gaming rigs before public launch.",
    actionLabel: "Explore Drop",
    actionUrl: "/products?deal=flash",
    badge: "HOT DROP",
    themeColor: "cyan",
    icon: "Zap",
    read: false,
  },
  {
    recipient: "all",
    role: "customer",
    templateCode: "VIP_PROMO_VOUCHER",
    category: "marketing",
    title: "🏷️ Secret Voucher: Flat ₹1,000 Off Orders Above ₹5,000",
    message: "Use voucher code MEGAOFF at checkout to receive an instant ₹1,000 discount on your tech cart.",
    actionLabel: "Apply Code",
    actionUrl: "/products",
    badge: "PROMO CODE",
    themeColor: "emerald",
    icon: "Ticket",
    read: false,
  },
  {
    recipient: "all",
    role: "admin",
    templateCode: "ADMIN_ALERT_NEW_ORDER",
    category: "orders",
    title: "📦 New Customer Order #SE-9842 Placed",
    message: "Customer Demo Customer placed an order for Sony Bravia XR 65-inch OLED TV (₹2,19,990).",
    actionLabel: "View Order",
    actionUrl: "/orders",
    badge: "NEW ORDER",
    themeColor: "blue",
    icon: "ShoppingBag",
    read: false,
  },
  {
    recipient: "all",
    role: "admin",
    templateCode: "ADMIN_ALERT_LOW_STOCK",
    category: "inventory",
    title: "⚠️ Low Stock Alert: RTX 4080 Gaming Rigs",
    message: "Current inventory level is below threshold (2 units remaining). Restock suggested.",
    actionLabel: "Check Stock",
    actionUrl: "/inventory",
    badge: "LOW STOCK",
    themeColor: "amber",
    icon: "AlertCircle",
    read: false,
  },
  {
    recipient: "all",
    role: "admin",
    templateCode: "ADMIN_ALERT_SUBSCRIBER",
    category: "marketing",
    title: "⚡ New VIP Newsletter Subscriber Joined",
    message: "A new user subscribed to exclusive tech drop alerts from the storefront footer.",
    actionLabel: "View Subscribers",
    actionUrl: "/notifications",
    badge: "SUBSCRIBER",
    themeColor: "cyan",
    icon: "Zap",
    read: false,
  },
];

/**
 * Ensures baseline templates and notifications exist
 */
async function ensureSeedData() {
  const count = await NotificationTemplate.countDocuments();
  if (count === 0) {
    await NotificationTemplate.insertMany(DEFAULT_TEMPLATES);
  }
  const notifCount = await Notification.countDocuments();
  if (notifCount === 0) {
    await Notification.insertMany(DEFAULT_NOTIFICATIONS);
  }
}

/**
 * GET /api/notifications/templates
 * Fetches all notification templates
 */
router.get(
  "/templates",
  asyncHandler(async (_req: Request, res: Response) => {
    await ensureSeedData();
    const templates = await NotificationTemplate.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: templates.length,
      data: templates,
    });
  })
);

/**
 * POST /api/notifications/templates
 * Creates a new notification template
 */
router.post(
  "/templates",
  asyncHandler(async (req: Request, res: Response) => {
    const {
      name,
      code,
      category = "marketing",
      channel = "in_app",
      title,
      message,
      actionLabel = "View Details",
      actionUrl = "/products",
      badge = "ALERT",
      themeColor = "blue",
      icon = "Zap",
      active = true,
    } = req.body;

    if (!name || !title || !message) {
      throw new AppError("Name, title, and message are required fields.", 400);
    }

    const generatedCode = (code || name.replace(/[^a-zA-Z0-9]/g, "_")).toUpperCase();

    // Check if code exists
    const existing = await NotificationTemplate.findOne({ code: generatedCode });
    if (existing) {
      throw new AppError(`Template with code '${generatedCode}' already exists.`, 400);
    }

    const newTemplate = await NotificationTemplate.create({
      name: name.trim(),
      code: generatedCode,
      category,
      channel,
      title: title.trim(),
      message: message.trim(),
      actionLabel: actionLabel?.trim() || "View Details",
      actionUrl: actionUrl?.trim() || "/products",
      badge: badge?.trim() || "ALERT",
      themeColor,
      icon: icon || "Zap",
      active: Boolean(active),
      isDefault: false,
    });

    return res.status(201).json({
      success: true,
      message: "Notification template created successfully!",
      data: newTemplate,
    });
  })
);

/**
 * PUT /api/notifications/templates/:id
 * Updates an existing template
 */
router.put(
  "/templates/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    const template = await NotificationTemplate.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!template) {
      throw new AppError("Notification template not found.", 404);
    }

    return res.status(200).json({
      success: true,
      message: "Notification template updated successfully!",
      data: template,
    });
  })
);

/**
 * DELETE /api/notifications/templates/:id
 * Deletes a template
 */
router.delete(
  "/templates/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const template = await NotificationTemplate.findById(id);

    if (!template) {
      throw new AppError("Notification template not found.", 404);
    }

    if (template.isDefault) {
      throw new AppError("System default templates cannot be deleted.", 400);
    }

    await template.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Notification template deleted successfully.",
    });
  })
);

/**
 * POST /api/notifications/broadcast
 * Broadcasts a live notification to customers or admins across specific channels
 */
router.post(
  "/broadcast",
  asyncHandler(async (req: Request, res: Response) => {
    const {
      templateId,
      templateCode,
      targetRole = "customer",
      customTitle,
      customMessage,
      actionUrl,
      actionLabel,
      channel: requestedChannel,
    } = req.body;

    let template = null;
    if (templateId) {
      template = await NotificationTemplate.findById(templateId);
    } else if (templateCode) {
      template = await NotificationTemplate.findOne({ code: templateCode });
    }

    const channel = requestedChannel || template?.channel || "in_app";
    const title = customTitle || template?.title || "⚡ SmartElectronics Alert";
    const message = customMessage || template?.message || "Check out the latest tech updates on SmartElectronics.";
    const category = template?.category || "marketing";
    const badge = template?.badge || (channel === "email" ? "VIP EMAIL" : "ANNOUNCEMENT");
    const themeColor = template?.themeColor || "blue";
    const icon = template?.icon || (channel === "email" ? "Mail" : "Zap");
    const url = actionUrl || template?.actionUrl || "/products";
    const label = actionLabel || template?.actionLabel || "View Details";

    let emailDispatchResult: { success: boolean; sentCount: number } | null = null;

    // If channel is email, perform real email delivery
    if (channel === "email") {
      let emailRecipients: string[] = [];
      const adminEmail = process.env.ADMIN_SUPPORT_EMAIL || "supportsmatel23@yopmail.com";

      if (targetRole === "admin") {
        emailRecipients = [adminEmail];
      } else {
        const userEmails = await User.find({ role: "user" }).distinct("email");
        const subscriberEmails = await Subscriber.find({ status: "active" }).distinct("email");
        const uniqueSet = new Set<string>([...userEmails, ...subscriberEmails, adminEmail].filter(Boolean));
        emailRecipients = Array.from(uniqueSet);
      }

      emailDispatchResult = await sendBroadcastNotificationEmail({
        recipients: emailRecipients,
        title,
        message,
        badge,
        themeColor,
        actionLabel: label,
        actionUrl: url,
      });
    }

    // Persist notification record with channel and delivery status
    const notification = await Notification.create({
      recipient: "all",
      role: targetRole,
      channel,
      status: "delivered",
      templateCode: template?.code || `CUSTOM_${channel.toUpperCase()}`,
      category,
      title,
      message,
      actionLabel: label,
      actionUrl: url,
      badge,
      themeColor,
      icon,
      read: false,
    });

    if (template) {
      template.sentCount = (template.sentCount || 0) + 1;
      template.lastSentAt = new Date();
      await template.save();
    }

    // Push live real-time SSE event to all active browsers immediately
    broadcastLiveToClients("NOTIFICATION_BROADCAST", {
      ...notification.toObject(),
      read: false,
      isRead: false,
    });

    return res.status(201).json({
      success: true,
      message: `Notification broadcasted live via ${channel.toUpperCase()} to ${targetRole}s!`,
      data: notification,
      channel,
      emailSentCount: emailDispatchResult?.sentCount ?? 0,
    });
  })
);

/**
 * GET /api/notifications/stream
 * Server-Sent Events (SSE) stream for instant live notification updates
 */
router.get("/stream", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  // Send initial handshake
  res.write(`data: ${JSON.stringify({ type: "INIT", message: "Live Notification Stream Connected" })}\n\n`);

  sseClients.add(res);

  // Send periodic keep-alive heartbeat every 20 seconds
  const heartbeat = setInterval(() => {
    try {
      res.write(": keep-alive\n\n");
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 20000);

  req.on("close", () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

/**
 * GET /api/notifications/list
 * Retrieves notifications for a given role (admin or customer) and optional channel
 */
router.get(
  "/list",
  asyncHandler(async (req: Request, res: Response) => {
    await ensureSeedData();
    const role = (req.query.role as string) || "customer";
    const channel = req.query.channel as string;

    const query: Record<string, unknown> = {};
    if (role === "admin") {
      query.role = { $in: ["admin", "all"] };
    } else {
      query.role = { $in: ["customer", "all"] };
    }

    if (channel) {
      query.channel = channel;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const mapped = notifications.map((n) => {
      const obj = n.toObject();
      return {
        ...obj,
        channel: obj.channel || "in_app",
        read: Boolean(obj.read),
        isRead: Boolean(obj.read),
      };
    });

    return res.status(200).json({
      success: true,
      count: mapped.length,
      unreadCount,
      data: mapped,
    });
  })
);

/**
 * PATCH /api/notifications/:id/read
 * Marks a single notification as read
 */
router.patch(
  "/:id/read",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      throw new AppError("Notification not found.", 404);
    }

    return res.status(200).json({
      success: true,
      data: notification,
    });
  })
);

/**
 * PATCH /api/notifications/read-all
 * Marks all notifications as read for a given role
 */
router.patch(
  "/read-all",
  asyncHandler(async (req: Request, res: Response) => {
    const role = (req.body.role as string) || "customer";

    const query: Record<string, unknown> = {};
    if (role === "admin") {
      query.role = { $in: ["admin", "all"] };
    } else {
      query.role = { $in: ["customer", "all"] };
    }

    await Notification.updateMany(query, { read: true });

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  })
);

export default router;
