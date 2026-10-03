import mongoose from "mongoose";
import dotenv from "dotenv";
import { Product } from "./models/Product";

dotenv.config();

const imagePool: Record<string, string[]> = {
  electronics: [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80", // Phone
    "https://images.unsplash.com/photo-1496181130204-7552cc14ac49?w=500&auto=format&fit=crop&q=80", // Laptop
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80", // Headphones
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80", // Smartwatch
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=80", // Camera
    "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&auto=format&fit=crop&q=80", // TV
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=80", // Apple Watch
    "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop&q=80", // PS5
  ],
  fashion: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80", // Red Nike shoes
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80", // Tee
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&auto=format&fit=crop&q=80", // Sunglasses
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80", // Backpack
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=80", // Leather Jacket
    "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&auto=format&fit=crop&q=80", // Watch
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&auto=format&fit=crop&q=80", // Women shoes
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&auto=format&fit=crop&q=80", // Fashion outfit
  ],
  home: [
    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=80", // Lamp
    "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&auto=format&fit=crop&q=80", // Chair
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=80", // Sofa
    "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&auto=format&fit=crop&q=80", // Houseplant
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80", // Mug
    "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=500&auto=format&fit=crop&q=80", // Blender
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500&auto=format&fit=crop&q=80", // Table decoration
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=500&auto=format&fit=crop&q=80", // Bed set
  ],
  sports: [
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=80", // Football
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80", // Dumbbells
    "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&auto=format&fit=crop&q=80", // Bicycle
    "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=500&auto=format&fit=crop&q=80", // Jogging shoes
    "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=80", // Water bottle
    "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=500&auto=format&fit=crop&q=80", // Yoga Mat
    "https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=500&auto=format&fit=crop&q=80", // Running tracker/band
  ],
  groceries: [
    "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=500&auto=format&fit=crop&q=80", // Apple
    "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=80", // Milk
    "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80", // Honey jar
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80", // Fresh bread
    "https://images.unsplash.com/photo-1548907040-4d42b52125b0?w=500&auto=format&fit=crop&q=80", // Chocolates
    "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=500&auto=format&fit=crop&q=80", // Vegetables
  ]
};

const generalPool = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80"
];

async function run() {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ktstore";
    await mongoose.connect(uri);
    console.log("Connected to database for image migration...");

    const products = await Product.find({});
    console.log(`Found ${products.length} products. Updating images...`);

    const bulkOps = [];

    for (const prod of products) {
      const categoryLower = (prod.category || "").toLowerCase();
      let pool = generalPool;

      if (categoryLower.includes("electr") || categoryLower.includes("mobile") || categoryLower.includes("tv")) {
        pool = imagePool.electronics;
      } else if (categoryLower.includes("fash") || categoryLower.includes("cloth") || categoryLower.includes("apparel") || categoryLower.includes("shoe")) {
        pool = imagePool.fashion;
      } else if (categoryLower.includes("home") || categoryLower.includes("kitchen") || categoryLower.includes("furnit")) {
        pool = imagePool.home;
      } else if (categoryLower.includes("sport") || categoryLower.includes("fitness") || categoryLower.includes("gym") || categoryLower.includes("outdoor")) {
        pool = imagePool.sports;
      } else if (categoryLower.includes("groc") || categoryLower.includes("food") || categoryLower.includes("drink") || categoryLower.includes("veg")) {
        pool = imagePool.groceries;
      }

      // Pick an image dynamically based on product id
      const selectedImg = pool[prod.id % pool.length];

      bulkOps.push({
        updateOne: {
          filter: { _id: prod._id },
          update: {
            $set: {
              image: selectedImg,
              thumbnail: selectedImg
            }
          }
        }
      });
    }

    if (bulkOps.length > 0) {
      const result = await Product.bulkWrite(bulkOps);
      console.log(`Successfully updated ${result.modifiedCount} product images in database!`);
    } else {
      console.log("No products to update.");
    }

    await mongoose.disconnect();
    console.log("Finished successfully and disconnected from DB.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

run();
