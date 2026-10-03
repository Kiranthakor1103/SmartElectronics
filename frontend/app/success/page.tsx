'use client';

import { useEffect, useRef, useState, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/app/lib/redux/hooks';
import { clearCart, type CartItem } from '@/app/lib/redux/features/cart/cartSlice';
import { Spinner } from '@/app/components/ui/Spinner';
import {
  buildReceiptFromCart,
  downloadOrderPdf,
  type OrderReceiptData,
  type ShippingAddress,
} from '@/app/lib/orderReceipt';

interface SavedOrderData {
  items?: CartItem[];
  subtotal?: number;
  discount?: number;
  shipping?: number;
  total?: number;
  coupon?: { code: string } | null;
  couponCode?: string;
  paymentMethod?: string;
  shippingAddress?: ShippingAddress;
  customerEmail?: string;
  [key: string]: unknown;
}
import { saveOrderToHistory } from '@/app/hooks/useOrderHistory';
import { useToast } from '@/app/components/ToastProvider';
import {
  CheckCircle2,
  FileDown,
  Printer,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';

function SuccessContent() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id') || '';
  const cart = useAppSelector((s) => s.cart);
  const initializedRef = useRef(false);
  const cartSnapshotRef = useRef({
    items: cart.items,
    subtotal: cart.subtotal,
    discount: cart.discount,
    shipping: cart.shipping,
    total: cart.total,
    coupon: cart.coupon,
  });

  if (!initializedRef.current && cart.items.length > 0) {
    cartSnapshotRef.current = {
      items: cart.items,
      subtotal: cart.subtotal,
      discount: cart.discount,
      shipping: cart.shipping,
      total: cart.total,
      coupon: cart.coupon,
    };
  }

  const [copied, setCopied] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (initializedRef.current) return;
    initializedRef.current = true;

    const dateLabel = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    setCurrentDate(dateLabel);

    dispatch(clearCart());
  }, [dispatch, sessionId, mounted]);

  const paymentMethodParam = searchParams.get('payment_method') || '';

  const [savedOrder, setSavedOrder] = useState<SavedOrderData | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const orderRaw = localStorage.getItem('kt_last_order');
      if (orderRaw) {
        try {
          setSavedOrder(JSON.parse(orderRaw));
        } catch {}
      }
    }
  }, []);

  const receipt: OrderReceiptData | null = useMemo(() => {
    if (!sessionId || !mounted) return null;
    const cartData = savedOrder || cartSnapshotRef.current;
    return buildReceiptFromCart(
      sessionId,
      cartData,
      currentDate || new Date().toLocaleString('en-IN'),
      {
        paymentMethod: paymentMethodParam === 'cod' ? 'Cash on Delivery' : savedOrder?.paymentMethod || 'Stripe Card',
        shippingAddress: savedOrder?.shippingAddress,
        customerEmail: savedOrder?.customerEmail,
      }
    );
  }, [sessionId, currentDate, mounted, savedOrder, paymentMethodParam]);

  useEffect(() => {
    if (receipt && receipt.sessionId) {
      saveOrderToHistory({
        sessionId: receipt.sessionId,
        amount: receipt.total,
        itemCount: receipt.items?.length || 1,
        date: receipt.date,
        status: receipt.status?.includes('COD') ? 'pending' : 'paid',
        paymentMethod: receipt.paymentMethod,
        items: receipt.items,
        shippingAddress: receipt.shippingAddress,
      });
    }
  }, [receipt]);

  if (!mounted) {
    return (
      <div className="w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white p-16 shadow-xl">
        <Spinner label="Loading receipt…" />
      </div>
    );
  }

  const copyToClipboard = () => {
    if (!sessionId) return;
    navigator.clipboard.writeText(sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      let targetReceipt = receipt;
      if (!targetReceipt && sessionId) {
        const orderRaw = typeof window !== 'undefined' ? localStorage.getItem('kt_last_order') : null;
        const parsed = orderRaw ? JSON.parse(orderRaw) : {};
        targetReceipt = buildReceiptFromCart(
          sessionId,
          parsed,
          currentDate || new Date().toLocaleString('en-IN'),
          {
            paymentMethod: paymentMethodParam === 'cod' ? 'Cash on Delivery' : parsed.paymentMethod || 'Stripe Card',
            shippingAddress: parsed.shippingAddress,
            customerEmail: parsed.customerEmail,
          }
        );
      }

      if (!targetReceipt) {
        toast('Order details not found for receipt', 'error');
        return;
      }

      // Download official formatted tax invoice PDF (v2 layout)
      await downloadOrderPdf(targetReceipt);
      toast('Tax Invoice PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF generation error:', err);
      toast('Failed to generate PDF', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const truncatedId = sessionId
    ? `${sessionId.substring(0, 14)}...${sessionId.substring(sessionId.length - 6)}`
    : '—';

  return (
    <div className="w-full max-w-xl">
      {/* Main Receipt Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl shadow-indigo-950/10">
        
        {/* Signature Royal Indigo Top Ribbon */}
        <div className="h-2.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600" />

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Header Brand & Verified Status */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-indigo-600">KT</span>
                <span className="text-xl font-black tracking-tight text-slate-900">Express</span>
                <span className="text-[10px] font-bold text-white bg-indigo-600 px-1.5 py-0.5 rounded-md uppercase tracking-wider ml-1">
                  Mart
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                Official Tax Invoice &amp; Payment Receipt
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-black uppercase tracking-wider">
                {receipt?.status || 'PAID'}
              </span>
            </div>
          </div>

          {/* Success Notification Message */}
          <div className="text-center py-2 space-y-1">
            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl tracking-tight">
              Order Confirmed!
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Thank you for your purchase. We have received your order and payment.
            </p>
          </div>

          {/* Real-time Order Progress Tracker */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Delivery Tracker
              </span>
              <span className="rounded-full bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                Estimated Delivery: 3-5 Days
              </span>
            </div>

            <div className="relative flex justify-between px-2 pt-1">
              <div className="absolute left-6 right-6 top-4 h-1 -translate-y-1/2 bg-slate-200" />
              <div className="absolute left-6 top-4 h-1 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-violet-600" style={{ width: '40%' }} />

              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold ring-4 ring-indigo-100 shadow-xs">
                  ✓
                </div>
                <span className="mt-1.5 text-[11px] font-bold text-slate-800">Placed</span>
                <span className="text-[9px] text-slate-400">Confirmed</span>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold ring-4 ring-indigo-100 animate-pulse">
                  ✓
                </div>
                <span className="mt-1.5 text-[11px] font-bold text-slate-800">Packed</span>
                <span className="text-[9px] text-indigo-600 font-bold">Ready</span>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-slate-400 text-xs font-bold">
                  3
                </div>
                <span className="mt-1.5 text-[11px] font-semibold text-slate-500">Shipped</span>
                <span className="text-[9px] text-slate-400">In Transit</span>
              </div>

              {/* Step 4 */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-slate-400 text-xs font-bold">
                  4
                </div>
                <span className="mt-1.5 text-[11px] font-semibold text-slate-500">Delivered</span>
                <span className="text-[9px] text-slate-400">Doorstep</span>
              </div>
            </div>
          </div>

          {/* Official Bill Specification Box */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-4 text-xs shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-200">
              <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-lg">
                INV-#{sessionId ? sessionId.slice(-8).toUpperCase() : '2026-KT'}
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">
                {currentDate || 'Today'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-600">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Transaction Ref
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono font-bold text-slate-800 text-[11px] truncate">{truncatedId}</span>
                  {sessionId && (
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="text-slate-400 hover:text-indigo-600 transition p-0.5 cursor-pointer"
                      title="Copy transaction ID"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Payment Method
                </span>
                <span className="font-bold text-slate-800 text-[11px] mt-0.5 block">
                  {receipt?.paymentMethod || 'Stripe Card'}
                </span>
              </div>
            </div>

            {/* Delivery Address Details */}
            {receipt?.shippingAddress && (
              <div className="border-t border-dashed border-slate-200 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Delivery Destination
                </span>
                <p className="font-bold text-slate-900 text-xs">
                  {receipt.shippingAddress.fullName} {receipt.shippingAddress.phone && `(${receipt.shippingAddress.phone})`}
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                  {receipt.shippingAddress.address}{receipt.shippingAddress.locality ? `, ${receipt.shippingAddress.locality}` : ''},{' '}
                  {receipt.shippingAddress.city}, {receipt.shippingAddress.state} - {receipt.shippingAddress.pincode}
                </p>
              </div>
            )}

            {/* Purchased Items List */}
            {receipt && receipt.items.length > 0 && (
              <div className="border-t border-dashed border-slate-200 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Order Items ({receipt.items.length})
                </span>
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {receipt.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-[11px] py-1 border-b border-slate-100 last:border-0">
                      <span className="font-medium text-slate-800 line-clamp-1 flex-1 pr-2">
                        {item.title} <span className="text-slate-400 font-semibold">×{item.quantity}</span>
                      </span>
                      <span className="font-bold text-slate-900 shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Summary Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">₹{(receipt?.subtotal || receipt?.total || 0).toLocaleString('en-IN')}</span>
              </div>

              {receipt && receipt.discount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-semibold">
                  <span>Discount {receipt.couponCode ? `(${receipt.couponCode})` : ''}</span>
                  <span>−₹{receipt.discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600">
                <span>Shipping Fee</span>
                <span className="font-semibold text-emerald-600">
                  {receipt?.shipping === 0 ? 'FREE' : `₹${receipt?.shipping?.toLocaleString('en-IN')}`}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Taxes &amp; GST (18%)</span>
                <span>Included in MRP</span>
              </div>

              <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                <span className="font-black text-slate-900 text-sm">Grand Total Paid</span>
                <span className="font-black text-indigo-700 text-base">
                  ₹{(receipt?.total || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-3 pt-2">
            
            {/* Download PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={!receipt || downloading}
              className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2.5 text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              <span>{downloading ? 'Generating Tax Invoice PDF…' : 'Download Official PDF Receipt'}</span>
            </button>

            {/* Print Receipt Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl border border-slate-200/90 transition flex items-center justify-center gap-2 text-xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Tax Invoice</span>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-3 pt-1">
            <Link
              href="/orders"
              className="flex-1 text-center py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              View Order History
            </Link>
            <Link
              href="/products"
              className="flex-1 text-center py-2.5 px-4 rounded-xl bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
            >
              Continue Shopping →
            </Link>
          </div>

        </div>

        {/* Footer Verification Seal */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>100% Verified Secure Payment • SmartElectronics Customer Protection</span>
        </div>

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-[#f8fafc] px-4 py-12">
      <Suspense
        fallback={
          <div className="w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white p-16 shadow-xl">
            <Spinner label="Loading receipt…" />
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}
