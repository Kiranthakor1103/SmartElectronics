import type { CartItem } from "@/app/lib/redux/features/cart/cartSlice";

export interface ShippingAddress {
  fullName: string;
  phone: string;
  pincode: string;
  locality?: string;
  address: string;
  city: string;
  state: string;
  addressType?: string;
}

export interface OrderReceiptData {
  sessionId: string;
  date: string;
  status: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
  paymentMethod?: string;
  shippingAddress?: ShippingAddress;
  customerEmail?: string;
}

export function buildReceiptFromCart(
  sessionId: string,
  cart: {
    items?: CartItem[];
    subtotal?: number;
    discount?: number;
    shipping?: number;
    total?: number;
    coupon?: { code: string } | null;
    couponCode?: string;
  },
  dateLabel: string,
  options?: {
    paymentMethod?: string;
    shippingAddress?: ShippingAddress;
    customerEmail?: string;
  }
): OrderReceiptData {
  const items = cart?.items || [];
  const discount = Number(cart?.discount ?? 0);
  const shipping = Number(cart?.shipping ?? 0);
  const total = Number(cart?.total ?? items.reduce((sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 1), 0));
  const subtotal = Number(cart?.subtotal ?? (total + discount - shipping));

  return {
    sessionId: sessionId || `cs_order_${Date.now()}`,
    date: dateLabel || new Date().toLocaleString("en-IN"),
    status: options?.paymentMethod === "Cash on Delivery" ? "ORDER PLACED (COD)" : "PAID",
    items,
    subtotal,
    discount,
    shipping,
    total,
    couponCode: cart?.coupon?.code || cart?.couponCode || "",
    paymentMethod: options?.paymentMethod || "Stripe Card",
    shippingAddress: options?.shippingAddress,
    customerEmail: options?.customerEmail,
  };
}

export async function downloadOrderPdf(receipt: OrderReceiptData): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const autoTableModule = await import("jspdf-autotable");
  const autoTable = autoTableModule.default || autoTableModule;

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // --- BRAND COLORS (Modern Luxury E-Commerce Palette) ---
  const brandDark = [15, 23, 42];        // #0f172a Slate 900
  const brandIndigo = [67, 56, 202];     // #4338ca Deep Indigo
  const brandPurple = [79, 70, 229];     // #4f46e5 Electric Indigo
  const textDark = [30, 41, 59];         // #1e293b Slate 800
  const textMuted = [100, 116, 139];     // #64748b Slate 500
  const cardBg = [248, 250, 252];        // #f8fafc Slate 50
  const cardBorder = [226, 232, 240];    // #e2e8f0 Slate 200
  const successColor = [16, 185, 129];   // #10b981 Emerald 500

  // ==========================================
  // 1. TOP HEADER BANNER (Executive Modern Clean Header)
  // ==========================================
  doc.setFillColor(brandDark[0], brandDark[1], brandDark[2]);
  doc.rect(0, 0, pageWidth, 32, "F");

  // Gradient Accent Strip
  doc.setFillColor(brandPurple[0], brandPurple[1], brandPurple[2]);
  doc.rect(0, 31.2, pageWidth, 0.8, "F");

  // SmartElectronics Brand Icon Box
  doc.setFillColor(brandPurple[0], brandPurple[1], brandPurple[2]);
  doc.roundedRect(margin, 6, 10, 10, 2, 2, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("SE", margin + 1.8, 13);

  // Brand Name & Tagline
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("SmartElectronics", margin + 13, 12);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(199, 210, 254); // indigo-200
  doc.text("SMARTELECTRONICS ⚡ PREMIER TECH STORE • OFFICIAL TAX INVOICE & RETAIL RECEIPT", margin + 13, 17.5);

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("GSTIN: 24AAASK4567F1Z9  |  CIN: U52100MH2026PTC123456  |  support@smartelectronics.com", margin + 13, 23);

  // Right Header: Tax Invoice Pill & Reference
  const rawTx = (receipt.sessionId || "order").replace(/[^a-zA-Z0-9_-]/g, "");
  const invoiceNum = `INV-${rawTx.slice(-8).toUpperCase()}`;

  // Invoice Pill Badge
  doc.setFillColor(brandPurple[0], brandPurple[1], brandPurple[2]);
  doc.roundedRect(pageWidth - margin - 34, 6, 34, 6.5, 1.5, 1.5, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("TAX INVOICE", pageWidth - margin - 17, 10.5, { align: "center" });

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(`Invoice: ${invoiceNum}`, pageWidth - margin, 18, { align: "right" });

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(199, 210, 254);
  doc.text(`Date: ${receipt.date || "Today"}`, pageWidth - margin, 23, { align: "right" });

  // ==========================================
  // 2. TWO-COLUMN ADDRESS & TRANSACTION CARDS
  // ==========================================
  const cardY = 38;
  const cardHeight = 36;
  const colWidth = (pageWidth - (margin * 2) - 6) / 2; // 88mm

  // --- Left Card: Billed & Shipped To ---
  doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, cardY, colWidth, cardHeight, 2, 2, "FD");

  // Top Left Header Accent
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(brandPurple[0], brandPurple[1], brandPurple[2]);
  doc.text("BILLED & SHIPPED TO", margin + 4, cardY + 5.5);

  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.setLineWidth(0.2);
  doc.line(margin + 4, cardY + 7.5, margin + colWidth - 4, cardY + 7.5);

  const addr = receipt.shippingAddress;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const customerName = addr?.fullName || "Valued Customer";
  const customerPhone = addr?.phone ? `(${addr.phone})` : "";
  doc.text(`${customerName} ${customerPhone}`.trim(), margin + 4, cardY + 13);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  if (receipt.customerEmail) {
    doc.text(`Email: ${receipt.customerEmail}`, margin + 4, cardY + 18);
  } else {
    doc.text("Direct Digital Order", margin + 4, cardY + 18);
  }

  if (addr) {
    const line1 = `${addr.address || ""}${addr.locality ? `, ${addr.locality}` : ""}`;
    const line2 = `${addr.city || ""}, ${addr.state || ""} - ${addr.pincode || ""}`;
    doc.text(line1.substring(0, 48), margin + 4, cardY + 23);
    doc.text(line2.substring(0, 48), margin + 4, cardY + 28);
  } else {
    doc.text("Direct Digital Delivery / In-Store Fulfillment", margin + 4, cardY + 23);
  }

  // --- Right Card: Payment & Order Information ---
  const rightColX = margin + colWidth + 6;
  doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(rightColX, cardY, colWidth, cardHeight, 2, 2, "FD");

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(brandPurple[0], brandPurple[1], brandPurple[2]);
  doc.text("PAYMENT & ORDER SUMMARY", rightColX + 4, cardY + 5.5);

  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.setLineWidth(0.2);
  doc.line(rightColX + 4, cardY + 7.5, rightColX + colWidth - 4, cardY + 7.5);

  // Status Badge
  const isPaid = (receipt.status || "PAID").toUpperCase().includes("PAID");
  if (isPaid) {
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.setDrawColor(167, 243, 208); // emerald-200
    doc.roundedRect(rightColX + 4, cardY + 10, 36, 6, 1.5, 1.5, "FD");

    // Emerald circle dot
    doc.setFillColor(5, 150, 105);
    doc.circle(rightColX + 8, cardY + 13, 1.2, "F");

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(5, 150, 105);
    doc.text("PAID VERIFIED", rightColX + 11.5, cardY + 14.2);
  } else {
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(253, 230, 138);
    doc.roundedRect(rightColX + 4, cardY + 10, 44, 6, 1.5, 1.5, "FD");

    doc.setFillColor(217, 119, 6);
    doc.circle(rightColX + 8, cardY + 13, 1.2, "F");

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(217, 119, 6);
    doc.text("CASH ON DELIVERY", rightColX + 11.5, cardY + 14.2);
  }

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("Payment Mode:", rightColX + 4, cardY + 21);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(receipt.paymentMethod || "Stripe Card", rightColX + 27, cardY + 21);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("Transaction ID:", rightColX + 4, cardY + 26);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const shortSession = (receipt.sessionId || "cs_order_session");
  doc.text(shortSession.length > 22 ? `${shortSession.substring(0, 14)}...${shortSession.slice(-5)}` : shortSession, rightColX + 27, cardY + 26);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("Order Status:", rightColX + 4, cardY + 31);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(brandPurple[0], brandPurple[1], brandPurple[2]);
  doc.text("CONFIRMED & PROCESSING", rightColX + 27, cardY + 31);

  // ==========================================
  // 3. PRODUCT ITEMS TABLE (AutoTable)
  // ==========================================
  const itemsList = receipt.items || [];
  const tableBody = itemsList.map((item, index) => {
    const itemTitle = item.title || "Catalog Product";
    const itemQty = Number(item.quantity || 1);
    const itemPrice = Number(item.price || 0);
    const itemTotal = itemPrice * itemQty;

    return [
      String(index + 1),
      itemTitle,
      String(itemQty),
      `Rs. ${itemPrice.toLocaleString("en-IN")}`,
      `Rs. ${itemTotal.toLocaleString("en-IN")}`,
    ];
  });

  const tableStartY = cardY + cardHeight + 6;

  const autoTableConfig = {
    startY: tableStartY,
    head: [["#", "ITEM DESCRIPTION & SPECIFICATIONS", "QTY", "UNIT PRICE", "TOTAL AMOUNT"]],
    body: tableBody,
    theme: "grid" as const,
    headStyles: {
      fillColor: brandIndigo as [number, number, number],
      textColor: 255,
      fontStyle: "bold" as const,
      fontSize: 8,
      cellPadding: 3.2,
      halign: "left" as const,
    },
    columnStyles: {
      0: { halign: "center" as const, cellWidth: 10 },
      1: { halign: "left" as const },
      2: { halign: "center" as const, cellWidth: 16 },
      3: { halign: "right" as const, cellWidth: 32 },
      4: { halign: "right" as const, cellWidth: 36 },
    },
    bodyStyles: {
      fontSize: 8,
      textColor: textDark as [number, number, number],
      cellPadding: 3.2,
      lineColor: cardBorder as [number, number, number],
      lineWidth: 0.2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] as [number, number, number],
    },
    margin: { left: margin, right: margin },
  };

  if (typeof autoTable === "function") {
    autoTable(doc, autoTableConfig);
  } else if (typeof (doc as any).autoTable === "function") {
    (doc as any).autoTable(autoTableConfig);
  }

  // ==========================================
  // 4. SUMMARY & VERIFICATION CARDS (Clean Constituent Layout)
  // ==========================================
  const finalY = (doc as any).lastAutoTable?.finalY ?? (tableStartY + 35);
  const subtotal = Number(receipt.subtotal ?? 0);
  const discount = Number(receipt.discount ?? 0);
  const shipping = Number(receipt.shipping ?? 0);
  const total = Number(receipt.total ?? subtotal);
  const couponCode = receipt.couponCode || "";

  const summaryBoxWidth = 84;
  const gap = 6;
  const contentWidth = pageWidth - (margin * 2); // 182mm
  const authBoxWidth = contentWidth - summaryBoxWidth - gap; // 92mm
  const summaryBoxX = pageWidth - margin - summaryBoxWidth;   // 112mm
  const boxHeight = discount > 0 ? 46 : 40;

  // Auto-pagination if summary overflows page boundary
  let summaryY = finalY + 6;
  if (summaryY + boxHeight > pageHeight - 16) {
    doc.addPage();
    summaryY = margin + 4;
  }

  // ----------------------------------------------------
  // A. Left Card: Declaration, Return Policy & Security Stamp
  // ----------------------------------------------------
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.setLineWidth(0.35);
  doc.roundedRect(margin, summaryY, authBoxWidth, boxHeight, 2, 2, "FD");

  // Header
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(brandPurple[0], brandPurple[1], brandPurple[2]);
  doc.text("DECLARATION & RETURN POLICY", margin + 4, summaryY + 5.5);

  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.setLineWidth(0.2);
  doc.line(margin + 4, summaryY + 7.5, margin + authBoxWidth - 4, summaryY + 7.5);

  // Policy Bullet Points
  doc.setFontSize(6.8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("1. This is a computer-generated tax invoice and requires no physical signature.", margin + 4, summaryY + 12);
  doc.text("2. Standard 7-day replacement policy applicable on verified defective goods.", margin + 4, summaryY + 16.5);
  doc.text("3. All warranty claims serviced by respective manufacturer service centers.", margin + 4, summaryY + 21);

  // Security Verification Box (Anchored neatly inside left card)
  const badgeX = margin + 4;
  const badgeY = summaryY + boxHeight - 14.5;
  const badgeW = authBoxWidth - 8; // 84mm
  const badgeH = 11;

  doc.setFillColor(245, 243, 255); // violet-50
  doc.setDrawColor(196, 181, 253); // violet-200
  doc.setLineWidth(0.3);
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1.5, 1.5, "FD");

  // Pure Vector Shield Checkmark (No Unicode font dependencies)
  const checkCenterX = badgeX + 5.5;
  const checkCenterY = badgeY + 5.5;
  doc.setFillColor(brandPurple[0], brandPurple[1], brandPurple[2]);
  doc.circle(checkCenterX, checkCenterY, 3, "F");

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.6);
  doc.line(checkCenterX - 1.2, checkCenterY, checkCenterX - 0.3, checkCenterY + 1.1);
  doc.line(checkCenterX - 0.3, checkCenterY + 1.1, checkCenterX + 1.4, checkCenterY - 1.0);

  // Security Verification Labels (Fits comfortably within 84mm container)
  doc.setFontSize(7.2);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(brandPurple[0], brandPurple[1], brandPurple[2]);
  doc.text("SMARTELECTRONICS DIGITALLY VERIFIED INVOICE", badgeX + 10.5, badgeY + 4.8);

  doc.setFontSize(6.2);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("Security Code: #SE-AUTH-2026 | 256-Bit Encrypted Record", badgeX + 10.5, badgeY + 8.8);

  // ----------------------------------------------------
  // B. Right Card: Financial Breakdown & Grand Total
  // ----------------------------------------------------
  doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.setLineWidth(0.35);
  doc.roundedRect(summaryBoxX, summaryY, summaryBoxWidth, boxHeight, 2, 2, "FD");

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(brandPurple[0], brandPurple[1], brandPurple[2]);
  doc.text("PAYMENT SUMMARY", summaryBoxX + 4, summaryY + 5.5);

  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.setLineWidth(0.2);
  doc.line(summaryBoxX + 4, summaryY + 7.5, summaryBoxX + summaryBoxWidth - 4, summaryY + 7.5);

  let curY = summaryY + 12.5;
  const valX = summaryBoxX + summaryBoxWidth - 5;
  const labelX = summaryBoxX + 4;

  // Subtotal
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("Subtotal:", labelX, curY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`Rs. ${subtotal.toLocaleString("en-IN")}`, valX, curY, { align: "right" });

  // Discount
  if (discount > 0) {
    curY += 4.8;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(successColor[0], successColor[1], successColor[2]);
    const couponLabel = couponCode ? `Discount (${couponCode}):` : "Discount:";
    doc.text(couponLabel, labelX, curY);
    doc.setFont("helvetica", "bold");
    doc.text(`-Rs. ${discount.toLocaleString("en-IN")}`, valX, curY, { align: "right" });
  }

  // Shipping
  curY += 4.8;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("Shipping / Delivery:", labelX, curY);
  doc.setFont("helvetica", "bold");
  if (shipping === 0) {
    doc.setTextColor(successColor[0], successColor[1], successColor[2]);
    doc.text("FREE", valX, curY, { align: "right" });
  } else {
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(`Rs. ${shipping.toLocaleString("en-IN")}`, valX, curY, { align: "right" });
  }

  // Taxes
  curY += 4.8;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("Taxes (GST 18%):", labelX, curY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("Included in MRP", valX, curY, { align: "right" });

  // Dedicated Grand Total Highlight Banner Container
  const totalBoxY = summaryY + boxHeight - 12.5;
  const totalBoxH = 9.5;

  doc.setFillColor(238, 242, 255); // indigo-50
  doc.setDrawColor(199, 210, 254); // indigo-200
  doc.setLineWidth(0.3);
  doc.roundedRect(summaryBoxX + 2.5, totalBoxY, summaryBoxWidth - 5, totalBoxH, 1.5, 1.5, "FD");

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text("Grand Total Paid:", summaryBoxX + 5, totalBoxY + 6.2);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(brandPurple[0], brandPurple[1], brandPurple[2]);
  doc.text(`Rs. ${total.toLocaleString("en-IN")}`, valX - 1, totalBoxY + 6.2, { align: "right" });

  // ==========================================
  // 5. GLOBAL FOOTER (Rendered Across All Pages)
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    const footerY = pageHeight - 9;

    doc.setFillColor(brandDark[0], brandDark[1], brandDark[2]);
    doc.rect(0, pageHeight - 2.5, pageWidth, 2.5, "F");

    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.setLineWidth(0.2);
    doc.line(margin, footerY - 3.5, pageWidth - margin, footerY - 3.5);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(
      "Thank you for shopping with SmartElectronics! Support: support@smartelectronics.com | Toll Free: 1800-889-7627",
      margin,
      footerY
    );

    doc.text(
      `Page ${p} of ${totalPages}`,
      pageWidth - margin,
      footerY,
      { align: "right" }
    );
  }

  const cleanTxId = (receipt.sessionId || "order").replace(/[^a-zA-Z0-9_-]/g, "");
  const fileName = `SmartElectronics-TaxInvoice-${cleanTxId.slice(-8).toUpperCase()}.pdf`;
  doc.save(fileName);
}
