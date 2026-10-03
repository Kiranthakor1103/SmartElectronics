export interface Coupon {
  _id?: string;
  code: string;
  label: string;
  type: "percent" | "flat";
  value: number;
  minOrder?: number;
  active: boolean;
  createdAt?: string;
}
