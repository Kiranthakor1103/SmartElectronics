import { Seller, ISeller } from "../models/Seller";
import { Payout } from "../models/Payout";
import { BaseRepository } from "./baseRepository";

export class SellerRepository extends BaseRepository<ISeller> {
  constructor() {
    super(Seller);
  }

  async findByUserId(userId: string): Promise<ISeller | null> {
    return Seller.findOne({ userId }).exec();
  }

  async findByGstOrPan(gstNumber: string, panNumber: string): Promise<ISeller | null> {
    return Seller.findOne({
      $or: [
        { gstNumber: gstNumber.toUpperCase().trim() },
        { panNumber: panNumber.toUpperCase().trim() },
      ],
    }).exec();
  }

  async updateKycStatus(sellerId: string, kycStatus: "pending" | "approved" | "rejected"): Promise<ISeller | null> {
    return Seller.findByIdAndUpdate(sellerId, { kycStatus }, { new: true }).exec();
  }

  async findAllSellers(filter = {}): Promise<ISeller[]> {
    return Seller.find(filter).populate("userId", "name email role").sort({ createdAt: -1 }).exec();
  }

  async createPayout(payoutData: any): Promise<any> {
    return Payout.create(payoutData);
  }

  async findPayoutsBySellerId(sellerId: string): Promise<any[]> {
    return Payout.find({ sellerId }).sort({ createdAt: -1 }).exec();
  }
}

export const sellerRepository = new SellerRepository();
