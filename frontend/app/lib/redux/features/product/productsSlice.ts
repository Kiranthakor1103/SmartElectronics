import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductApi } from '@/lib/api/productApi';
import { PRODUCT_CATALOG } from '@/app/lib/products/catalog';

import type { ProductQueryOptions } from '@/lib/api/productApi';

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  discountPercentage?: number;
  rating?: number;
  stock?: number;
  brand?: string;
  thumbnail?: string;
  images?: string[];
  originalPrice?: number;
  badge?: string;
  featured?: boolean;
  active?: boolean;
}

interface ProductsState {
  items: Product[];
  selectedProduct: Product | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  total: number;
  pages: number;
  currentPage: number;
}

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (options: ProductQueryOptions | void, { rejectWithValue }) => {
    try {
      const opts = options || { limit: 150 };
      const res = await ProductApi.getProducts(opts);
      if (res && res.success && Array.isArray(res.products) && res.products.length > 0) {
        return {
          products: res.products as Product[],
          total: res.pagination?.total ?? res.products.length,
          pages: res.pagination?.pages ?? 1,
          currentPage: res.pagination?.currentPage ?? 1,
        };
      }
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        return {
          products: res.data as Product[],
          total: res.pagination?.total ?? res.data.length,
          pages: res.pagination?.pages ?? 1,
          currentPage: res.pagination?.currentPage ?? 1,
        };
      }
      return {
        products: PRODUCT_CATALOG as Product[],
        total: PRODUCT_CATALOG.length,
        pages: 1,
        currentPage: 1,
      };
    } catch (error) {
      console.warn('[productsSlice] API fetch failed, using PRODUCT_CATALOG fallback.');
      return {
        products: PRODUCT_CATALOG as Product[],
        total: PRODUCT_CATALOG.length,
        pages: 1,
        currentPage: 1,
      };
    }
  }
);

const initialState: ProductsState = {
  items: [],
  selectedProduct: null,
  status: 'idle',
  error: null,
  total: 0,
  pages: 1,
  currentPage: 1,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    updateSingleProduct: (state, action: PayloadAction<Product>) => {
      const idx = state.items.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload };
      } else {
        state.items.push(action.payload);
      }
      if (state.selectedProduct?.id === action.payload.id) {
        state.selectedProduct = { ...state.selectedProduct, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.products;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Failed to load products.';
      });
  },
});

export const { setSelectedProduct, updateSingleProduct } = productsSlice.actions;
export default productsSlice.reducer;
