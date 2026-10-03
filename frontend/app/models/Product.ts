export interface IProduct {
  _id?: string;
  id: number;
  title: string;
  name: string;
  price: number;
  description: string;
  category: string;
  sku?: string;
  subCategory?: string;
  salePrice?: number;
  warranty?: string;
  trending?: boolean;
  specifications?: Record<string, unknown>;
  discountPercentage?: number;
  discountPrice?: number;
  rating?: number;
  stock?: number;
  brand?: string;
  thumbnail?: string;
  image?: string;
  images?: string[];
  originalPrice?: number;
  badge?: string;
  featured?: boolean;
  active?: boolean;
  sellerId?: string;
  status?: "pending" | "approved" | "rejected";
  createdAt?: string;
  updatedAt?: string;
}

export default IProduct;
