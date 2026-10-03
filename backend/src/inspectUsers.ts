import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/User";
import { Seller } from "./models/Seller";

dotenv.config();

async function inspect() {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ktstore";
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    const users = await User.find({}, { password: 0 });
    console.log("👥 Users in Database:");
    console.log(JSON.stringify(users, null, 2));

    const sellers = await Seller.find({});
    console.log("💼 Sellers in Database:");
    console.log(JSON.stringify(sellers, null, 2));
  } catch (err) {
    console.error("❌ Error inspecting:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

inspect();
