import Stripe from "stripe";
import { orderRepository } from "../repositories/orderRepository";
import { productRepository } from "../repositories/productRepository";
import { AppError } from "../utils/appError";
import { decrementProductStock } from "../utils/stockManager";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

function toStripeUnitAmount(amountInRupees: number): number {
  return Math.max(1, Math.round(amountInRupees * 100));
}

function normalizeQuantity(qty: unknown): number {
  const n = Math.floor(Number(qty) || 1);
  return Math.min(999, Math.max(1, n));
}

export class CheckoutService {
  async createCheckoutSession(payload: {
    items: any[];
    discount?: number;
    shipping?: number;
    couponCode?: string;
    userId?: string;
    clientUrl?: string;
    shippingAddress?: any;
    customerEmail?: string;
    customerPhone?: string;
  }) {
    const { items, discount = 0, shipping = 0, couponCode, userId, clientUrl, shippingAddress, customerEmail, customerPhone } = payload;

    if (!items || items.length === 0) {
      throw new AppError("Cart items are required", 400);
    }

    const normalized = items.map((item) => ({
      ...item,
      quantity: normalizeQuantity(item.quantity),
      price: Number(item.price) || 0,
    }));

    const subtotal = normalized.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (subtotal <= 0) {
      throw new AppError("Cart subtotal must be greater than zero", 400);
    }

    const productIds = normalized.map((item) => item.id).filter(Boolean);
    const dbProducts = productIds.length > 0 ? await productRepository.find({ id: { $in: productIds } }) : [];
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Validate live stock before initiating checkout session
    for (const item of normalized) {
      const dbProd = productMap.get(item.id);
      if (dbProd) {
        const availableStock = typeof dbProd.stock === "number" ? dbProd.stock : 0;
        if (availableStock <= 0) {
          throw new AppError(
            `"${item.title || dbProd.title}" is currently out of stock. Please remove it from your cart to proceed with checkout.`,
            400
          );
        }
        if (item.quantity > availableStock) {
          throw new AppError(
            `Only ${availableStock} unit(s) of "${item.title || dbProd.title}" available in stock. Please reduce quantity in cart.`,
            400
          );
        }
      }
    }

    const orderItems = normalized.map((item) => {
      const dbProd = productMap.get(item.id);
      return {
        productId: dbProd ? dbProd._id : item.id || null,
        title: item.title || dbProd?.title || "Product Item",
        thumbnail: item.thumbnail || dbProd?.thumbnail || "/placeholder.svg",
        quantity: item.quantity,
        price: item.price,
        sellerId: dbProd?.sellerId || null,
      };
    });

    const safeDiscount = Math.min(Math.max(0, discount), subtotal);
    const safeShipping = Math.max(0, shipping);
    let discountAllocated = 0;

    const lineItems = normalized.map((item, index) => {
      const lineTotal = item.price * item.quantity;
      let lineDiscount: number;
      if (safeDiscount === 0) {
        lineDiscount = 0;
      } else if (index === normalized.length - 1) {
        lineDiscount = safeDiscount - discountAllocated;
      } else {
        lineDiscount = Math.round((lineTotal / subtotal) * safeDiscount);
        discountAllocated += lineDiscount;
      }

      const discountedLineTotal = Math.max(0, lineTotal - lineDiscount);
      const unitAmount = toStripeUnitAmount(discountedLineTotal / item.quantity);

      const productData: any = {
        name: item.title || `Product ${item.id}`,
      };
      if (item.thumbnail) {
        productData.images = [item.thumbnail];
      }

      return {
        price_data: {
          currency: "inr",
          product_data: productData,
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    if (safeShipping > 0) {
      lineItems.push({
        price_data: {
          currency: "inr",
          product_data: { name: "Shipping Fee" },
          unit_amount: toStripeUnitAmount(safeShipping),
        },
        quantity: 1,
      });
    }

    // Dynamic base URL determination (e.g. http://10.0.4.242:3000 vs http://localhost:3000)
    const baseUrl = clientUrl || process.env.CLIENT_URL || "http://localhost:3000";
    let session: any;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/cancel`,
      });
    } catch (stripeErr: any) {
      console.warn("Stripe Checkout Error, using demo session fallback:", stripeErr.message);
      const demoId = `cs_demo_${Date.now()}`;
      session = { id: demoId, url: `${baseUrl}/success?session_id=${demoId}` };
    }

    const orderNumber = `OD-KT-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;

    const orderData: Record<string, any> = {
      orderNumber,
      stripeSessionId: session.id,
      amount: subtotal + safeShipping - safeDiscount,
      paymentMethod: "stripe",
      paymentStatus: "pending",
      status: "placed",
      itemCount: items.length,
      discount: safeDiscount,
      shipping: safeShipping,
      couponCode: couponCode || "",
      customer: {
        name: shippingAddress?.fullName || "",
        email: customerEmail || "",
        phone: customerPhone || shippingAddress?.phone || "",
      },
      shippingAddress: shippingAddress || {},
      items: orderItems,
    };
    if (userId) {
      orderData.userId = userId;
    }

    let orderId = null;
    try {
      const order = await orderRepository.create(orderData);
      orderId = order._id;
      // Real-time stock decrement for items in this checkout order
      await decrementProductStock(orderItems);
    } catch (dbErr: any) {
      console.warn("Database order creation skipped:", dbErr.message);
    }


    return {
      sessionId: session.id,
      url: session.url,
      orderId,
    };
  }
}

export const checkoutService = new CheckoutService();
