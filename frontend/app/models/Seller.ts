export interface ISeller {
  _id?: string;
  userId: string;
  companyName: string;
  gstNumber: string;
  panNumber: string;
  bankAccount: string;
  bankIfsc: string;
  kycStatus: "pending" | "approved" | "rejected";
  commissionRate: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default ISeller;
