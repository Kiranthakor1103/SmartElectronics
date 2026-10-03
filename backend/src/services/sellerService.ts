import { sellerRepository } from "../repositories/sellerRepository";
import { userRepository } from "../repositories/userRepository";
import { productRepository } from "../repositories/productRepository";
import { AppError } from "../utils/appError";

export class SellerService {
  async registerSeller(userId: string, sellerData: { companyName: string; gstNumber: string; panNumber: string; bankAccount: string; bankIfsc: string }) {
    const existingSeller = await sellerRepository.findByUserId(userId);
    if (existingSeller) {
      throw new AppError("Seller onboarding already submitted for this user", 400);
    }

    const existingGstPan = await sellerRepository.findByGstOrPan(sellerData.gstNumber, sellerData.panNumber);
    if (existingGstPan) {
      throw new AppError("GST or PAN number is already registered", 400);
    }

    const seller = await sellerRepository.create({
      userId: userId as any,
      companyName: sellerData.companyName,
      gstNumber: sellerData.gstNumber.toUpperCase().trim(),
      panNumber: sellerData.panNumber.toUpperCase().trim(),
      bankAccount: sellerData.bankAccount.trim(),
      bankIfsc: sellerData.bankIfsc.toUpperCase().trim(),
      kycStatus: "pending",
      commissionRate: 10.0,
      active: true,
    });

    await userRepository.updateRole(userId, "seller");
    return seller;
  }

  async getSellerProfile(userId: string) {
    const seller = await sellerRepository.findByUserId(userId);
    if (!seller) {
      throw new AppError("Seller profile not found", 404);
    }
    return seller;
  }

  async getSellerDashboardMetrics(userId: string) {
    const seller = await sellerRepository.findByUserId(userId);
    if (!seller) {
      throw new AppError("Seller profile not found", 404);
    }

    const sellerId = seller._id.toString();
    const productsResult = await productRepository.queryProducts({ sellerId });
    const subOrders = await sellerRepository.findPayoutsBySellerId(sellerId); // payouts or suborders

    return {
      seller,
      totalProducts: productsResult.total,
      products: productsResult.products,
      payouts: subOrders,
    };
  }

  async requestPayout(userId: string, amount: number) {
    const seller = await sellerRepository.findByUserId(userId);
    if (!seller) {
      throw new AppError("Seller profile not found", 404);
    }

    if (!amount || amount <= 0) {
      throw new AppError("Invalid payout amount", 400);
    }

    return sellerRepository.createPayout({
      sellerId: seller._id,
      amount,
      status: "requested",
      requestedAt: new Date(),
    });
  }
}

export const sellerService = new SellerService();
