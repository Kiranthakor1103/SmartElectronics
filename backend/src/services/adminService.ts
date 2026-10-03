import { userRepository } from "../repositories/userRepository";
import { sellerRepository } from "../repositories/sellerRepository";
import { productRepository } from "../repositories/productRepository";
import { orderRepository } from "../repositories/orderRepository";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { Order } from "../models/Order";
import { Seller } from "../models/Seller";
import { Category } from "../models/Category";
import { AppError } from "../utils/appError";
import { invalidateCache } from "../middleware/cacheMiddleware";
import PDFDocument from "pdfkit";

export class AdminService {
  async getDashboardMetrics() {
    const [totalUsers, totalSellers, totalProducts, pendingSellers, pendingProducts, totalOrders] = await Promise.all([
      userRepository.count(),
      sellerRepository.count(),
      productRepository.count({ active: { $ne: false } }),
      sellerRepository.count({ kycStatus: "pending" }),
      productRepository.count({ status: "pending", active: { $ne: false } }),
      orderRepository.count(),
    ]);

    // Calculate revenue from completed/paid orders
    const paidOrders = await Order.find({ status: { $in: ["paid", "delivered", "shipped"] } }).select("amount").lean().exec();
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

    return {
      totalUsers,
      totalSellers,
      totalProducts,
      pendingSellers,
      pendingProducts,
      totalOrders,
      totalRevenue,
    };
  }

  async getAllSellers(options?: { page?: number; limit?: number; status?: string }) {
    const page = options?.page ? Math.max(1, options.page) : undefined;
    const limit = options?.limit ? Math.max(1, options.limit) : undefined;
    const filter: Record<string, any> = {};

    if (options?.status && options.status !== "All") {
      filter.kycStatus = options.status;
    }

    if (page && limit) {
      const skip = (page - 1) * limit;
      const [sellers, total] = await Promise.all([
        Seller.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
        Seller.countDocuments(filter).exec(),
      ]);
      return { sellers, total, page, limit, pages: Math.ceil(total / limit) };
    }

    return sellerRepository.findAllSellers();
  }

  async updateSellerKyc(sellerId: string, kycStatus: "pending" | "approved" | "rejected") {
    const seller = await sellerRepository.updateKycStatus(sellerId, kycStatus);
    if (!seller) {
      throw new AppError("Seller profile not found", 404);
    }
    return seller;
  }

  // --- PRODUCT MANAGEMENT ---
  async getAllProducts(options: { search?: string; category?: string; subCategory?: string; page?: number; limit?: number }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { active: { $ne: false } };

    if (options.category && options.category !== "All") {
      filter.category = { $regex: `^${options.category}$`, $options: "i" };
    }

    if (options.subCategory && options.subCategory !== "All") {
      filter.subCategory = { $regex: options.subCategory.trim(), $options: "i" };
    }

    if (options.search?.trim()) {
      const searchRegex = { $regex: options.search.trim(), $options: "i" };
      filter.$or = [
        { title: searchRegex },
        { brand: searchRegex },
        { category: searchRegex },
        { subCategory: searchRegex },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      Product.countDocuments(filter).exec(),
    ]);

    return { products, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async createProduct(data: any) {
    if (!data.title || !data.price || !data.category) {
      throw new AppError("Title, price, and category are required", 400);
    }

    const maxId = await productRepository.getMaxNumericId();
    const nextNumericId = maxId + 1;

    const product = await Product.create({
      id: nextNumericId,
      title: data.title,
      name: data.title,
      description: data.description || "",
      price: Number(data.price),
      discountPercentage: Number(data.discountPercentage || 0),
      category: data.category,
      subCategory: data.subCategory || "",
      brand: data.brand || "Generic",
      stock: Number(data.stock || 50),
      thumbnail: data.thumbnail || data.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
      images: data.images && data.images.length > 0 ? data.images : [data.thumbnail || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80"],
      status: "approved",
      active: true,
      couponCode: data.couponCode ? data.couponCode.trim().toUpperCase() : "",
      rating: 4.5,
    });

    try {
      await invalidateCache("cache:/api/products*");
      await invalidateCache("cache:/api/admin/products*");
    } catch {}

    return product;
  }


  async updateProduct(idParam: string, updateData: any) {
    if (updateData.couponCode !== undefined) {
      updateData.couponCode = updateData.couponCode ? String(updateData.couponCode).trim().toUpperCase() : "";
    }
    const product = await productRepository.updateProductByIdOrNumericId(idParam, updateData);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    try {
      await invalidateCache("cache:/api/products*");
      await invalidateCache("cache:/api/admin/products*");
    } catch {}

    return product;
  }

  async deleteProduct(idParam: string) {
    const success = await productRepository.softDeleteByIdOrNumericId(idParam);
    if (!success) {
      throw new AppError("Product not found or already deleted", 404);
    }

    try {
      await invalidateCache("cache:/api/products*");
      await invalidateCache("cache:/api/admin/products*");
    } catch {}

    return { message: "Product deleted successfully" };
  }

  // --- USER MANAGEMENT ---
  async getAllUsers(options?: { page?: number; limit?: number }) {
    const page = options?.page ? Math.max(1, options.page) : undefined;
    const limit = options?.limit ? Math.max(1, options.limit) : undefined;

    if (page && limit) {
      const skip = (page - 1) * limit;
      const [users, total] = await Promise.all([
        User.find().select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
        User.countDocuments().exec(),
      ]);
      return { users, total, page, limit, pages: Math.ceil(total / limit) };
    }

    return User.find().select("-password").sort({ createdAt: -1 }).lean().exec();
  }

  async updateUserRole(userId: string, role: "user" | "seller" | "admin") {
    if (!["user", "seller", "admin"].includes(role)) {
      throw new AppError("Invalid role value", 400);
    }
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select("-password").exec();
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }

  async deleteUser(userId: string) {
    const user = await User.findByIdAndDelete(userId).exec();
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return { message: "User deleted successfully" };
  }

  // --- ORDER MANAGEMENT ---
  async getAllOrders(options?: { page?: number; limit?: number; status?: string; search?: string }) {
    const page = options?.page ? Math.max(1, options.page) : undefined;
    const limit = options?.limit ? Math.max(1, options.limit) : undefined;
    const filter: Record<string, any> = {};

    if (options?.status && options.status !== "All") {
      filter.status = options.status;
    }

    if (options?.search && options.search.trim()) {
      const regex = { $regex: options.search.trim(), $options: "i" };
      filter.$or = [
        { orderNumber: regex },
        { stripeSessionId: regex },
        { "customer.name": regex },
        { "customer.phone": regex },
        { "customer.email": regex },
        { "shippingAddress.city": regex },
        { "shippingAddress.fullName": regex },
      ];
    }

    if (page && limit) {
      const skip = (page - 1) * limit;
      const [orders, total] = await Promise.all([
        Order.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("userId", "name email phone")
          .populate("items.productId", "title thumbnail price")
          .lean()
          .exec(),
        Order.countDocuments(filter).exec(),
      ]);
      return { orders, total, page, limit, pages: Math.ceil(total / limit) };
    }

    return Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("userId", "name email phone")
      .populate("items.productId", "title thumbnail price")
      .lean()
      .exec();
  }

  async updateOrderStatus(orderId: string, status: string) {
    const validStatuses = [
      "placed",
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "failed",
      "paid",
      "refunded",
    ];
    if (!validStatuses.includes(status)) {
      throw new AppError("Invalid order status", 400);
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    const updateFields: Record<string, any> = { status };

    // Flipkart-style COD Payment Auto-Reconciliation:
    // When order is marked 'delivered', if it's Cash On Delivery and payment is pending,
    // automatically mark paymentStatus as 'paid' and set paidAt and deliveredAt timestamps!
    if (status === "delivered") {
      updateFields.deliveredAt = new Date();
      if (order.paymentMethod === "cod" && order.paymentStatus !== "paid") {
        updateFields.paymentStatus = "paid";
        updateFields.paidAt = new Date();
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateFields, { new: true })
      .populate("userId", "name email phone")
      .populate("items.productId", "title thumbnail price")
      .exec();

    return updatedOrder;
  }

  async updateOrderPaymentStatus(orderId: string, paymentStatus: string) {
    const validPaymentStatuses = ["pending", "paid", "failed", "refunded"];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      throw new AppError("Invalid payment status value", 400);
    }

    const updateFields: Record<string, any> = { paymentStatus };
    if (paymentStatus === "paid") {
      updateFields.paidAt = new Date();
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateFields, { new: true })
      .populate("userId", "name email phone")
      .populate("items.productId", "title thumbnail price")
      .exec();

    if (!updatedOrder) {
      throw new AppError("Order not found", 404);
    }

    return updatedOrder;
  }

  async getBrands() {
    const brandAgg = await Product.aggregate([
      { $match: { brand: { $exists: true, $ne: "" } } },
      {
        $group: {
          _id: "$brand",
          catalogItems: { $sum: 1 },
          categories: { $addToSet: "$category" },
          avgRating: { $avg: "$rating" },
          warranties: { $addToSet: "$warranty" },
          avgPrice: { $avg: "$price" },
        },
      },
      { $sort: { catalogItems: -1 } },
    ]);
    return brandAgg;
  }

  async getCategories() {
    const [categories, productStats, totalProducts] = await Promise.all([
      Category.find().sort({ name: 1 }).lean().exec(),
      Product.aggregate([
        { $match: { category: { $exists: true, $ne: "" } } },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            subCats: { $addToSet: "$subCategory" },
          },
        },
      ]),
      Product.countDocuments({ active: { $ne: false } }),
    ]);

    const statsMap: Record<string, { count: number; subCats: string[] }> = {};
    for (const stat of productStats) {
      if (stat._id) {
        statsMap[String(stat._id).toLowerCase()] = {
          count: stat.count || 0,
          subCats: (stat.subCats || []).filter(Boolean),
        };
      }
    }

    const result = categories.map((cat: any) => {
      const lower = (cat.name || "").toLowerCase();
      const dbSubCount = (cat.subCategories || []).length;
      const stat = statsMap[lower] || { count: 0, subCats: [] };

      return {
        _id: cat._id,
        id: String(cat._id),
        name: cat.name,
        slug: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        subCategories: cat.subCategories || [],
        subCount: Math.max(dbSubCount, stat.subCats.length),
        itemCount: stat.count,
        status: cat.active !== false ? "active" : "inactive",
        active: cat.active !== false,
      };
    });

    return { categories: result, totalProducts };
  }

  async createCategory(data: { name: string; slug?: string }) {
    if (!data.name || !data.name.trim()) {
      throw new AppError("Category name is required", 400);
    }
    const name = data.name.trim();
    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existing) {
      throw new AppError(`Category "${name}" already exists`, 400);
    }
    const slug = data.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const category = await Category.create({
      name,
      slug,
      subCategories: [],
      active: true,
    });
    return category;
  }

  async updateCategory(id: string, data: { name?: string; slug?: string; status?: string; active?: boolean }) {
    const category = await Category.findById(id);
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    if (data.name) category.name = data.name.trim();
    if (data.slug) category.slug = data.slug.trim();
    if (data.status) category.active = data.status === "active";
    if (typeof data.active === "boolean") category.active = data.active;
    await category.save();
    return category;
  }

  async deleteCategory(id: string) {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    return true;
  }

  async exportReport(format: "csv" | "pdf", type: "categories" | "orders" | "summary" = "summary") {
    const today = new Date().toISOString().split("T")[0];
    const metrics = await this.getDashboardMetrics();
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email phone")
      .populate("items.productId", "title category price")
      .lean()
      .exec();

    const products = await Product.find().select("title category price stock sku brand").lean().exec();

    // 1. Build category breakdown
    const catMap: Record<string, { revenue: number; units: number }> = {};
    orders.forEach((order: any) => {
      (order.items || []).forEach((item: any) => {
        const matchProd = products.find((p: any) => String(p._id) === String(item.productId?._id || item.productId));
        const cat = matchProd?.category || item.category || "Other";
        if (!catMap[cat]) catMap[cat] = { revenue: 0, units: 0 };
        catMap[cat].revenue += (item.price || 0) * (item.quantity || 1);
        catMap[cat].units += item.quantity || 1;
      });
    });

    const totalRev = metrics.totalRevenue || orders.reduce((sum: number, o: any) => sum + (o.amount || 0), 0);
    const avgOrderValue = orders.length > 0 ? Math.round(totalRev / orders.length) : 0;

    const categoryBreakdown = Object.entries(catMap)
      .map(([cat, v]) => ({
        category: cat,
        revenue: v.revenue,
        unitsSold: v.units,
        share: totalRev > 0 ? `${Math.round((v.revenue / totalRev) * 100)}%` : "0%",
        pct: totalRev > 0 ? Math.round((v.revenue / totalRev) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // 2. Build order status breakdown
    const statusMap: Record<string, number> = {};
    orders.forEach((o: any) => {
      const s = o.status || "unknown";
      statusMap[s] = (statusMap[s] || 0) + 1;
    });
    const statusBreakdown = Object.entries(statusMap).sort((a, b) => b[1] - a[1]);

    // Handle CSV export
    if (format === "csv") {
      if (type === "categories") {
        const rows = [
          ["SmartElectronics Management Console - Category Sales & Revenue Report"],
          [`Generated At: ${new Date().toLocaleString("en-IN")}`],
          [`Gross Revenue (INR): ${totalRev}`],
          [`Total Orders Recorded: ${metrics.totalOrders}`],
          [`Average Order Value (INR): ${avgOrderValue}`],
          [],
          ["Department / Category", "Revenue (INR)", "Units Sold", "Market Share (%)"],
          ...categoryBreakdown.map((r) => [
            `"${r.category.replace(/"/g, '""')}"`,
            r.revenue,
            r.unitsSold,
            r.share,
          ]),
        ];
        const csvText = rows.map((r) => r.join(",")).join("\n");
        return {
          contentType: "text/csv; charset=utf-8",
          filename: `SmartElectronics-Category-Sales-${today}.csv`,
          buffer: Buffer.from(csvText, "utf-8"),
        };
      }

      if (type === "orders") {
        const rows = [
          ["SmartElectronics Management Console - Customer Orders Ledger"],
          [`Generated At: ${new Date().toLocaleString("en-IN")}`],
          [`Total Orders Recorded: ${orders.length}`],
          [],
          [
            "Order ID",
            "Customer Name",
            "Customer Email",
            "Customer Phone",
            "Items Count",
            "Total Amount (INR)",
            "Order Status",
            "Payment Status",
            "Payment Method",
            "Order Date",
          ],
          ...orders.map((o: any) => [
            `"${o._id || o.id || ""}"`,
            `"${(o.customerName || (o.userId as any)?.name || o.shippingAddress?.fullName || "Customer").replace(/"/g, '""')}"`,
            `"${(o.customerEmail || (o.userId as any)?.email || o.shippingAddress?.email || "").replace(/"/g, '""')}"`,
            `"${(o.customerPhone || (o.userId as any)?.phone || o.shippingAddress?.phone || "").replace(/"/g, '""')}"`,
            (o.items || []).reduce((acc: number, it: any) => acc + (it.quantity || 1), 0),
            o.amount || o.total || 0,
            `"${o.status || "placed"}"`,
            `"${o.paymentStatus || "pending"}"`,
            `"${o.paymentMethod || "COD"}"`,
            `"${o.createdAt ? new Date(o.createdAt).toLocaleString("en-IN") : ""}"`,
          ]),
        ];
        const csvText = rows.map((r) => r.join(",")).join("\n");
        return {
          contentType: "text/csv; charset=utf-8",
          filename: `SmartElectronics-Orders-Ledger-${today}.csv`,
          buffer: Buffer.from(csvText, "utf-8"),
        };
      }

      // Default: Comprehensive Summary CSV
      const rows = [
        ["SmartElectronics Management Console - Executive Business Audit"],
        [`Generated At: ${new Date().toLocaleString("en-IN")}`],
        [`Gross Revenue: INR ${totalRev}`],
        [`Total Orders: ${metrics.totalOrders}`],
        [`Average Order Value: INR ${avgOrderValue}`],
        [`Catalog Active SKUs: ${metrics.totalProducts}`],
        [`Total Registered Customers: ${metrics.totalUsers}`],
        [],
        ["--- DEPARTMENT PERFORMANCE ---"],
        ["Department / Category", "Revenue (INR)", "Units Sold", "Market Share (%)"],
        ...categoryBreakdown.map((r) => [
          `"${r.category.replace(/"/g, '""')}"`,
          r.revenue,
          r.unitsSold,
          r.share,
        ]),
        [],
        ["--- ORDER FULFILLMENT BREAKDOWN ---"],
        ["Status", "Order Count", "Percentage"],
        ...statusBreakdown.map(([st, cnt]) => [
          `"${st}"`,
          cnt,
          orders.length > 0 ? `${Math.round((cnt / orders.length) * 100)}%` : "0%",
        ]),
      ];
      const csvText = rows.map((r) => r.join(",")).join("\n");
      return {
        contentType: "text/csv; charset=utf-8",
        filename: `SmartElectronics-Sales-Report-${today}.csv`,
        buffer: Buffer.from(csvText, "utf-8"),
      };
    }

    // Handle PDF export with PDFKit
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 36, info: { Title: "SmartElectronics Sales & Analytics Report", Author: "SmartElectronics Admin" } });
      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Header Brand
      doc.fillColor("#1e3a8a").fontSize(18).text("SmartElectronics", 36, 36, { continued: true });
      doc.fillColor("#2563eb").text(" Management Console");
      doc.fontSize(10).fillColor("#64748b").text("Executive Sales, Revenue & Department Analytics Audit", 36, 58);
      doc.text(`Generated: ${new Date().toLocaleString("en-IN")}  |  Environment: Production Admin Console`, 36, 72);

      // Divider
      doc.moveTo(36, 88).lineTo(559, 88).strokeColor("#2563eb").lineWidth(2).stroke();

      // KPI Boxes
      const kpis = [
        { label: "GROSS REVENUE", val: `INR ${totalRev.toLocaleString("en-IN")}`, col: "#059669" },
        { label: "TOTAL ORDERS", val: String(metrics.totalOrders), col: "#4f46e5" },
        { label: "AVG. ORDER VALUE", val: `INR ${avgOrderValue.toLocaleString("en-IN")}`, col: "#0284c7" },
        { label: "CATALOG SKUS", val: String(metrics.totalProducts), col: "#d97706" },
      ];

      kpis.forEach((kpi, idx) => {
        const x = 36 + idx * 133;
        doc.rect(x, 100, 125, 48).fillAndStroke("#f8fafc", "#e2e8f0");
        doc.fillColor("#64748b").fontSize(7).text(kpi.label, x + 8, 108);
        doc.fillColor(kpi.col).fontSize(11).text(kpi.val, x + 8, 122, { width: 110 });
      });

      // Section 1: Department Revenue Breakdown
      let y = 165;
      doc.fillColor("#1e293b").fontSize(11).text("DEPARTMENT REVENUE BREAKDOWN", 36, y);
      y += 18;

      // Table Header
      doc.rect(36, y, 523, 20).fill("#f1f5f9");
      doc.fillColor("#475569").fontSize(8);
      doc.text("DEPARTMENT", 44, y + 6);
      doc.text("REVENUE (INR)", 240, y + 6, { width: 100, align: "right" });
      doc.text("UNITS SOLD", 370, y + 6, { width: 60, align: "center" });
      doc.text("SHARE", 460, y + 6, { width: 80, align: "right" });
      y += 20;

      const displayCats = categoryBreakdown.slice(0, 10);
      displayCats.forEach((c, idx) => {
        const bg = idx % 2 === 0 ? "#ffffff" : "#f8fafc";
        doc.rect(36, y, 523, 18).fill(bg);
        doc.fillColor("#0f172a").fontSize(8);
        doc.text(c.category, 44, y + 5, { width: 180, ellipsis: true });
        doc.text(`Rs ${c.revenue.toLocaleString("en-IN")}`, 240, y + 5, { width: 100, align: "right" });
        doc.text(String(c.unitsSold), 370, y + 5, { width: 60, align: "center" });
        doc.fillColor("#4f46e5").text(c.share, 460, y + 5, { width: 80, align: "right" });
        y += 18;
      });

      // Section 2: Order Status Split
      y += 15;
      doc.fillColor("#1e293b").fontSize(11).text("ORDER FULFILLMENT STATUS SPLIT", 36, y);
      y += 18;

      doc.rect(36, y, 523, 20).fill("#f1f5f9");
      doc.fillColor("#475569").fontSize(8);
      doc.text("STATUS", 44, y + 6);
      doc.text("ORDERS COUNT", 240, y + 6, { width: 100, align: "right" });
      doc.text("PERCENTAGE", 460, y + 6, { width: 80, align: "right" });
      y += 20;

      statusBreakdown.forEach(([st, cnt], idx) => {
        const pct = orders.length > 0 ? `${Math.round((cnt / orders.length) * 100)}%` : "0%";
        const bg = idx % 2 === 0 ? "#ffffff" : "#f8fafc";
        doc.rect(36, y, 523, 18).fill(bg);
        doc.fillColor("#0f172a").fontSize(8);
        doc.text(st.toUpperCase(), 44, y + 5);
        doc.text(String(cnt), 240, y + 5, { width: 100, align: "right" });
        doc.text(pct, 460, y + 5, { width: 80, align: "right" });
        y += 18;
      });

      // Section 3: Recent Order Transactions Ledger
      y += 15;
      doc.fillColor("#1e293b").fontSize(11).text("RECENT ORDER TRANSACTIONS LEDGER", 36, y);
      y += 18;

      doc.rect(36, y, 523, 20).fill("#f1f5f9");
      doc.fillColor("#475569").fontSize(8);
      doc.text("ORDER ID", 44, y + 6);
      doc.text("CUSTOMER", 140, y + 6);
      doc.text("ITEMS", 280, y + 6, { width: 40, align: "center" });
      doc.text("AMOUNT (INR)", 340, y + 6, { width: 90, align: "right" });
      doc.text("STATUS", 450, y + 6);
      y += 20;

      const recentOrders = orders.slice(0, 8);
      recentOrders.forEach((o: any, idx) => {
        const bg = idx % 2 === 0 ? "#ffffff" : "#f8fafc";
        doc.rect(36, y, 523, 18).fill(bg);
        doc.fillColor("#0f172a").fontSize(8);
        doc.text(String(o._id || o.id).slice(-8).toUpperCase(), 44, y + 5);
        doc.text((o.customerName || (o.userId as any)?.name || "Customer"), 140, y + 5, { width: 130, ellipsis: true });
        doc.text(String((o.items || []).length), 280, y + 5, { width: 40, align: "center" });
        doc.text(`Rs ${Number(o.amount || o.total || 0).toLocaleString("en-IN")}`, 340, y + 5, { width: 90, align: "right" });
        doc.text(String(o.status || "placed").toUpperCase(), 450, y + 5);
        y += 18;
      });

      // Footer
      doc.moveTo(36, 780).lineTo(559, 780).strokeColor("#e2e8f0").lineWidth(1).stroke();
      doc.fillColor("#94a3b8").fontSize(8).text("SmartElectronics Retail Ltd. • Confidential Corporate Analytics Audit", 36, 788);
      doc.text("Page 1 of 1 • System Generated from Live MongoDB Store", 340, 788, { width: 219, align: "right" });

      doc.end();
    });

    return {
      contentType: "application/pdf",
      filename: `SmartElectronics-Analytics-Report-${today}.pdf`,
      buffer: pdfBuffer,
    };
  }
}

export const adminService = new AdminService();

