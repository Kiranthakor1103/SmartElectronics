import mongoose from "mongoose";
import { Coupon } from "../models/Coupon";

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ktstore");
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed default coupons if the database is empty
    const count = await Coupon.countDocuments();
    if (count === 0) {
      await Coupon.create([
        {
          code: "SAVE10",
          label: "10% off your order",
          type: "percent",
          value: 10,
          minOrder: 500,
          active: true,
        },
        {
          code: "WELCOME20",
          label: "20% off — welcome offer",
          type: "percent",
          value: 20,
          minOrder: 1500,
          active: true,
        },
        {
          code: "FLAT100",
          label: "₹100 off",
          type: "flat",
          value: 100,
          minOrder: 799,
          active: true,
        },
      ]);
      console.log("Default coupons seeded successfully!");
    }
  } catch (error) {
    console.error(`MongoDB connection error: ${error}`);
    process.exit(1);
  }
};
