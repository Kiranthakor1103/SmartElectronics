import mongoose from "mongoose";
import dotenv from "dotenv";
import bcryptjs from "bcryptjs";
import { Product } from "./models/Product.js";
import { User } from "./models/User.js";
import { Category } from "./models/Category.js";
import { SEED_PRODUCTS } from "./seedData.js";

dotenv.config();

export const CATEGORIES = [
  {
    name: "Mobile & Tablets",
    slug: "mobile-tablets",
    icon: "Smartphone",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
    color: "from-blue-500 to-indigo-600",
    href: "/products?category=Mobile+%26+Tablets",
    active: true,
    subCategories: [
      { name: "Smartphones", slug: "smartphones" },
      { name: "Feature Phones", slug: "feature-phones" },
      { name: "Tablets", slug: "tablets" },
      { name: "iPads", slug: "ipads" },
      { name: "Mobile Accessories", slug: "mobile-accessories" },
      { name: "Mobile Cases", slug: "mobile-cases" },
      { name: "Screen Protectors", slug: "screen-protectors" },
    ],
  },
  {
    name: "Laptops & Computers",
    slug: "laptops-computers",
    icon: "Laptop",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80",
    color: "from-purple-500 to-indigo-600",
    href: "/products?category=Laptops+%26+Computers",
    active: true,
    subCategories: [
      { name: "Laptops", slug: "laptops" },
      { name: "Gaming Laptops", slug: "gaming-laptops" },
      { name: "Desktop PCs", slug: "desktop-pcs" },
      { name: "All-in-One PCs", slug: "all-in-one-pcs" },
      { name: "Monitors", slug: "monitors" },
      { name: "Mini PCs", slug: "mini-pcs" },
    ],
  },
  {
    name: "TVs & Entertainment",
    slug: "tvs-entertainment",
    icon: "Tv",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80",
    color: "from-red-500 to-pink-600",
    href: "/products?category=TVs+%26+Entertainment",
    active: true,
    subCategories: [
      { name: "Smart TVs", slug: "smart-tvs" },
      { name: "LED TVs", slug: "led-tvs" },
      { name: "LCD TVs", slug: "lcd-tvs" },
      { name: "OLED TVs", slug: "oled-tvs" },
      { name: "QLED TVs", slug: "qled-tvs" },
      { name: "Android TVs", slug: "android-tvs" },
      { name: "TV Accessories", slug: "tv-accessories" },
      { name: "TV Wall Mounts", slug: "tv-wall-mounts" },
      { name: "Set Top Boxes", slug: "set-top-boxes" },
    ],
  },
  {
    name: "Audio Devices",
    slug: "audio-devices",
    icon: "Headphones",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    color: "from-amber-500 to-orange-600",
    href: "/products?category=Audio+Devices",
    active: true,
    subCategories: [
      { name: "Wireless Earbuds", slug: "wireless-earbuds" },
      { name: "Neckbands", slug: "neckbands" },
      { name: "Headphones", slug: "headphones" },
      { name: "Bluetooth Speakers", slug: "bluetooth-speakers" },
      { name: "Soundbars", slug: "soundbars" },
      { name: "Home Theater Systems", slug: "home-theater-systems" },
      { name: "Microphones", slug: "microphones" },
    ],
  },
  {
    name: "Smart Devices",
    slug: "smart-devices",
    icon: "Watch",
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80",
    color: "from-emerald-500 to-teal-600",
    href: "/products?category=Smart+Devices",
    active: true,
    subCategories: [
      { name: "Smart Watches", slug: "smart-watches" },
      { name: "Smart Bands", slug: "smart-bands" },
      { name: "Smart Home Devices", slug: "smart-home-devices" },
      { name: "Smart Cameras", slug: "smart-cameras" },
      { name: "Smart Lights", slug: "smart-lights" },
    ],
  },
  {
    name: "Computer Accessories",
    slug: "computer-accessories",
    icon: "Cpu",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    color: "from-cyan-500 to-blue-600",
    href: "/products?category=Computer+Accessories",
    active: true,
    subCategories: [
      { name: "Keyboards", slug: "keyboards" },
      { name: "Mouse", slug: "mouse" },
      { name: "Webcams", slug: "webcams" },
      { name: "Printers", slug: "printers" },
      { name: "Scanners", slug: "scanners" },
      { name: "SSD", slug: "ssd" },
      { name: "HDD", slug: "hdd" },
      { name: "RAM", slug: "ram" },
      { name: "Graphics Cards", slug: "graphics-cards" },
      { name: "UPS", slug: "ups" },
    ],
  },
  {
    name: "Gaming Zone",
    slug: "gaming-zone",
    icon: "Gamepad2",
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80",
    color: "from-rose-500 to-red-600",
    href: "/products?category=Gaming+Zone",
    active: true,
    subCategories: [
      { name: "Gaming Consoles", slug: "gaming-consoles" },
      { name: "PlayStation", slug: "playstation" },
      { name: "Xbox", slug: "xbox" },
      { name: "Gaming Controllers", slug: "gaming-controllers" },
      { name: "Gaming Keyboards", slug: "gaming-keyboards" },
      { name: "Gaming Mouse", slug: "gaming-mouse" },
      { name: "Gaming Chairs", slug: "gaming-chairs" },
      { name: "VR Headsets", slug: "vr-headsets" },
    ],
  },
  {
    name: "Power & Charging",
    slug: "power-charging",
    icon: "Zap",
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&auto=format&fit=crop&q=80",
    color: "from-yellow-500 to-amber-600",
    href: "/products?category=Power+%26+Charging",
    active: true,
    subCategories: [
      { name: "Power Banks", slug: "power-banks" },
      { name: "Mobile Chargers", slug: "mobile-chargers" },
      { name: "Fast Chargers", slug: "fast-chargers" },
      { name: "USB Cables", slug: "usb-cables" },
      { name: "Extension Boards", slug: "extension-boards" },
      { name: "Inverters", slug: "inverters" },
      { name: "Batteries", slug: "batteries" },
    ],
  },
  {
    name: "Home Appliances",
    slug: "home-appliances",
    icon: "Wind",
    image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&auto=format&fit=crop&q=80",
    color: "from-teal-500 to-emerald-600",
    href: "/products?category=Home+Appliances",
    active: true,
    subCategories: [
      { name: "Refrigerators", slug: "refrigerators" },
      { name: "Washing Machines", slug: "washing-machines" },
      { name: "Microwave Ovens", slug: "microwave-ovens" },
      { name: "Water Purifiers", slug: "water-purifiers" },
      { name: "Dishwashers", slug: "dishwashers" },
      { name: "Vacuum Cleaners", slug: "vacuum-cleaners" },
      { name: "Geysers", slug: "geysers" },
      { name: "Air Coolers", slug: "air-coolers" },
      { name: "Air Conditioners", slug: "air-conditioners" },
      { name: "Room Heaters", slug: "room-heaters" },
      { name: "Electric Kettles", slug: "electric-kettles" },
      { name: "Induction Cooktops", slug: "induction-cooktops" },
      { name: "Mixer Grinders", slug: "mixer-grinders" },
    ],
  },
  {
    name: "Kitchen Appliances",
    slug: "kitchen-appliances",
    icon: "Coffee",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80",
    color: "from-orange-500 to-amber-600",
    href: "/products?category=Kitchen+Appliances",
    active: true,
    subCategories: [
      { name: "Juicers", slug: "juicers" },
      { name: "Mixer Grinder", slug: "mixer-grinder" },
      { name: "Pop-up Toasters", slug: "pop-up-toasters" },
      { name: "Coffee Machines", slug: "coffee-machines" },
      { name: "Rice Cookers", slug: "rice-cookers" },
      { name: "Air Fryers", slug: "air-fryers" },
    ],
  },
  {
    name: "Cameras & Security",
    slug: "cameras-security",
    icon: "Camera",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80",
    color: "from-slate-600 to-zinc-800",
    href: "/products?category=Cameras+%26+Security",
    active: true,
    subCategories: [
      { name: "DSLR Cameras", slug: "dslr-cameras" },
      { name: "Mirrorless Cameras", slug: "mirrorless-cameras" },
      { name: "Action Cameras", slug: "action-cameras" },
      { name: "CCTV Cameras", slug: "cctv-cameras" },
      { name: "Security Systems", slug: "security-systems" },
      { name: "Video Doorbells", slug: "video-doorbells" },
    ],
  },
];

const MAPPED_PRODUCTS = SEED_PRODUCTS.map((p) => ({
  id: p.id,
  sku: p.sku || `SE-PROD-${p.id}`,
  title: p.title || p.name,
  name: p.name || p.title,
  price: p.price,
  originalPrice: p.price,
  discountPrice: p.discountPrice || p.salePrice || p.price,
  salePrice: p.salePrice || p.discountPrice || p.price,
  description: p.description,
  brand: p.brand,
  category: p.category,
  subCategory: p.subCategory || "",
  thumbnail: p.thumbnail,
  image: p.image || p.thumbnail,
  images: p.images && p.images.length > 0 ? p.images : [p.thumbnail],
  discountPercentage: p.discountPercentage,
  rating: p.rating || 4.5,
  stock: p.stock || 25,
  warranty: p.warranty || "1 Year Brand Warranty",
  specifications: p.specifications || {},
  badge: p.badge || "",
  featured: p.featured || false,
  trending: p.trending !== undefined ? p.trending : true,
  active: p.active !== false,
  status: "approved",
}));

async function seed() {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/smartelectronic";
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB:", uri);

    // Seed Categories
    const existingCategories = await Category.countDocuments();
    if (existingCategories > 0) {
      console.log(`ℹ️  Clearing ${existingCategories} existing categories...`);
      await Category.deleteMany({});
    }
    await Category.insertMany(CATEGORIES);
    console.log(`✅ Seeded ${CATEGORIES.length} electronics categories successfully!`);

    // Seed Products
    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      console.log(`ℹ️  Clearing ${existingProducts} existing products...`);
      await Product.deleteMany({});
    }

    await Product.insertMany(MAPPED_PRODUCTS);
    console.log(`✅ Seeded ${MAPPED_PRODUCTS.length} electronics products successfully!`);

    // Seed Users
    const USERS = [
      {
        name: "SmartElectronic Admin",
        email: "admin@smartelectronic.com",
        password: await bcryptjs.hash("admin123", 10),
        role: "admin",
        isVerified: true,
      },
      {
        name: "Demo Customer",
        email: "customer@smartelectronic.com",
        password: await bcryptjs.hash("customer123", 10),
        role: "user",
        isVerified: true,
      },
      {
        name: "Admin Legacy",
        email: "admin@ktstore.com",
        password: await bcryptjs.hash("admin123", 10),
        role: "admin",
        isVerified: true,
      },
    ];

    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log(`ℹ️  Clearing ${existingUsers} existing users...`);
      await User.deleteMany({});
    }

    await User.insertMany(USERS);
    console.log(`✅ Seeded ${USERS.length} users successfully!`);

    console.log("\n📊 SmartElectronic Database Summary:");
    console.log(`   - Categories: ${await Category.countDocuments()}`);
    console.log(`   - Products: ${await Product.countDocuments()}`);
    console.log(`   - Users: ${await User.countDocuments()}`);
    console.log(`   - Database URI: ${uri}`);
  } catch (err) {
    console.error("❌ Seed error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

seed();
