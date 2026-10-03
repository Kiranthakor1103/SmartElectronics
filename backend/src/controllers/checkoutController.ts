import { Response } from "express";
import { checkoutService } from "../services/checkoutService";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../middleware/auth";

export const createCheckout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // Dynamically extract client origin (e.g., http://10.0.4.242:3000 or http://localhost:3000)
  let origin = req.headers.origin;
  if (!origin && req.headers.referer) {
    try {
      origin = new URL(req.headers.referer).origin;
    } catch {}
  }
  
  const clientUrl = req.body.clientUrl || origin || process.env.CLIENT_URL || "http://localhost:3000";

  const result = await checkoutService.createCheckoutSession({
    items: req.body.items,
    discount: req.body.discount,
    shipping: req.body.shipping,
    couponCode: req.body.couponCode,
    userId: req.user?.id,
    clientUrl,
    shippingAddress: req.body.shippingAddress,
    customerEmail: req.body.customerEmail,
    customerPhone: req.body.customerPhone,
  });


  return ApiResponse.success(res, "Checkout session created successfully", result);
});
