'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminHeader from '../../../components/AdminHeader';
import { ApiClient } from '../../../lib/apiClient';
import { useToast } from '../../../components/ToastProvider';
import { Button, ButtonLink, DeleteConfirmModal } from '../../../components/ui';
import {
  ArrowLeft,
  Ticket,
  Percent,
  IndianRupee,
  Save,
  Trash2,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface PromoErrors {
  code?: string;
  label?: string;
  type?: string;
  value?: string;
  minOrder?: string;
}

export default function EditPromocodePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const promoId = params.id as string;
  const formTopRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<PromoErrors>({});

  const [formData, setFormData] = useState({
    code: '',
    label: '',
    type: 'percent' as 'percent' | 'flat',
    value: '',
    minOrder: '0',
    usageLimitPerUser: '1',
    active: true,
    appliesTo: 'all' as 'all' | 'products',
  });

  // Prefetch existing promocode
  useEffect(() => {
    async function loadPromocode() {
      setInitialLoading(true);
      try {
        const res = await ApiClient.get(`/admin/coupons/${promoId}`);
        const coupon = res.data?.coupon || res.data;
        if (res.success && coupon) {
          setFormData({
            code: coupon.code || '',
            label: coupon.label || '',
            type: coupon.type || 'percent',
            value: String(coupon.value ?? ''),
            minOrder: String(coupon.minOrder ?? '0'),
            usageLimitPerUser: String(coupon.usageLimitPerUser ?? '1'),
            active: Boolean(coupon.active),
            appliesTo: (coupon.appliesTo === 'products' ? 'products' : 'all'),
          });
        } else {
          toast('Promocode not found in system', 'error');
        }
      } catch (err) {
        toast('Failed to load promocode details', 'error');
      } finally {
        setInitialLoading(false);
      }
    }

    if (promoId) {
      loadPromocode();
    }
  }, [promoId, toast]);

  const validate = (data: typeof formData): PromoErrors => {
    const errs: PromoErrors = {};

    const cleanCode = data.code.trim();
    if (!cleanCode) {
      errs.code = 'Promo code is required and cannot be empty.';
    } else if (cleanCode.length < 3) {
      errs.code = 'Promo code must be at least 3 characters long.';
    } else if (!/^[A-Z0-9_-]+$/i.test(cleanCode)) {
      errs.code = 'Code can only contain letters, numbers, hyphens, and underscores.';
    }

    if (!data.label.trim()) {
      errs.label = 'Campaign label / description is required.';
    }

    if (!data.value || data.value.trim() === '') {
      errs.value = 'Discount value is required.';
    } else {
      const v = Number(data.value);
      if (isNaN(v) || v <= 0) {
        errs.value = 'Discount value must be greater than 0.';
      } else if (data.type === 'percent' && v > 99) {
        errs.value = 'Percentage discount cannot exceed 99%.';
      }
    }

    if (data.minOrder && data.minOrder.trim() !== '') {
      const m = Number(data.minOrder);
      if (isNaN(m) || m < 0) {
        errs.minOrder = 'Minimum order value cannot be negative.';
      }
    }

    return errs;
  };

  const handleChange = (field: keyof typeof formData, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    if (submitted || touched[field]) {
      const validation = validate(updated);
      setErrors(validation);
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const validation = validate(formData);
    setErrors(validation);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    setTouched({
      code: true,
      label: true,
      type: true,
      value: true,
      minOrder: true,
    });

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast('Please resolve the validation errors before saving', 'error');
      if (formTopRef.current) {
        formTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    setLoading(true);
    try {
      const res = await ApiClient.put(`/admin/coupons/${promoId}`, {
        code: formData.code.trim().toUpperCase(),
        label: formData.label.trim(),
        type: formData.type,
        value: Number(formData.value),
        minOrder: formData.minOrder ? Number(formData.minOrder) : 0,
        usageLimitPerUser: formData.usageLimitPerUser ? Number(formData.usageLimitPerUser) : 1,
        active: formData.active,
        appliesTo: formData.appliesTo,
      });

      if (res.success) {
        toast('Promocode updated successfully!', 'success');
        router.push('/promocodes');
      } else {
        toast(res.message || 'Failed to update promocode', 'error');
      }
    } catch (err: any) {
      toast('Error connecting to promocode API', 'error');
    } finally {
      setLoading(false);
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await ApiClient.delete(`/admin/coupons/${promoId}`);
      if (res.success) {
        toast(`Promocode "${formData.code}" deleted successfully`, 'success');
        setShowDeleteModal(false);
        router.push('/promocodes');
      } else {
        toast(res.message || 'Failed to delete promocode', 'error');
      }
    } catch (err) {
      toast('Error deleting promocode', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const displayVal = Number(formData.value) || 0;
  const displayMin = Number(formData.minOrder) || 0;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Edit Promotional Discount Code"
          subtitle={`Modifying discount voucher specifications for record: ${formData.code || promoId}`}
        />

        <main className="p-6 space-y-6 flex-1 max-w-5xl w-full">
          <div ref={formTopRef} />

          {/* Breadcrumbs Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Link href="/dashboard" className="hover:text-blue-600 transition">
                Dashboard
              </Link>
              <span>/</span>
              <Link href="/promocodes" className="hover:text-blue-600 transition">
                Coupons &amp; Promos
              </Link>
              <span>/</span>
              <span className="text-slate-700 font-bold">Edit Coupon</span>
            </div>

            <Link
              href="/promocodes"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Promocodes List</span>
            </Link>
          </div>

          {initialLoading ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center text-xs text-slate-400 space-y-3">
              <Ticket className="w-8 h-8 text-slate-300 mx-auto animate-pulse" />
              <p>Loading promocode data from store database...</p>
            </div>
          ) : (
            <>
              {/* Error Summary Banner */}
              {submitted && Object.keys(errors).length > 0 && (
                <div className="bg-rose-50 border border-rose-200/90 rounded-2xl p-4 flex items-start gap-3 text-rose-900 shadow-xs animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-bold text-xs text-rose-900">
                      Please resolve the {Object.keys(errors).length} required {Object.keys(errors).length === 1 ? 'field issue' : 'field issues'} before saving:
                    </h4>
                    <ul className="list-disc list-inside text-[11px] font-semibold mt-1 space-y-0.5 text-rose-700">
                      {Object.values(errors).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Main Grid: Form Left, Voucher Preview Right */}
              <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left 2 Cols: Form Inputs */}
                <div className="lg:col-span-2 space-y-6">
                  
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Ticket className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Voucher Details</h3>
                        <p className="text-[11px] text-slate-400">Modify code identifier and discount rules</p>
                      </div>
                    </div>

                    <div className="space-y-4 text-xs">
                      
                      {/* Promo Code Input */}
                      <div>
                        <div className="mb-1.5">
                          <label htmlFor="edit-promo-code" className="font-bold text-slate-800 text-xs flex items-center gap-1">
                            <span>Promocode (Voucher Code)</span>
                            <span className="text-rose-500 font-black">*</span>
                          </label>
                        </div>
                        <input
                          id="edit-promo-code"
                          type="text"
                          value={formData.code}
                          onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                          onBlur={() => handleBlur('code')}
                          placeholder="e.g. FESTIVE25"
                          className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-slate-900 uppercase font-mono font-bold outline-none transition ${
                            (submitted || touched.code) && errors.code
                              ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                              : 'border-slate-200 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10'
                          }`}
                        />
                        {(submitted || touched.code) && errors.code && (
                          <p className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 mt-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                            <span>{errors.code}</span>
                          </p>
                        )}
                      </div>

                      {/* Campaign Label / Description */}
                      <div>
                        <div className="mb-1.5">
                          <label htmlFor="edit-promo-label" className="font-bold text-slate-800 text-xs flex items-center gap-1">
                            <span>Campaign Label / Description</span>
                            <span className="text-rose-500 font-black">*</span>
                          </label>
                        </div>
                        <input
                          id="edit-promo-label"
                          type="text"
                          value={formData.label}
                          onChange={(e) => handleChange('label', e.target.value)}
                          onBlur={() => handleBlur('label')}
                          placeholder="e.g. 25% off on orders above ₹1,000"
                          className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-slate-900 font-medium outline-none transition ${
                            (submitted || touched.label) && errors.label
                              ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                              : 'border-slate-200 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10'
                          }`}
                        />
                        {(submitted || touched.label) && errors.label && (
                          <p className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 mt-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                            <span>{errors.label}</span>
                          </p>
                        )}
                      </div>

                      {/* Discount Type & Value Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Discount Type */}
                        <div>
                          <div className="mb-1.5">
                            <label htmlFor="edit-promo-type" className="font-bold text-slate-800 text-xs flex items-center gap-1">
                              <span>Discount Type</span>
                              <span className="text-rose-500 font-black">*</span>
                            </label>
                          </div>
                          <select
                            id="edit-promo-type"
                            value={formData.type}
                            onChange={(e) => handleChange('type', e.target.value as 'percent' | 'flat')}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-bold outline-none focus:bg-white focus:border-indigo-600 cursor-pointer"
                          >
                            <option value="percent">Percentage (% OFF)</option>
                            <option value="flat">Flat Cash Discount (₹)</option>
                          </select>
                        </div>

                        {/* Discount Value */}
                        <div>
                          <div className="mb-1.5">
                            <label htmlFor="edit-promo-value" className="font-bold text-slate-800 text-xs flex items-center gap-1">
                              <span>{formData.type === 'percent' ? 'Discount Percentage (%)' : 'Discount Amount (₹)'}</span>
                              <span className="text-rose-500 font-black">*</span>
                            </label>
                          </div>
                          <input
                            id="edit-promo-value"
                            type="number"
                            min="1"
                            max={formData.type === 'percent' ? 99 : undefined}
                            value={formData.value}
                            onChange={(e) => handleChange('value', e.target.value)}
                            onBlur={() => handleBlur('value')}
                            placeholder={formData.type === 'percent' ? '15' : '100'}
                            className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-slate-900 font-bold outline-none transition ${
                              (submitted || touched.value) && errors.value
                                ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                                : 'border-slate-200 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10'
                            }`}
                          />
                          {(submitted || touched.value) && errors.value && (
                            <p className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 mt-1.5">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                              <span>{errors.value}</span>
                            </p>
                          )}
                        </div>

                      </div>

                      {/* Minimum Order Value Requirement */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label htmlFor="edit-promo-minorder" className="font-bold text-slate-800 text-xs">
                            Minimum Cart Order Value (₹)
                          </label>
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
                            Optional
                          </span>
                        </div>
                        <input
                          id="edit-promo-minorder"
                          type="number"
                          min="0"
                          value={formData.minOrder}
                          onChange={(e) => handleChange('minOrder', e.target.value)}
                          onBlur={() => handleBlur('minOrder')}
                          placeholder="e.g. 500 (Leave 0 for no minimum requirement)"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-medium outline-none focus:bg-white focus:border-indigo-600 transition"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          Customers must have at least this subtotal in their cart to apply this promo code.
                        </p>
                      </div>

                      {/* Usage Limit Per Customer */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label htmlFor="edit-promo-limit" className="font-bold text-slate-800 text-xs">
                            Usage Limit Per Customer (User-wise limit)
                          </label>
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
                            Default: 1 use
                          </span>
                        </div>
                        <input
                          id="edit-promo-limit"
                          type="number"
                          min="1"
                          value={formData.usageLimitPerUser}
                          onChange={(e) => handleChange('usageLimitPerUser', e.target.value)}
                          placeholder="1"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-medium outline-none focus:bg-white focus:border-indigo-600 transition"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          Max redemptions allowed per customer (checked by account &amp; email). Default 1 use prevents promo abuse (Flipkart/Amazon style).
                        </p>
                      </div>

                      {/* Applicability Scope */}
                      <div>
                        <label className="font-bold text-slate-800 text-xs block mb-1.5">
                          Coupon Product Scope
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => handleChange('appliesTo', 'all')}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                              formData.appliesTo === 'all'
                                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold ring-2 ring-indigo-500/20'
                                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 font-medium'
                            }`}
                          >
                            <span className="block text-xs">🌐 All Products</span>
                            <span className="text-[10px] text-slate-400">Storewide coupon valid across the catalog</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleChange('appliesTo', 'products')}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                              formData.appliesTo === 'products'
                                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold ring-2 ring-indigo-500/20'
                                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 font-medium'
                            }`}
                          >
                            <span className="block text-xs">📦 Specific Products</span>
                            <span className="text-[10px] text-slate-400">Restricted only to assigned catalog items</span>
                          </button>
                        </div>
                      </div>

                      {/* Active Toggle Switch */}
                      <div className="pt-2 flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div>
                          <span className="font-bold text-slate-800 block text-xs">Promocode Active Status</span>
                          <span className="text-[11px] text-slate-400">Enable or disable this discount voucher immediately in the store</span>
                        </div>
                        <input
                          type="checkbox"
                          id="edit-promo-active"
                          checked={formData.active}
                          onChange={(e) => handleChange('active', e.target.checked)}
                          className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                        />
                      </div>

                    </div>
                  </div>

                </div>

                {/* Right 1 Col: Live Ticket Voucher Preview & Submit */}
                <div className="space-y-6">
                  
                  {/* Live Ticket Card */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Live Voucher Preview
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    </div>

                    {/* Perforated Coupon Ticket */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 text-white p-5 shadow-lg shadow-indigo-600/20">
                      <div className="flex items-center justify-between pb-3 border-b border-dashed border-indigo-400/50">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-200">
                          SmartElectronics Coupon
                        </span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          formData.active ? 'bg-emerald-400 text-slate-950' : 'bg-slate-300 text-slate-800'
                        }`}>
                          {formData.active ? 'Active' : 'Draft'}
                        </span>
                      </div>

                      <div className="py-4 space-y-1">
                        <p className="text-3xl font-black tracking-tight">
                          {formData.type === 'percent' ? `${displayVal}% OFF` : `₹${displayVal.toLocaleString()} OFF`}
                        </p>
                        <p className="text-xs text-indigo-100 line-clamp-2">
                          {formData.label || 'Voucher description preview'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-dashed border-indigo-400/50 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-indigo-300 block">Promo Code</span>
                          <span className="font-mono font-black text-sm text-amber-300">
                            {formData.code || 'CODE2026'}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[9px] uppercase tracking-wider text-indigo-300 block">Eligibility</span>
                          <span className="text-[11px] font-semibold text-white">
                            {displayMin > 0 ? `Min ₹${displayMin}` : 'No Min'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 px-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Updates immediately in customer checkout upon saving.</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
                    <Button
                      type="submit"
                      disabled={loading}
                      loading={loading}
                      icon={<Save className="w-4 h-4" />}
                      size="lg"
                      className="w-full !rounded-xl !text-xs !uppercase !tracking-wider"
                    >
                      Save Changes
                    </Button>

                    <Button
                      type="button"
                      variant="danger"
                      size="md"
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={handleDelete}
                      className="w-full !rounded-xl"
                    >
                      Delete Promocode
                    </Button>

                    <ButtonLink
                      href="/promocodes"
                      variant="ghost"
                      size="sm"
                      className="w-full !text-slate-500 hover:!text-slate-800"
                    >
                      Cancel &amp; Return to List
                    </ButtonLink>
                  </div>

                </div>

              </form>
            </>
          )}

        </main>
      </div>

      {/* Common Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => !deleting && setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete Promo Code"
        itemName={formData.code}
        message={`Are you sure you want to permanently delete promocode "${formData.code}"? Customers will immediately lose access to this coupon discount.`}
      />
    </div>
  );
}
