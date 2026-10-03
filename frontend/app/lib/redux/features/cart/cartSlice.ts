import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../product/productsSlice";
import {
  calculateDiscount,
  calculateShipping,
  type Coupon,
} from "@/app/lib/constants/ecommerce";

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon: Coupon | null;
}

function recalculate(state: CartState) {
  state.subtotal = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  state.discount = state.coupon
    ? calculateDiscount(state.subtotal, state.coupon, state.items)
    : 0;
  const afterDiscount = Math.max(0, state.subtotal - state.discount);
  state.shipping = state.items.length > 0 ? calculateShipping(afterDiscount) : 0;
  state.total = afterDiscount + state.shipping;
}

const initialState: CartState = {
  items: [],
  subtotal: 0,
  discount: 0,
  shipping: 0,
  total: 0,
  coupon: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrateCart: (state, action: PayloadAction<Partial<CartState>>) => {
      if (action.payload.items) state.items = action.payload.items;
      if (action.payload.coupon !== undefined) state.coupon = action.payload.coupon;
      recalculate(state);
    },
    addToCart: (state, action: PayloadAction<Product>) => {
      // If product stock is defined and <= 0, reject adding to cart
      if (typeof action.payload.stock === 'number' && action.payload.stock <= 0) {
        return;
      }
      const existing = state.items.find((item) => item.id === action.payload.id);
      if (existing) {
        const availableStock = typeof action.payload.stock === 'number'
          ? action.payload.stock
          : (typeof existing.stock === 'number' ? existing.stock : 999);
        if (existing.quantity < availableStock) {
          existing.quantity += 1;
        }
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      recalculate(state);
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      recalculate(state);
    },
    decrementQuantity: (state, action: PayloadAction<number>) => {
      const existing = state.items.find((item) => item.id === action.payload);
      if (existing) {
        if (existing.quantity > 1) {
          existing.quantity -= 1;
        } else {
          state.items = state.items.filter((item) => item.id !== action.payload);
        }
      }
      recalculate(state);
    },
    setQuantity: (
      state,
      action: PayloadAction<{ id: number; quantity: number }>
    ) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (!item) return;
      if (action.payload.quantity <= 0) {
        state.items = state.items.filter((i) => i.id !== action.payload.id);
      } else {
        const maxStock = typeof item.stock === 'number' ? Math.max(0, item.stock) : 999;
        item.quantity = Math.min(action.payload.quantity, maxStock);
      }
      recalculate(state);
    },
    applyCoupon: (state, action: PayloadAction<Coupon>) => {
      state.coupon = action.payload;
      recalculate(state);
    },
    removeCoupon: (state) => {
      state.coupon = null;
      recalculate(state);
    },
    syncCartStock: (
      state,
      action: PayloadAction<{ id: number; stock: number }[]>
    ) => {
      let changed = false;
      for (const update of action.payload) {
        const item = state.items.find((i) => i.id === update.id);
        if (item && item.stock !== update.stock) {
          item.stock = update.stock;
          changed = true;
        }
      }
      if (changed) {
        recalculate(state);
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.coupon = null;
      recalculate(state);
    },
  },
});

export const {
  hydrateCart,
  addToCart,
  removeFromCart,
  decrementQuantity,
  setQuantity,
  syncCartStock,
  applyCoupon,
  removeCoupon,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
