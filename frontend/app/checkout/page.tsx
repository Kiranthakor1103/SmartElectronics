'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/lib/redux/hooks';
import { clearCart, addToCart, decrementQuantity, removeFromCart, syncCartStock } from '@/app/lib/redux/features/cart/cartSlice';
import { ProductService } from '@/services/productService';
import { useToast } from '@/app/components/ToastProvider';
import { ApiClient } from '@/lib/api/apiClient';
import PromoCodeInput from '@/app/components/PromoCodeInput';
import {
  ShieldCheck,
  CheckCircle2,
  MapPin,
  CreditCard,
  Truck,
  User as UserIcon,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  Building,
  Home,
  Check,
} from 'lucide-react';

interface AddressData {
  fullName: string;
  phone: string;
  pincode: string;
  locality: string;
  address: string;
  city: string;
  state: string;
  addressType: 'Home' | 'Work';
}

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const cartItems = useAppSelector((state) => state.cart.items);
  const { subtotal, discount, shipping, total, coupon } = useAppSelector((state) => state.cart);

  const outOfStockItems = cartItems.filter((i) => typeof i.stock === 'number' && i.stock <= 0);
  const hasOutOfStockItems = outOfStockItems.length > 0;

  const [mounted, setMounted] = useState(false);

  // Live stock synchronization: verify items in checkout reflect real-time inventory
  useEffect(() => {
    if (cartItems.length > 0) {
      Promise.all(
        cartItems.map((item) =>
          ProductService.getProductById(item.id).then((fresh) =>
            fresh && typeof fresh.stock === 'number' ? { id: item.id, stock: fresh.stock } : null
          )
        )
      ).then((results) => {
        const validUpdates = results.filter(Boolean) as { id: number; stock: number }[];
        if (validUpdates.length > 0) {
          dispatch(syncCartStock(validUpdates));
        }
      });
    }
  }, [cartItems.length, dispatch]);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'upi'>('cod');

  const [address, setAddress] = useState<AddressData>({
    fullName: '',
    phone: '',
    pincode: '',
    locality: '',
    address: '',
    city: '',
    state: '',
    addressType: 'Home',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load saved address and user session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        try {
          const parsed = JSON.parse(storedUser);
          setCurrentUser(parsed);
          setAddress((prev) => ({
            ...prev,
            fullName: prev.fullName || parsed.name || '',
            phone: prev.phone || parsed.phone || '',
          }));
          setActiveStep(2); // If logged in, automatically proceed to Address step
        } catch {}
      }

      const savedAddress = localStorage.getItem('kt_shipping_address');
      if (savedAddress) {
        try {
          const parsedAddr = JSON.parse(savedAddress);
          setAddress(parsedAddr);
        } catch {}
      }
    }
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-100/70 py-6 sm:py-10 text-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:px-8 rounded-2xl border border-slate-200/80 shadow-xs mb-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-slate-100 animate-pulse" />
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-[#4f46e5]">KT</span>
                <span className="text-2xl font-bold tracking-tight text-slate-900">Store</span>
                <span className="ml-2 text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full select-none">
                  CHECKOUT
                </span>
              </div>
            </div>
            <div className="h-8 w-48 rounded-xl bg-slate-100 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-4">
              <div className="h-28 rounded-2xl border border-slate-200/80 bg-white p-6 animate-pulse" />
              <div className="h-28 rounded-2xl border border-slate-200/80 bg-white p-6 animate-pulse" />
              <div className="h-28 rounded-2xl border border-slate-200/80 bg-white p-6 animate-pulse" />
              <div className="h-28 rounded-2xl border border-slate-200/80 bg-white p-6 animate-pulse" />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <div className="h-28 rounded-2xl border border-slate-200/80 bg-white p-6 animate-pulse" />
              <div className="h-64 rounded-2xl border border-slate-200/80 bg-white p-6 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
            <Truck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Your Checkout is Empty</h2>
          <p className="text-sm text-slate-500 mt-2 mb-6">
            Please add items to your cart before proceeding to checkout.
          </p>
          <Link
            href="/products"
            className="inline-block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl shadow-sm transition"
          >
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.fullName || !address.phone || !address.pincode || !address.address || !address.city || !address.state) {
      toast('Please fill in all required delivery address fields', 'error');
      return;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('kt_shipping_address', JSON.stringify(address));
    }
    setActiveStep(3); // Move to Order Summary
    toast('Delivery address saved', 'success');
  };

  const handlePlaceOrder = async () => {
    const outItem = cartItems.find((item) => typeof item.stock === 'number' && item.stock <= 0);
    if (outItem) {
      toast(`Cannot place order: "${outItem.title}" is out of stock. Please remove it from your cart.`, 'error');
      return;
    }

    if (!address.fullName || !address.phone || !address.address) {
      toast('Please complete delivery address step first', 'error');
      setActiveStep(2);
      return;
    }

    setIsProcessing(true);

    const payload = {
      items: cartItems.map((item) => ({
        id: item.id,
        title: item.title,
        productName: item.title,
        price: item.price,
        quantity: item.quantity,
        thumbnail: item.thumbnail,
      })),
      subtotal,
      discount,
      shipping,
      total,
      couponCode: coupon?.code ?? '',
      shippingAddress: address,
      userId: currentUser?.id || (currentUser as any)?._id || undefined,
      customerEmail: currentUser?.email || guestEmail || 'guest@ktstore.com',
      customerPhone: address.phone || guestPhone,
      customerName: address.fullName || currentUser?.name || 'Customer',
      paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'card' ? 'Stripe Card' : 'UPI',
      clientUrl: typeof window !== 'undefined' ? window.location.origin : undefined,
    };

    // Save current order snapshot locally for receipt generation on success page
    if (typeof window !== 'undefined') {
      localStorage.setItem('kt_last_order', JSON.stringify(payload));
    }

    try {
      if (paymentMethod === 'cod') {
        // Cash on Delivery Order - Synchronous Backend Creation
        const codSessionId = `cs_cod_${Date.now()}`;
        const orderPayload = {
          ...payload,
          sessionId: codSessionId,
          paymentMethod: 'cod',
          paymentStatus: 'pending',
          status: 'placed',
        };

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('authToken') : null;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        let targetSessionId = codSessionId;
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers,
          body: JSON.stringify(orderPayload),
        });
        const resData = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(resData.message || resData.error || 'Failed to place order. Please check item stock.');
        }

        const created = resData.data || resData.order;
        if (created?.stripeSessionId) {
          targetSessionId = created.stripeSessionId;
        }

        dispatch(clearCart());
        toast('Order placed successfully with Cash on Delivery!', 'success');
        router.push(`/success?session_id=${targetSessionId}&payment_method=cod`);
      } else {
        // Online Stripe Card / UPI Checkout
        const data = await ApiClient.post<{ url?: string; sessionId?: string }>('/checkout', payload);

        if (!data.success) {
          throw new Error(data.message || 'Payment initiation failed. Please verify product availability.');
        }

        const redirectUrl = data.data?.url || (data as any).url;
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          throw new Error('Payment gateway URL not received. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast(err.message || 'Checkout failed. Please review your cart items.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-100/70 py-6 sm:py-10 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Flipkart Checkout Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:px-8 rounded-2xl border border-slate-200/80 shadow-xs mb-6">
          <div className="flex items-center gap-3">
            <Link href="/cart" className="p-2 hover:bg-slate-100 rounded-xl transition">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-[#4f46e5]">KT</span>
              <span className="text-2xl font-bold tracking-tight text-slate-900">Store</span>
              <span className="ml-2 text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full select-none">
                CHECKOUT
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-xl text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            100% Safe & Secure Checkout
          </div>
        </div>

        {/* Main Grid: Left Steps + Right Order Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Flipkart 4-Step Accordion */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* ── STEP 1: LOGIN / GUEST DETAIL ── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
              <div
                onClick={() => setActiveStep(1)}
                className={`p-4 sm:p-5 flex items-center justify-between cursor-pointer transition ${
                  activeStep === 1 ? 'bg-[#4f46e5] text-white' : 'bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                    activeStep === 1 ? 'bg-white text-[#4f46e5]' : 'bg-slate-100 text-slate-600'
                  }`}>
                    1
                  </span>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base tracking-tight uppercase">
                      LOGIN / GUEST CONTACT
                    </h3>
                    {currentUser && activeStep !== 1 && (
                      <p className="text-xs text-slate-500 font-medium">{currentUser.name} ({currentUser.email})</p>
                    )}
                  </div>
                </div>

                {currentUser ? (
                  <span className="flex items-center gap-1 text-xs font-bold bg-emerald-500 text-white px-2.5 py-1 rounded-lg">
                    <Check className="w-3.5 h-3.5" /> Logged In
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-indigo-100 hover:underline">Change / Edit</span>
                )}
              </div>

              {activeStep === 1 && (
                <div className="p-6 border-t border-slate-100">
                  {currentUser ? (
                    <div className="flex items-center justify-between bg-emerald-50/60 border border-emerald-200/70 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                          {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                          <p className="text-xs text-slate-500">{currentUser.email}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveStep(2)}
                        className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition uppercase tracking-wider"
                      >
                        Continue to Delivery Address →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-blue-50/70 border border-blue-100 p-3.5 rounded-xl text-xs text-blue-900">
                        ⚡ <strong>Guest Checkout Available</strong>: You can purchase without registering! Or log in for saved orders.
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                            Email Address (For Order Updates)
                          </label>
                          <input
                            type="email"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            placeholder="guest@example.com"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-[#4f46e5]"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                            Mobile Phone Number
                          </label>
                          <input
                            type="tel"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            placeholder="10-digit mobile number"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-[#4f46e5]"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                        <Link href="/login?redirect=/checkout" className="text-xs font-bold text-[#4f46e5] hover:underline">
                          Already have an account? Log In
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            if (!guestEmail && !guestPhone) {
                              toast('Please enter email or mobile number to continue as guest', 'info');
                            }
                            setActiveStep(2);
                          }}
                          className="w-full sm:w-auto bg-[#fb641b] hover:bg-[#e05615] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-xs transition uppercase tracking-wider"
                        >
                          Continue as Guest →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── STEP 2: DELIVERY ADDRESS ── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
              <div
                onClick={() => setActiveStep(2)}
                className={`p-4 sm:p-5 flex items-center justify-between cursor-pointer transition ${
                  activeStep === 2 ? 'bg-[#4f46e5] text-white' : 'bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                    activeStep === 2 ? 'bg-white text-[#4f46e5]' : 'bg-slate-100 text-slate-600'
                  }`}>
                    2
                  </span>
                  <h3 className="font-bold text-sm sm:text-base tracking-tight uppercase">
                    DELIVERY ADDRESS
                  </h3>
                </div>
                {address.address && activeStep !== 2 && (
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                    {address.city}, {address.pincode}
                  </span>
                )}
              </div>

              {activeStep === 2 && (
                <form onSubmit={handleAddressSubmit} className="p-6 border-t border-slate-100 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={address.fullName}
                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                        placeholder="John Doe"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-[#4f46e5]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                        10-Digit Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        placeholder="9876543210"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-[#4f46e5]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={address.pincode}
                        onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                        placeholder="110001"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-[#4f46e5]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                        Locality / Sector
                      </label>
                      <input
                        type="text"
                        value={address.locality}
                        onChange={(e) => setAddress({ ...address, locality: e.target.value })}
                        placeholder="Connaught Place"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-[#4f46e5]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                      Flat, House No., Building, Street Address *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={address.address}
                      onChange={(e) => setAddress({ ...address, address: e.target.value })}
                      placeholder="Flat 402, Sunshine Apartments, MG Road"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-[#4f46e5]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                        City / District *
                      </label>
                      <input
                        type="text"
                        required
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        placeholder="New Delhi"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-[#4f46e5]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500 block mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        placeholder="Delhi"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-[#4f46e5]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 block mb-1.5">
                      Address Type
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setAddress({ ...address, addressType: 'Home' })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition ${
                          address.addressType === 'Home'
                            ? 'bg-blue-50 border-[#4f46e5] text-[#4f46e5]'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <Home className="w-4 h-4" /> Home (All day delivery)
                      </button>

                      <button
                        type="button"
                        onClick={() => setAddress({ ...address, addressType: 'Work' })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition ${
                          address.addressType === 'Work'
                            ? 'bg-blue-50 border-[#4f46e5] text-[#4f46e5]'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <Building className="w-4 h-4" /> Work (10 AM - 6 PM)
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="bg-[#fb641b] hover:bg-[#e05615] text-white text-xs font-bold px-8 py-3 rounded-xl shadow-md transition uppercase tracking-wider"
                    >
                      Save &amp; Deliver Here →
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* ── STEP 3: ORDER SUMMARY ── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
              <div
                onClick={() => setActiveStep(3)}
                className={`p-4 sm:p-5 flex items-center justify-between cursor-pointer transition ${
                  activeStep === 3 ? 'bg-[#4f46e5] text-white' : 'bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                    activeStep === 3 ? 'bg-white text-[#4f46e5]' : 'bg-slate-100 text-slate-600'
                  }`}>
                    3
                  </span>
                  <h3 className="font-bold text-sm sm:text-base tracking-tight uppercase">
                    ORDER SUMMARY ({cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'})
                  </h3>
                </div>
              </div>

              {activeStep === 3 && (
                <div className="p-6 border-t border-slate-100 space-y-4">
                  {hasOutOfStockItems && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
                      ⚠️ One or more items in your order are currently out of stock. Please return to your cart and remove them before continuing.
                    </div>
                  )}
                  {cartItems.map((item) => {
                    const itemImg = item.thumbnail || item.images?.[0] || '/placeholder.svg';
                    const isOut = typeof item.stock === 'number' && item.stock <= 0;
                    return (
                      <div key={item.id} className="flex gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                        <div className="relative w-20 h-20 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shrink-0">
                          <Image src={itemImg} alt={item.title} fill className="object-contain p-2" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{item.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{item.brand || 'Category item'}</p>
                          {isOut && (
                            <span className="mt-1 inline-block rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                              OUT OF STOCK
                            </span>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-sm font-extrabold text-slate-900">₹{item.price.toLocaleString()}</span>
                            <span className="text-xs text-slate-400">Qty: {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 font-semibold">
                    <span>⚡ Standard Delivery: Guaranteed delivery in 3 - 5 business days</span>
                    <span className="text-emerald-700 font-bold">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={hasOutOfStockItems}
                      onClick={() => setActiveStep(4)}
                      className="bg-[#fb641b] hover:bg-[#e05615] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold px-8 py-3 rounded-xl shadow-md transition uppercase tracking-wider"
                    >
                      {hasOutOfStockItems ? 'Remove Out of Stock Items' : 'Continue to Payment →'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── STEP 4: PAYMENT OPTIONS ── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
              <div
                onClick={() => setActiveStep(4)}
                className={`p-4 sm:p-5 flex items-center justify-between cursor-pointer transition ${
                  activeStep === 4 ? 'bg-[#4f46e5] text-white' : 'bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                    activeStep === 4 ? 'bg-white text-[#4f46e5]' : 'bg-slate-100 text-slate-600'
                  }`}>
                    4
                  </span>
                  <h3 className="font-bold text-sm sm:text-base tracking-tight uppercase">
                    PAYMENT OPTIONS
                  </h3>
                </div>
              </div>

              {activeStep === 4 && (
                <div className="p-6 border-t border-slate-100 space-y-4">
                  
                  {/* COD Option */}
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                      paymentMethod === 'cod' ? 'bg-blue-50/70 border-[#4f46e5] ring-2 ring-blue-500/20' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-1 accent-[#4f46e5]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">Cash on Delivery (COD)</span>
                        <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">POPULAR</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Pay with Cash, QR code, or UPI upon doorstep delivery.</p>
                    </div>
                  </label>

                  {/* Card Option */}
                  <label
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                      paymentMethod === 'card' ? 'bg-blue-50/70 border-[#4f46e5] ring-2 ring-blue-500/20' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="mt-1 accent-[#4f46e5]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">Credit / Debit Card (Stripe)</span>
                        <span className="text-[10px] font-semibold text-slate-500">Visa, Mastercard, RuPay</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Encrypted, 100% secure online card checkout via Stripe gateway.</p>
                    </div>
                  </label>

                  {/* UPI Option */}
                  <label
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                      paymentMethod === 'upi' ? 'bg-blue-50/70 border-[#4f46e5] ring-2 ring-blue-500/20' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="mt-1 accent-[#4f46e5]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">UPI / QR Code</span>
                        <span className="text-[10px] font-semibold text-slate-500">Google Pay, PhonePe, Paytm</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Instant scan &amp; pay using any UPI app.</p>
                    </div>
                  </label>

                  {/* Final Place Order CTA */}
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={isProcessing || hasOutOfStockItems}
                      className="w-full bg-[#fb641b] hover:bg-[#e05615] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl shadow-lg shadow-orange-500/20 transition uppercase tracking-wider text-base"
                    >
                      {hasOutOfStockItems
                        ? 'Out of Stock Items in Order'
                        : isProcessing
                        ? 'Processing Order…'
                        : paymentMethod === 'cod'
                        ? `CONFIRM ORDER (₹${total.toLocaleString()})`
                        : `PAY NOW ₹${total.toLocaleString()}`}
                    </button>
                  </div>

                </div>
              )}
            </div>

          </div>

          {/* Right Column: Promo Code & Price Details Sidebar */}
          <div className="lg:col-span-4 sticky top-20 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <PromoCodeInput
                userEmail={currentUser?.email || guestEmail}
                userId={currentUser?.id || (currentUser as any)?._id}
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3">
                PRICE DETAILS
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Price ({cartItems.reduce((n, i) => n + i.quantity, 0)} items)</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toLocaleString()}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount{coupon ? ` (${coupon.code})` : ''}</span>
                    <span className="font-bold">−₹{discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charges</span>
                  <span className="font-bold text-emerald-700">
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>

                <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between text-base font-black text-slate-900">
                  <span>Amount Payable</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              {discount > 0 && (
                <div className="bg-emerald-50 border border-emerald-200/80 p-3 rounded-xl text-xs font-bold text-emerald-800 text-center">
                  🎉 You will save ₹{discount.toLocaleString()} on this order!
                </div>
              )}

              <div className="pt-2 text-[11px] text-slate-400 space-y-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>Safe and Secure Payments. 100% Authentic products.</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
