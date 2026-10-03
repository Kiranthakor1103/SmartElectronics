import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import { Order } from "../models/Order";
import { SubOrder } from "../models/SubOrder";
import { Product } from "../models/Product";
import { decrementProductStock } from "../utils/stockManager";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Prefer the raw body buffer captured by verify callback in server.ts
  const payload = (req as any).rawBody || req.body;
  const signature = req.headers["stripe-signature"] as string;

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook error";
    console.error("Webhook signature verification failed:", message);
    return res.status(400).json({
      success: false,
      message: `Webhook Error: ${message}`,
    });
  }

  try {
    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      const order = await Order.findOneAndUpdate(
        { stripeSessionId: session.id },
        { status: "paid" },
        { new: true }
      );

      if (order && order.items && order.items.length > 0) {
        // Retrieve shipping details from Stripe
        const stripeSessionDetails = (await stripe.checkout.sessions.retrieve(session.id)) as any;
        const stripeAddress =
          stripeSessionDetails.shipping_details?.address ||
          stripeSessionDetails.customer_details?.address;

        const shippingAddress = stripeAddress
          ? {
              line1: stripeAddress.line1 || "",
              city: stripeAddress.city || "",
              state: stripeAddress.state || "",
              postal_code: stripeAddress.postal_code || "",
              country: stripeAddress.country || "",
            }
          : undefined;

        // Group order items by sellerId
        const sellerGroups: Record<string, any[]> = {};
        for (const item of order.items) {
          if (item.sellerId) {
            const sId = item.sellerId.toString();
            if (!sellerGroups[sId]) {
              sellerGroups[sId] = [];
            }
            sellerGroups[sId].push({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            });
          }
        }

        // Automatically decrease inventory stock level in real time
        await decrementProductStock(order.items);

        // Create sub-orders for each seller
        for (const [sellerId, items] of Object.entries(sellerGroups)) {
          const subTotal = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
          const commissionPaid = Math.round(subTotal * 0.1); // 10% Platform fee
          const netPayout = subTotal - commissionPaid;

          await SubOrder.create({
            orderId: order._id,
            sellerId,
            items,
            subTotal,
            commissionPaid,
            netPayout,
            deliveryStatus: "pending",
            payoutStatus: "pending",
            shippingAddress,
          });
        }
      }

      console.log(`Order paid and split into sub-orders: ${session.id}`);
    }

    // Handle charge.failed
    if (event.type === "charge.failed") {
      const charge = event.data.object as any;
      const session = charge.payment_intent;

      if (session) {
        await Order.findOneAndUpdate(
          { stripeSessionId: session as string },
          { status: "failed" },
          { new: true }
        );

        console.log(`Order failed: ${session}`);
      }
    }

    // Handle charge.refunded
    if (event.type === "charge.refunded") {
      const charge = event.data.object as any;
      const session = charge.payment_intent;

      if (session) {
        await Order.findOneAndUpdate(
          { stripeSessionId: session as string },
          { status: "refunded" },
          { new: true }
        );

        // Update any sub-orders associated with this transaction
        const orderDoc = await Order.findOne({ stripeSessionId: session as string });
        if (orderDoc) {
          await SubOrder.updateMany(
            { orderId: orderDoc._id },
            { $set: { payoutStatus: "refunded", deliveryStatus: "cancelled" } }
          );
        }

        console.log(`Order refunded: ${session}`);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook processing error";
    console.error("Webhook processing error:", message);
    next(error);
  }
};
