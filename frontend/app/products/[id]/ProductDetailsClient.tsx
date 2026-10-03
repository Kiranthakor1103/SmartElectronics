'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@/app/lib/redux/hooks';
import { fetchProducts, updateSingleProduct } from '@/app/lib/redux/features/product/productsSlice';
import { addToCart } from '@/app/lib/redux/features/cart/cartSlice';
import { ProductService } from '@/services/productService';

import { Loader } from '@/app/components/ui/Loader';
import { ButtonLink } from '@/app/components/ui/Button';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import ProductGallery from '@/app/components/ProductGallery';
import WishlistButton from '@/app/components/WishlistButton';
import RelatedProducts from '@/app/components/RelatedProducts';
import RecentlyViewed from '@/app/components/RecentlyViewed';
import ProductSpecifications from '@/app/components/ProductSpecifications';
import { useToast } from '@/app/components/ToastProvider';
import { useRecentlyViewed } from '@/app/hooks/useRecentlyViewed';

const SmartAssuredBadge = () => (
  <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-700 border border-blue-200/90 select-none ml-2 tracking-wide">
    Smart<span className="text-cyan-500 font-bold">★</span>Assured
  </span>
);

export default function ProductDetailsClient({ initialProduct }: { initialProduct?: any }) {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { recentlyViewed, addRecentlyViewed } = useRecentlyViewed();

  const products = useAppSelector((state) => state.products.items);
  const status = useAppSelector((state) => state.products.status);
  const [addedToCart, setAddedToCart] = useState(false);
  const [liveProduct, setLiveProduct] = useState<any>(initialProduct);

  const productFromRedux = products.find((item) => item.id === Number(params.id));
  const product = liveProduct || initialProduct || productFromRedux;

  useEffect(() => {
    if (params.id) {
      const numId = Number(params.id);
      if (!isNaN(numId)) {
        ProductService.getProductById(numId).then((fresh) => {
          if (fresh) {
            setLiveProduct(fresh);
            dispatch(updateSingleProduct(fresh as any));
          }
        });
      }
    }
  }, [params.id, dispatch]);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product);
    }
  }, [product, addRecentlyViewed]);

  const handleCheckout = () => {
    if (!product) return;
    const isOut = typeof product.stock === 'number' ? product.stock <= 0 : false;
    if (isOut) {
      toast('This product is currently out of stock');
      return;
    }
    dispatch(addToCart(product));
    router.push('/checkout');
  };

  const handleAddToCart = () => {
    if (!product) return;
    const isOut = typeof product.stock === 'number' ? product.stock <= 0 : false;
    if (isOut) {
      toast('This product is currently out of stock');
      return;
    }
    dispatch(addToCart(product));
    setAddedToCart(true);
    toast('Added to cart');
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (status === 'loading' && !product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader
          size="lg"
          label="Loading product details…"
          sublabel="Retrieving specifications and verified pricing"
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <p className="text-6xl font-bold text-slate-200" aria-hidden="true">404</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Product not found</h1>
        <div className="mt-8">
          <ButtonLink href="/products" variant="secondary">
            Browse Electronics
          </ButtonLink>
        </div>
      </div>
    );
  }

  const images = [
    ...(product.images ?? []),
    ...(product.thumbnail && !product.images?.includes(product.thumbnail)
      ? [product.thumbnail]
      : []),
  ].filter(Boolean) as string[];

  const discountPercent = product.discountPercentage
    ? Math.round(product.discountPercentage)
    : 0;

  const outOfStock = typeof product.stock === 'number' ? product.stock <= 0 : false;

  return (
    <div className="py-6 sm:py-8 bg-slate-50 min-h-screen">
      <div className="section-container max-w-6xl mx-auto px-4">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: product.category || 'Electronics', href: `/products?category=${encodeURIComponent(product.category || '')}` },
            { label: product.title },
          ]}
        />

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Column: Product Gallery & Sticky Action Buttons */}
            <div className="lg:col-span-5 p-4 sm:p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100">
              <div>
                <ProductGallery
                  images={images}
                  title={product.title}
                  discountPercent={discountPercent}
                />
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-3">
                {outOfStock && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-center">
                    <p className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center justify-center gap-1.5">
                      <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Currently Out of Stock
                    </p>
                    <p className="text-[11px] text-rose-600 mt-0.5 font-medium">This item is unavailable right now. Please check back later.</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={outOfStock}
                    className={outOfStock
                      ? "flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-100 py-3.5 px-4 text-xs sm:text-sm font-bold text-slate-400 border border-slate-200 cursor-not-allowed uppercase tracking-wider"
                      : "flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 py-3.5 px-4 text-xs sm:text-sm font-black text-white shadow-sm transition active:scale-[0.99] cursor-pointer uppercase tracking-wider"
                    }
                  >
                    <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                      <path d="M17 18c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM7 18c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm0-3l1.1-2h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z" />
                    </svg>
                    <span>{outOfStock ? 'OUT OF STOCK' : (addedToCart ? 'ADDED' : 'ADD TO CART')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={outOfStock}
                    className={outOfStock
                      ? "flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-100 py-3.5 px-4 text-xs sm:text-sm font-bold text-slate-400 border border-slate-200 cursor-not-allowed uppercase tracking-wider"
                      : "flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:to-indigo-700 py-3.5 px-4 text-xs sm:text-sm font-black text-white shadow-md shadow-blue-500/20 transition active:scale-[0.99] cursor-pointer uppercase tracking-wider"
                    }
                  >
                    <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                      <path d="M7 18c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                    <span>{outOfStock ? 'UNAVAILABLE' : 'BUY NOW'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Product Details */}
            <div className="lg:col-span-7 p-4 sm:p-6 lg:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Product Title & Brand */}
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex-wrap">
                    <span className="text-blue-600">{product.brand || 'Brand Direct'}</span>
                    <span>•</span>
                    <span>{product.category}</span>
                    {product.subCategory && (
                      <>
                        <span>•</span>
                        <span className="text-slate-600">{product.subCategory}</span>
                      </>
                    )}
                    {product.sku && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-slate-400 font-semibold">{product.sku}</span>
                      </>
                    )}
                  </div>

                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug flex items-center flex-wrap">
                    <span>{product.title}</span>
                    <SmartAssuredBadge />
                  </h1>
                </div>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white shadow-2xs">
                    <span>{product.rating ?? 4.8}</span>
                    <span className="text-[10px]">★</span>
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    Verified Buyer Rating &amp; Certified Genuine
                  </span>
                </div>

                {/* Pricing & Offers Box */}
                <div className="border-t border-b border-slate-100 py-3 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      {discountPercent > 0 && (
                        <>
                          <span className="text-sm font-medium text-slate-400 line-through">
                            ₹{Math.round(product.price * (1 + discountPercent / 100)).toLocaleString('en-IN')}
                          </span>
                          <span className="text-sm font-bold text-emerald-600">
                            {discountPercent}% off
                          </span>
                        </>
                      )}
                    </div>
                    {outOfStock ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                        OUT OF STOCK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                        In Stock ({product.stock} available)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-semibold text-emerald-600">
                    Special price available. Inclusive of all taxes &amp; Brand Warranty.
                  </p>
                </div>

                {/* Available Offers Section */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Available Offers &amp; Discounts
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {product.couponCode && (
                      <li className="flex items-start gap-2 bg-amber-50/90 border border-amber-200 p-2.5 rounded-lg text-amber-950 font-medium">
                        <span className="text-amber-600 font-black shrink-0">🏷️ Exclusive Promo</span>
                        <span>
                          Apply coupon <strong className="bg-white px-2 py-0.5 rounded border border-amber-300 font-mono font-black text-amber-700 select-all cursor-pointer">{product.couponCode}</strong> at checkout!
                        </span>
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold shrink-0">🏷️ Bank Offer</span>
                      <span>10% Instant Discount on HDFC &amp; ICICI Bank Cards up to ₹2,500</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold shrink-0">🏷️ No Cost EMI</span>
                      <span>Avail No Cost EMI on Credit Cards up to 12 months</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold shrink-0">🏷️ Brand Warranty</span>
                      <span>{product.warranty || '1 Year Official Manufacturer Warranty'} included</span>
                    </li>
                  </ul>
                </div>

                {/* Highlights & Description */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Product Overview
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {product.description || 'High performance genuine electronics backed by SmartElectronics standard warranty.'}
                  </p>
                </div>

                {/* Delivery & Warranty Trust Badges */}
                <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
                  <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="block text-base">⚡</span>
                    <span className="text-[10px] font-bold text-slate-800 block">Express Delivery</span>
                    <span className="text-[9px] text-slate-500">2-3 Business Days</span>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="block text-base">🛡️</span>
                    <span className="text-[10px] font-bold text-slate-800 block">Brand Warranty</span>
                    <span className="text-[9px] text-slate-500">{product.warranty ? '100% Genuine' : '1 Year Brand'}</span>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="block text-base">🔄</span>
                    <span className="text-[10px] font-bold text-slate-800 block">7-Day Replacement</span>
                    <span className="text-[9px] text-slate-500">Tech guarantee</span>
                  </div>
                </div>
              </div>

              {/* Wishlist Button in Footer of Right Col */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Seller: <span className="text-blue-600 font-bold">SmartElectronics Authorized Store</span> (4.9 ★)
                </span>
                <WishlistButton product={product} />
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated Category-Wise Specifications Table */}
        <ProductSpecifications
          category={product.category}
          subCategory={product.subCategory}
          brand={product.brand}
          sku={product.sku}
          warranty={product.warranty}
          specifications={product.specifications}
        />

        {/* Related & Recently Viewed Sections */}
        <div className="mt-8 space-y-8">
          <RelatedProducts product={product} allProducts={products} />
          {recentlyViewed.length > 1 && (
            <RecentlyViewed products={recentlyViewed} currentId={product.id} />
          )}
        </div>
      </div>
    </div>
  );
}
