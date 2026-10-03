export interface IOrderItem {
  productId: string;
  quantity: number;
  price: number;
  sellerId?: string | null;
}

export interface IOrder {
  _id?: string;
  userId?: string;
  stripeSessionId?: string;
  amount: number;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "failed" | "refunded";
  couponCode?: string;
  discount?: number;
  shipping?: number;
  itemCount?: number;
  items?: IOrderItem[];
  createdAt?: string;
  updatedAt?: string;
}

export default IOrder;
