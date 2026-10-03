import { z } from "zod";

export const sellerOnboardSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(100).trim(),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format (e.g. 22AAAAA1111A1Z1)").trim().toUpperCase(),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format (e.g. ABCDE1234F)").trim().toUpperCase(),
  bankAccount: z.string().min(9, "Bank account must be 9-18 digits").max(18).trim(),
  bankIfsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC format (e.g. SBIN0001234)").trim().toUpperCase(),
});

export type SellerOnboardInput = z.infer<typeof sellerOnboardSchema>;
