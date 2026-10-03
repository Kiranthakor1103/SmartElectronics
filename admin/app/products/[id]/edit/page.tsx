'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminHeader from '../../../components/AdminHeader';
import { ApiClient } from '../../../lib/apiClient';
import { useToast } from '../../../components/ToastProvider';
import { Button, ButtonLink, ImageUploader, Loader, DeleteConfirmModal } from '../../../components/ui';
import {
  ArrowLeft,
  Package,
  Sparkles,
  Save,
  Image as ImageIcon,
  IndianRupee,
  Trash2,
  AlertCircle,
  Tag,
} from 'lucide-react';

interface FormErrors {
  title?: string;
  category?: string;
  price?: string;
  discountPercentage?: string;
  stock?: string;
  thumbnail?: string;
}

interface AvailableCoupon {
  _id: string;
  code: string;
  label?: string;
  type?: string;
  value?: number;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const productId = params.id as string;
  const formTopRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>([]);

  const ELECTRONICS_SUB_CATEGORIES: Record<string, string[]> = {
    'Mobile & Tablets': ['Smartphones', 'Feature Phones', 'Tablets', 'iPads', 'Mobile Accessories', 'Mobile Cases', 'Screen Protectors'],
    'Laptops & Computers': ['Laptops', 'Gaming Laptops', 'Desktop PCs', 'All-in-One PCs', 'Monitors', 'Mini PCs'],
    'TVs & Entertainment': ['Smart TVs', 'LED TVs', 'LCD TVs', 'OLED TVs', 'QLED TVs', 'Android TVs', 'TV Accessories', 'TV Wall Mounts', 'Set Top Boxes'],
    'Audio Devices': ['Wireless Earbuds', 'Neckbands', 'Headphones', 'Bluetooth Speakers', 'Soundbars', 'Home Theater Systems', 'Microphones'],
    'Smart Devices': ['Smart Watches', 'Smart Bands', 'Smart Home Devices', 'Smart Cameras', 'Smart Lights'],
    'Computer Accessories': ['Keyboards', 'Mouse', 'Webcams', 'Printers', 'Scanners', 'SSD', 'HDD', 'RAM', 'Graphics Cards', 'UPS'],
    'Gaming Zone': ['Gaming Consoles', 'PlayStation', 'Xbox', 'Gaming Controllers', 'Gaming Keyboards', 'Gaming Mouse', 'Gaming Chairs', 'VR Headsets'],
    'Power & Charging': ['Power Banks', 'Mobile Chargers', 'Fast Chargers', 'USB Cables', 'Extension Boards', 'Inverters', 'Batteries'],
    'Home Appliances': ['Refrigerators', 'Washing Machines', 'Microwave Ovens', 'Water Purifiers', 'Dishwashers', 'Vacuum Cleaners', 'Geysers', 'Air Coolers', 'Air Conditioners', 'Room Heaters', 'Electric Kettles', 'Induction Cooktops', 'Mixer Grinders'],
    'Kitchen Appliances': ['Juicers', 'Mixer Grinder', 'Pop-up Toasters', 'Coffee Machines', 'Rice Cookers', 'Air Fryers'],
    'Cameras & Security': ['DSLR Cameras', 'Mirrorless Cameras', 'Action Cameras', 'CCTV Cameras', 'Security Systems', 'Video Doorbells'],
  };

  const [categories, setCategories] = useState<string[]>([
    'Mobile & Tablets',
    'Laptops & Computers',
    'TVs & Entertainment',
    'Audio Devices',
    'Smart Devices',
    'Computer Accessories',
    'Gaming Zone',
    'Power & Charging',
    'Home Appliances',
    'Kitchen Appliances',
    'Cameras & Security',
  ]);

  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    category: 'Mobile & Tablets',
    subCategory: '',
    price: '',
    discountPercentage: '0',
    stock: '0',
    thumbnail: '',
    badge: '',
    featured: false,
    status: 'approved',
    description: '',
    couponCode: '',
  });

  // Load existing product details, categories and active coupons
  useEffect(() => {
    async function loadData() {
      setInitialLoading(true);
      try {
        const [catRes, prodRes, couponRes] = await Promise.all([
          ApiClient.get('/categories'),
          ApiClient.get(`/admin/products/${productId}`),
          ApiClient.get('/admin/coupons?limit=100'),
        ]);

        if (catRes.success && catRes.data?.categories) {
          const catNames: string[] = catRes.data.categories.map((c: any) => c.name);
          const uniqueCats = Array.from(new Set(catNames));
          if (uniqueCats.length > 0) setCategories(uniqueCats);
        }

        if (couponRes.success && couponRes.data?.coupons) {
          setAvailableCoupons(couponRes.data.coupons);
        }

        const prod = prodRes.success ? prodRes.data : null;
        if (prod) {
          setFormData({
            title: prod.title || prod.name || '',
            brand: prod.brand || '',
            category: prod.category || 'Mobile & Tablets',
            subCategory: prod.subCategory || '',
            price: String(prod.price ?? ''),
            discountPercentage: String(prod.discountPercentage ?? 0),
            stock: String(prod.stock ?? 0),
            thumbnail: prod.thumbnail || prod.image || '',
            badge: prod.badge || '',
            featured: Boolean(prod.featured),
            status: prod.status || 'approved',
            description: prod.description || '',
            couponCode: prod.couponCode || '',
          });
        } else {
          toast('Product not found in store catalog', 'error');
        }
      } catch (err) {
        toast('Failed to load product details', 'error');
      } finally {
        setInitialLoading(false);
      }
    }

    if (productId) {
      loadData();
    }
  }, [productId, toast]);

  // Validation function
  const validate = (data: typeof formData): FormErrors => {
    const errs: FormErrors = {};

    // Title validation
    if (!data.title.trim()) {
      errs.title = 'Product title is required and cannot be empty.';
    } else if (data.title.trim().length < 3) {
      errs.title = 'Product title must be at least 3 characters long.';
    }

    // Category validation
    if (!data.category || !data.category.trim()) {
      errs.category = 'Please select a valid product category.';
    }

    // Price validation
    if (!data.price || data.price.trim() === '') {
      errs.price = 'Regular price is required.';
    } else {
      const p = Number(data.price);
      if (isNaN(p) || p <= 0) {
        errs.price = 'Price must be a valid amount greater than ₹0.';
      }
    }

    // Discount validation
    if (data.discountPercentage !== '' && data.discountPercentage !== undefined) {
      const d = Number(data.discountPercentage);
      if (isNaN(d) || d < 0 || d > 99) {
        errs.discountPercentage = 'Discount percentage must be between 0% and 99%.';
      }
    }

    // Stock validation
    if (data.stock === '' || data.stock === null || data.stock === undefined) {
      errs.stock = 'Stock quantity is required.';
    } else {
      const s = Number(data.stock);
      if (isNaN(s) || s < 0) {
        errs.stock = 'Stock quantity must be 0 or greater (cannot be negative).';
      }
    }

    // Thumbnail validation
    if (!data.thumbnail.trim()) {
      errs.thumbnail = 'Please upload a product image or provide an image URL.';
    } else if (
      !data.thumbnail.startsWith('/') &&
      !/^https?:\/\/.+/i.test(data.thumbnail.trim()) &&
      !data.thumbnail.startsWith('data:')
    ) {
      errs.thumbnail = 'Please provide a valid image URL (http://, https://) or upload an image file.';
    }

    return errs;
  };

  const handleChange = (field: keyof typeof formData, value: any) => {
    const updated = { ...formData, [field]: value };

    // Auto update subcategory when category changes
    if (field === 'category') {
      const newSubs = ELECTRONICS_SUB_CATEGORIES[value] || ['General'];
      updated.subCategory = newSubs[0];
    }

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

  // Compute live discounted price preview
  const numPrice = Number(formData.price) || 0;
  const numDiscount = Number(formData.discountPercentage) || 0;
  const finalPrice = numDiscount > 0 ? Math.round(numPrice * (1 - numDiscount / 100)) : numPrice;
  const availableSubCategories = ELECTRONICS_SUB_CATEGORIES[formData.category] || ['General'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    // Mark all required fields as touched
    setTouched({
      title: true,
      category: true,
      price: true,
      discountPercentage: true,
      stock: true,
      thumbnail: true,
    });

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast('Please resolve the required field validation errors before saving', 'error');
      if (formTopRef.current) {
        formTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    setLoading(true);
    try {
      const res = await ApiClient.put(`/admin/products/${productId}`, {
        title: formData.title.trim(),
        name: formData.title.trim(),
        brand: formData.brand.trim() || 'Generic',
        category: formData.category,
        subCategory: formData.subCategory.trim(),
        price: Number(formData.price),
        discountPercentage: Number(formData.discountPercentage || 0),
        stock: Number(formData.stock || 0),
        thumbnail: formData.thumbnail.trim(),
        image: formData.thumbnail.trim(),
        images: [formData.thumbnail.trim()],
        badge: formData.badge,
        featured: formData.featured,
        status: formData.status,
        description: formData.description.trim(),
        couponCode: formData.couponCode.trim().toUpperCase(),
      });

      if (res.success) {
        toast('Product updated successfully!', 'success');
        router.push('/products');
      } else {
        toast(res.message || 'Failed to update product', 'error');
      }
    } catch (err) {
      toast('Error saving product changes', 'error');
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
      const res = await ApiClient.delete(`/admin/products/${productId}`);
      if (res.success) {
        toast(`Product "${formData.title}" deleted successfully`, 'success');
        setShowDeleteModal(false);
        router.push('/products');
      } else {
        toast(res.message || 'Failed to delete product', 'error');
      }
    } catch (err) {
      toast('Error deleting product', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Edit Catalog Product"
          subtitle={`Editing product specifications and inventory for record ID: ${productId}`}
        />

        <main className="p-6 space-y-6 flex-1 max-w-6xl w-full">
          <div ref={formTopRef} />

          {/* Breadcrumbs & Navigation Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Link href="/dashboard" className="hover:text-blue-600 transition">
                Dashboard
              </Link>
              <span>/</span>
              <Link href="/products" className="hover:text-blue-600 transition">
                Product Catalog
              </Link>
              <span>/</span>
              <span className="text-slate-700 font-bold">Edit Product</span>
            </div>

            <ButtonLink href="/products" variant="secondary" className="flex items-center gap-1.5 text-xs w-fit">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Catalog</span>
            </ButtonLink>
          </div>

          {initialLoading ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 shadow-xs">
              <Loader
                size="lg"
                label="Loading product data from store catalog..."
                sublabel="Retrieving specifications, pricing, and high-res media"
              />
            </div>
          ) : (
            <>
              {/* Form Error Banner if submitted with errors */}
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

              <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column (2 Cols): Core Inputs */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Card 1: Basic Information */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Basic Information</h3>
                        <p className="text-[11px] text-slate-400">Primary product identifiers displayed in search and catalog</p>
                      </div>
                    </div>

                    <div className="space-y-4 text-xs">
                      {/* Product Title */}
                      <div>
                        <div className="mb-1.5">
                          <label htmlFor="edit-product-title" className="font-bold text-slate-800 text-xs flex items-center gap-1">
                            <span>Product Title</span>
                            <span className="text-rose-500 font-black">*</span>
                          </label>
                        </div>
                        <input
                          id="edit-product-title"
                          type="text"
                          value={formData.title}
                          onChange={(e) => handleChange('title', e.target.value)}
                          onBlur={() => handleBlur('title')}
                          placeholder="Product title"
                          className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-slate-900 outline-none transition font-medium ${
                            (submitted || touched.title) && errors.title
                              ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                              : 'border-slate-200 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10'
                          }`}
                        />
                        {(submitted || touched.title) && errors.title && (
                          <p className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 mt-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                            <span>{errors.title}</span>
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Brand Name */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label htmlFor="edit-product-brand" className="font-bold text-slate-800 text-xs">
                              Brand Name
                            </label>
                            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
                              Optional
                            </span>
                          </div>
                          <input
                            id="edit-product-brand"
                            type="text"
                            value={formData.brand}
                            onChange={(e) => handleChange('brand', e.target.value)}
                            placeholder="Brand name"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition font-medium"
                          />
                        </div>

                        {/* Category */}
                        <div>
                          <div className="mb-1.5">
                            <label htmlFor="edit-product-category" className="font-bold text-slate-800 text-xs flex items-center gap-1">
                              <span>Category</span>
                              <span className="text-rose-500 font-black">*</span>
                            </label>
                          </div>
                          <select
                            id="edit-product-category"
                            value={formData.category}
                            onChange={(e) => handleChange('category', e.target.value)}
                            onBlur={() => handleBlur('category')}
                            className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-slate-900 outline-none transition font-medium cursor-pointer ${
                              (submitted || touched.category) && errors.category
                                ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                                : 'border-slate-200 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10'
                            }`}
                          >
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                          {(submitted || touched.category) && errors.category && (
                            <p className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 mt-1.5">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                              <span>{errors.category}</span>
                            </p>
                          )}
                        </div>

                        {/* Sub Category */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label htmlFor="edit-product-sub-category" className="font-bold text-slate-800 text-xs">
                              Sub Category
                            </label>
                            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
                              Optional
                            </span>
                          </div>
                          <select
                            id="edit-product-sub-category"
                            value={formData.subCategory}
                            onChange={(e) => handleChange('subCategory', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition font-medium cursor-pointer"
                          >
                            <option value="">Select Sub-Category</option>
                            {availableSubCategories.map((sub) => (
                              <option key={sub} value={sub}>
                                {sub}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label htmlFor="edit-product-desc" className="font-bold text-slate-800 text-xs">
                            Product Description
                          </label>
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
                            Optional
                          </span>
                        </div>
                        <textarea
                          id="edit-product-desc"
                          rows={4}
                          value={formData.description}
                          onChange={(e) => handleChange('description', e.target.value)}
                          placeholder="Provide detailed description..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition font-medium resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Pricing & Stock Inventory */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                        <IndianRupee className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Pricing &amp; Inventory</h3>
                        <p className="text-[11px] text-slate-400">Manage base pricing, promotional discounts, and inventory counts</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      {/* Price */}
                      <div>
                        <div className="mb-1.5">
                          <label htmlFor="edit-product-price" className="font-bold text-slate-800 text-xs flex items-center gap-1">
                            <span>Regular Price (₹)</span>
                            <span className="text-rose-500 font-black">*</span>
                          </label>
                        </div>
                        <input
                          id="edit-product-price"
                          type="number"
                          min="1"
                          step="any"
                          value={formData.price}
                          onChange={(e) => handleChange('price', e.target.value)}
                          onBlur={() => handleBlur('price')}
                          className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-slate-900 outline-none transition font-bold ${
                            (submitted || touched.price) && errors.price
                              ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                              : 'border-slate-200 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10'
                          }`}
                        />
                        {(submitted || touched.price) && errors.price && (
                          <p className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 mt-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                            <span>{errors.price}</span>
                          </p>
                        )}
                      </div>

                      {/* Discount */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label htmlFor="edit-product-discount" className="font-bold text-slate-800 text-xs">
                            Discount (% OFF)
                          </label>
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
                            Optional
                          </span>
                        </div>
                        <input
                          id="edit-product-discount"
                          type="number"
                          min="0"
                          max="99"
                          value={formData.discountPercentage}
                          onChange={(e) => handleChange('discountPercentage', e.target.value)}
                          onBlur={() => handleBlur('discountPercentage')}
                          className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-slate-900 outline-none transition font-bold ${
                            (submitted || touched.discountPercentage) && errors.discountPercentage
                              ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                              : 'border-slate-200 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10'
                          }`}
                        />
                        {(submitted || touched.discountPercentage) && errors.discountPercentage && (
                          <p className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 mt-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                            <span>{errors.discountPercentage}</span>
                          </p>
                        )}
                      </div>

                      {/* Stock */}
                      <div>
                        <div className="mb-1.5">
                          <label htmlFor="edit-product-stock" className="font-bold text-slate-800 text-xs flex items-center gap-1">
                            <span>Stock Quantity</span>
                            <span className="text-rose-500 font-black">*</span>
                          </label>
                        </div>
                        <input
                          id="edit-product-stock"
                          type="number"
                          min="0"
                          value={formData.stock}
                          onChange={(e) => handleChange('stock', e.target.value)}
                          onBlur={() => handleBlur('stock')}
                          className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-slate-900 outline-none transition font-bold ${
                            (submitted || touched.stock) && errors.stock
                              ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                              : 'border-slate-200 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10'
                          }`}
                        />
                        {(submitted || touched.stock) && errors.stock && (
                          <p className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 mt-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                            <span>{errors.stock}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {numPrice > 0 && (
                      <div className="bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-xl flex items-center justify-between text-xs">
                        <span className="text-emerald-800 font-semibold">Live Computed Selling Price:</span>
                        <span className="text-sm font-black text-emerald-900">
                          ₹{finalPrice.toLocaleString()} {numDiscount > 0 ? `(${numDiscount}% off ₹${numPrice.toLocaleString()})` : ''}
                        </span>
                      </div>
                    )}

                    {/* Assigned Coupon Offer */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="edit-product-coupon" className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Assigned Coupon / Promo Offer</span>
                        </label>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
                          Optional
                        </span>
                      </div>
                      <select
                        id="edit-product-coupon"
                        value={formData.couponCode}
                        onChange={(e) => handleChange('couponCode', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition font-bold text-xs cursor-pointer"
                      >
                        <option value="">— No Coupon Assigned (Decided by Admin) —</option>
                        {availableCoupons.map((c) => (
                          <option key={c._id || c.code} value={c.code}>
                            🏷️ {c.code} {c.value ? `(${c.type === 'percent' ? `${c.value}%` : `₹${c.value}`} OFF)` : ''} {c.label ? `— ${c.label}` : ''}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Select an active promotional discount code to link directly with this product.
                      </p>
                    </div>
                  </div>

                  {/* Card 3: Media & Imagery */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                      <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Media &amp; Imagery</h3>
                        <p className="text-[11px] text-slate-400">Upload high-resolution product photos or provide direct image links</p>
                      </div>
                    </div>

                    <ImageUploader
                      value={formData.thumbnail}
                      onChange={(url) => {
                        handleChange('thumbnail', url);
                        if (errors.thumbnail) {
                          setErrors((prev) => ({ ...prev, thumbnail: undefined }));
                        }
                      }}
                      error={(submitted || touched.thumbnail) ? errors.thumbnail : undefined}
                      label="Primary Thumbnail Image"
                      required
                      helperText="Upload an image file directly from your computer, or toggle to paste an external image URL"
                    />
                  </div>

                </div>

                {/* Right Column (1 Col): Live Preview & Actions */}
                <div className="space-y-6">
                  
                  {/* Card 4: Storefront Live Card Preview */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Storefront Card Preview
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    </div>

                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-3">
                      <div className="relative aspect-square w-full rounded-xl bg-white border border-slate-200 overflow-hidden">
                        <img
                          src={formData.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'}
                          alt="Preview"
                          className="w-full h-full object-contain p-2"
                          onError={(e) => {
                            (e.target as any).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80';
                          }}
                        />
                        {formData.badge && (
                          <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                            {formData.badge}
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                          {formData.category}
                        </span>
                        <p className="text-xs font-bold text-slate-900 line-clamp-1">
                          {formData.title || 'Product Title Preview'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold">{formData.brand || 'Generic'}</p>

                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-sm font-black text-slate-900">
                            ₹{finalPrice.toLocaleString()}
                          </span>
                          {numDiscount > 0 && (
                            <span className="text-[10px] text-slate-400 line-through">
                              ₹{numPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 5: Moderation & Badge Attributes */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 text-xs">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
                      Moderation &amp; Flags
                    </h3>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="edit-product-status" className="font-bold text-slate-700">Catalog Status</label>
                      </div>
                      <select
                        id="edit-product-status"
                        value={formData.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold capitalize outline-none focus:bg-white focus:border-indigo-600 cursor-pointer"
                      >
                        <option value="approved">Approved (Live in store)</option>
                        <option value="pending">Pending Review</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="edit-badge-tag" className="font-bold text-slate-700">Badge Tag</label>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">Optional</span>
                      </div>
                      <input
                        id="edit-badge-tag"
                        type="text"
                        value={formData.badge}
                        onChange={(e) => handleChange('badge', e.target.value)}
                        placeholder="e.g. HOT / NEW / SALE"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold uppercase outline-none focus:bg-white focus:border-indigo-600"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="edit-featured-check"
                        checked={formData.featured}
                        onChange={(e) => handleChange('featured', e.target.checked)}
                        className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                      />
                      <label htmlFor="edit-featured-check" className="font-bold text-slate-700 cursor-pointer">
                        Feature on Storefront Highlights
                      </label>
                    </div>
                  </div>

                  {/* Card 6: Save Actions */}
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
                      Delete Product from Catalog
                    </Button>

                    <ButtonLink
                      href="/products"
                      variant="ghost"
                      size="sm"
                      className="w-full !text-slate-500 hover:!text-slate-800"
                    >
                      Cancel &amp; Return to Catalog
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
        title="Delete Product from Catalog"
        itemName={formData.title}
        message={`Are you sure you want to permanently remove "${formData.title}" from the store catalog? All SKU specs, pricing, and stock records will be removed.`}
      />
    </div>
  );
}
