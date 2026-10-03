'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { ApiClient } from '../../lib/apiClient';
import { useToast } from '../../components/ToastProvider';
import { Button, ButtonLink, ImageUploader } from '../../components/ui';
import {
  ArrowLeft,
  Package,
  Sparkles,
  Save,
  Image as ImageIcon,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  Tag,
  Plus,
  Trash2,
  Cpu,
  ShieldCheck,
  Star,
  Sliders,
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

const ELECTRONICS_CATEGORIES = [
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
];

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

const SPEC_PRESETS: Record<string, Array<{ key: string; value: string }>> = {
  'TVs & Entertainment': [
    { key: 'Screen Size', value: '55 inches (138 cm)' },
    { key: 'Resolution', value: '4K Ultra HD (3840 x 2160)' },
    { key: 'Smart TV', value: 'Yes (Google TV)' },
    { key: 'Refresh Rate', value: '120 Hz' },
    { key: 'HDMI Ports', value: '4x HDMI 2.1' },
    { key: 'USB Ports', value: '2x High Speed USB' },
    { key: 'Operating System', value: 'Google TV' },
  ],
  'Laptops & Computers': [
    { key: 'Processor', value: 'Intel Core i7-14700HX' },
    { key: 'RAM', value: '16 GB DDR5' },
    { key: 'Storage', value: '1 TB PCIe 4.0 SSD' },
    { key: 'Graphics Card', value: 'NVIDIA GeForce RTX 4060 8GB' },
    { key: 'Display Size', value: '16-inch QHD+ 165Hz' },
    { key: 'Battery', value: '90Wh with 240W Fast Charging' },
    { key: 'Operating System', value: 'Windows 11 Home' },
  ],
  'Home Appliances': [
    { key: 'Capacity', value: '1.5 Ton' },
    { key: 'Star Rating', value: '5 Star BEE Rating' },
    { key: 'Inverter Compressor', value: 'AI Dual Inverter' },
    { key: 'Cooling Area', value: 'Up to 150 sq.ft' },
    { key: 'Power Consumption', value: 'Annual: 685 kWh' },
    { key: 'Condenser Coil', value: '100% Copper with Anti-Rust' },
  ],
  'Mobile & Tablets': [
    { key: 'Display', value: '6.7-inch Super AMOLED 120Hz' },
    { key: 'Processor', value: 'Snapdragon 8 Gen 3 (4nm)' },
    { key: 'RAM', value: '12 GB LPDDR5X' },
    { key: 'Storage', value: '256 GB UFS 4.0' },
    { key: 'Camera', value: '50MP OIS + 12MP Ultra-wide' },
    { key: 'Battery', value: '5,000 mAh with 45W Fast Charging' },
    { key: 'Operating System', value: 'Android 14' },
  ],
  'Audio Devices': [
    { key: 'Driver Size', value: '40mm Neodymium Drivers' },
    { key: 'Frequency Response', value: '20 Hz - 40,000 Hz' },
    { key: 'Noise Cancellation', value: 'Active Noise Cancellation (ANC)' },
    { key: 'Battery Life', value: '30 Hours with ANC ON' },
    { key: 'Connectivity', value: 'Bluetooth 5.3 + 3.5mm Aux' },
  ],
};

export default function AddProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const formTopRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>([]);

  const [categories, setCategories] = useState<string[]>(ELECTRONICS_CATEGORIES);

  const [formData, setFormData] = useState({
    title: '',
    sku: '',
    brand: '',
    category: 'Mobile & Tablets',
    subCategory: 'Smartphones',
    price: '',
    salePrice: '',
    discountPercentage: '10',
    stock: '25',
    warranty: '1 Year Brand Warranty',
    rating: '4.8',
    thumbnail: '',
    badge: 'NEW',
    featured: false,
    trending: true,
    status: 'approved',
    description: '',
    couponCode: '',
  });

  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>([
    { key: 'Display', value: '' },
    { key: 'Processor', value: '' },
    { key: 'RAM', value: '' },
    { key: 'Storage', value: '' },
  ]);

  // Fetch available coupons
  useEffect(() => {
    async function loadCoupons() {
      try {
        const res = await ApiClient.get('/admin/coupons?limit=100');
        if (res.success && res.data?.coupons) {
          setAvailableCoupons(res.data.coupons);
        }
      } catch (err) {
        console.warn('Could not load coupons');
      }
    }
    loadCoupons();
  }, []);

  // Fetch categories from API with fallback
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await ApiClient.get('/categories');
        if (res.success && res.data?.categories) {
          const catNames: string[] = res.data.categories.map((c: any) => c.name);
          const uniqueCats = Array.from(new Set(catNames));
          if (uniqueCats.length > 0) {
            setCategories(uniqueCats);
          }
        }
      } catch (err) {
        console.warn('Using default electronics categories');
      }
    }
    loadCategories();
  }, []);

  // Available subcategories based on chosen category
  const availableSubCategories = ELECTRONICS_SUB_CATEGORIES[formData.category] || [
    'General',
    'Accessories',
  ];

  // Validation function
  const validate = (data: typeof formData): FormErrors => {
    const errs: FormErrors = {};

    if (!data.title.trim()) {
      errs.title = 'Product title is required.';
    } else if (data.title.trim().length < 3) {
      errs.title = 'Product title must be at least 3 characters long.';
    }

    if (!data.category || !data.category.trim()) {
      errs.category = 'Please select a valid product category.';
    }

    if (!data.price || data.price.trim() === '') {
      errs.price = 'Regular price is required.';
    } else {
      const p = Number(data.price);
      if (isNaN(p) || p <= 0) {
        errs.price = 'Price must be greater than ₹0.';
      }
    }

    if (data.discountPercentage !== '' && data.discountPercentage !== undefined) {
      const d = Number(data.discountPercentage);
      if (isNaN(d) || d < 0 || d > 99) {
        errs.discountPercentage = 'Discount percentage must be between 0% and 99%.';
      }
    }

    if (data.stock === '' || data.stock === null || data.stock === undefined) {
      errs.stock = 'Stock quantity is required.';
    } else {
      const s = Number(data.stock);
      if (isNaN(s) || s < 0) {
        errs.stock = 'Stock quantity cannot be negative.';
      }
    }

    if (!data.thumbnail.trim()) {
      errs.thumbnail = 'Please upload a product image or provide an image URL.';
    }

    return errs;
  };

  const handleChange = (field: keyof typeof formData, value: any) => {
    const updated = { ...formData, [field]: value };

    // Auto update subcategory when category changes
    if (field === 'category') {
      const newSubs = ELECTRONICS_SUB_CATEGORIES[value] || ['General'];
      updated.subCategory = newSubs[0];

      // Auto suggest preset specs if current are mostly empty
      if (SPEC_PRESETS[value]) {
        setSpecs(SPEC_PRESETS[value]);
      }
    }

    // Auto sync discount when price or salePrice is entered
    if (field === 'salePrice' && updated.price) {
      const p = Number(updated.price);
      const sp = Number(value);
      if (p > 0 && sp > 0 && sp < p) {
        updated.discountPercentage = String(Math.round(((p - sp) / p) * 100));
      }
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

  // Specs helper
  const handleSpecChange = (index: number, keyOrValue: 'key' | 'value', text: string) => {
    const next = [...specs];
    next[index][keyOrValue] = text;
    setSpecs(next);
  };

  const addSpecRow = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const removeSpecRow = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const loadSpecPreset = (cat: string) => {
    if (SPEC_PRESETS[cat]) {
      setSpecs(SPEC_PRESETS[cat]);
      toast(`Loaded ${cat} specification template!`, 'success');
    }
  };

  // Live price preview
  const numPrice = Number(formData.price) || 0;
  const numDiscount = Number(formData.discountPercentage) || 0;
  const calculatedSalePrice = formData.salePrice ? Number(formData.salePrice) : (numDiscount > 0 ? Math.round(numPrice * (1 - numDiscount / 100)) : numPrice);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

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
      toast('Please resolve the required field validation errors before publishing', 'error');
      if (formTopRef.current) {
        formTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    // Convert specs array to object
    const specObj: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specObj[s.key.trim()] = s.value.trim();
      }
    });

    setLoading(true);
    try {
      const res = await ApiClient.post('/admin/products', {
        title: formData.title.trim(),
        name: formData.title.trim(),
        sku: formData.sku.trim() || undefined,
        brand: formData.brand.trim() || 'Generic',
        category: formData.category,
        subCategory: formData.subCategory,
        price: Number(formData.price),
        salePrice: calculatedSalePrice,
        discountPrice: calculatedSalePrice,
        discountPercentage: Number(formData.discountPercentage || 0),
        stock: Number(formData.stock || 25),
        warranty: formData.warranty.trim() || '1 Year Brand Warranty',
        rating: Number(formData.rating || 4.8),
        thumbnail: formData.thumbnail.trim(),
        image: formData.thumbnail.trim(),
        images: [formData.thumbnail.trim()],
        badge: formData.badge,
        featured: formData.featured,
        trending: formData.trending,
        status: formData.status,
        description: formData.description.trim() || formData.title.trim(),
        couponCode: formData.couponCode.trim().toUpperCase(),
        specifications: specObj,
      });

      if (res.success) {
        toast('Electronics product published successfully!', 'success');
        router.push('/products');
      } else {
        toast(res.message || 'Failed to create product', 'error');
      }
    } catch (err) {
      toast('Error connecting to backend API', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Add New Electronics Product"
          subtitle="Configure device attributes, SKU, technical specifications, and warranty coverage for SmartElectronics."
        />

        <main className="p-6 space-y-6 flex-1 max-w-6xl w-full">
          <div ref={formTopRef} />

          {/* Breadcrumbs & Navigation */}
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
              <span className="text-slate-700 font-bold">Add New Electronics</span>
            </div>

            <ButtonLink href="/products" variant="secondary" className="flex items-center gap-1.5 text-xs w-fit">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Catalog</span>
            </ButtonLink>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column (2 Cols): Core Info, Specs & Pricing */}
              <div className="lg:col-span-2 space-y-6">
                {/* Card 1: Basic Electronics Information */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Device Specifications &amp; Department</h3>
                      <p className="text-[11px] text-slate-400">Title, SKU, Brand, Category, and Sub-Category</p>
                    </div>
                  </div>

                  {/* Product Title */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="product-title" className="font-bold text-slate-800 text-xs flex items-center gap-1">
                        <span>Product Name / Model Title</span>
                        <span className="text-rose-500 font-black">*</span>
                      </label>
                    </div>
                    <input
                      id="product-title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      onBlur={() => handleBlur('title')}
                      placeholder="e.g. Sony Bravia XR 65-inch 4K Ultra HD Smart OLED TV (XR-65A80L)"
                      className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-slate-900 outline-none transition font-medium ${
                        (submitted || touched.title) && errors.title
                          ? 'border-rose-400 bg-rose-50/20'
                          : 'border-slate-200 focus:bg-white focus:border-blue-600'
                      }`}
                    />
                    {(submitted || touched.title) && errors.title && (
                      <p className="text-[11px] font-bold text-rose-600 mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* SKU */}
                    <div>
                      <label htmlFor="product-sku" className="font-bold text-slate-800 text-xs block mb-1.5">
                        Hardware SKU / Model Code
                      </label>
                      <input
                        id="product-sku"
                        type="text"
                        value={formData.sku}
                        onChange={(e) => handleChange('sku', e.target.value)}
                        placeholder="e.g. SE-TV-SONYA80L-65"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-mono text-xs outline-none focus:bg-white focus:border-blue-600"
                      />
                    </div>

                    {/* Brand */}
                    <div>
                      <label htmlFor="product-brand" className="font-bold text-slate-800 text-xs block mb-1.5">
                        Manufacturer / Brand
                      </label>
                      <input
                        id="product-brand"
                        type="text"
                        value={formData.brand}
                        onChange={(e) => handleChange('brand', e.target.value)}
                        placeholder="e.g. Sony / Apple / Samsung / LG"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-xs outline-none focus:bg-white focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category */}
                    <div>
                      <label htmlFor="product-category" className="font-bold text-slate-800 text-xs block mb-1.5">
                        Category (11 Electronics Departments) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id="product-category"
                        value={formData.category}
                        onChange={(e) => handleChange('category', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-xs outline-none focus:bg-white focus:border-blue-600 font-semibold cursor-pointer"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sub Category */}
                    <div>
                      <label htmlFor="product-sub-category" className="font-bold text-slate-800 text-xs block mb-1.5">
                        Sub Category
                      </label>
                      <select
                        id="product-sub-category"
                        value={formData.subCategory}
                        onChange={(e) => handleChange('subCategory', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-xs outline-none focus:bg-white focus:border-blue-600 font-semibold cursor-pointer"
                      >
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
                    <label htmlFor="product-desc" className="font-bold text-slate-800 text-xs block mb-1.5">
                      Product Description &amp; Feature Highlights
                    </label>
                    <textarea
                      id="product-desc"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Provide comprehensive details on performance, display quality, materials, and features..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-xs outline-none focus:bg-white focus:border-blue-600 font-medium resize-none"
                    />
                  </div>
                </div>

                {/* Card 2: Dynamic Technical Specifications Builder */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Technical Specifications Builder</h3>
                        <p className="text-[11px] text-slate-400">Renders dedicated spec sheets on the product page</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-bold">Presets:</span>
                      {['TVs & Entertainment', 'Laptops & Computers', 'Home Appliances', 'Mobile & Tablets', 'Audio Devices'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => loadSpecPreset(p)}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 border border-slate-200 transition cursor-pointer"
                        >
                          {p.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {specs.map((spec, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={spec.key}
                          onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                          placeholder="Spec Name (e.g. Refresh Rate / RAM)"
                          className="w-2/5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                        />
                        <input
                          type="text"
                          value={spec.value}
                          onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                          placeholder="Spec Value (e.g. 120Hz OLED / 16GB DDR5)"
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                        />
                        <button
                          type="button"
                          onClick={() => removeSpecRow(idx)}
                          className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addSpecRow}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 pt-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Specification Field</span>
                  </button>
                </div>

                {/* Card 3: Pricing & Stock Inventory */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Pricing, Warranty &amp; Inventory</h3>
                      <p className="text-[11px] text-slate-400">Base price, sale price, warranty guarantee, and stock</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    {/* Price */}
                    <div>
                      <label htmlFor="product-price" className="font-bold text-slate-800 text-xs block mb-1.5">
                        Regular Price (₹) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="product-price"
                        type="number"
                        min="1"
                        value={formData.price}
                        onChange={(e) => handleChange('price', e.target.value)}
                        placeholder="e.g. 149900"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-bold outline-none focus:bg-white focus:border-blue-600"
                      />
                    </div>

                    {/* Sale Price */}
                    <div>
                      <label htmlFor="product-sale-price" className="font-bold text-slate-800 text-xs block mb-1.5">
                        Sale / Discounted Price (₹)
                      </label>
                      <input
                        id="product-sale-price"
                        type="number"
                        min="1"
                        value={formData.salePrice}
                        onChange={(e) => handleChange('salePrice', e.target.value)}
                        placeholder="e.g. 134900"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-bold outline-none focus:bg-white focus:border-blue-600"
                      />
                    </div>

                    {/* Stock */}
                    <div>
                      <label htmlFor="product-stock" className="font-bold text-slate-800 text-xs block mb-1.5">
                        Stock Quantity <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="product-stock"
                        type="number"
                        min="0"
                        value={formData.stock}
                        onChange={(e) => handleChange('stock', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-bold outline-none focus:bg-white focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {/* Warranty */}
                    <div>
                      <label htmlFor="product-warranty" className="font-bold text-slate-800 text-xs block mb-1.5">
                        Official Brand Warranty
                      </label>
                      <input
                        id="product-warranty"
                        type="text"
                        value={formData.warranty}
                        onChange={(e) => handleChange('warranty', e.target.value)}
                        placeholder="e.g. 1 Year Manufacturer Comprehensive Warranty"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-xs outline-none focus:bg-white focus:border-blue-600"
                      />
                    </div>

                    {/* Rating */}
                    <div>
                      <label htmlFor="product-rating" className="font-bold text-slate-800 text-xs block mb-1.5">
                        Default Initial Rating (1.0 to 5.0)
                      </label>
                      <input
                        id="product-rating"
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={formData.rating}
                        onChange={(e) => handleChange('rating', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-xs font-bold outline-none focus:bg-white focus:border-blue-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (1 Col): Image & Flags */}
              <div className="space-y-6">
                {/* Image Upload */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900">Hardware Image</h3>
                  </div>

                  <ImageUploader
                    value={formData.thumbnail}
                    onChange={(url) => handleChange('thumbnail', url)}
                    error={(submitted || touched.thumbnail) ? errors.thumbnail : undefined}
                  />
                </div>

                {/* Flags & Promotion Status */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
                  <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                    Promotion Flags
                  </h3>

                  {/* Featured */}
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => handleChange('featured', e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block">Featured Product</span>
                      <span className="text-[11px] text-slate-400">Display on home page curated strips</span>
                    </div>
                  </label>

                  {/* Trending */}
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.trending}
                      onChange={(e) => handleChange('trending', e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block">Trending Device</span>
                      <span className="text-[11px] text-slate-400">Mark as top high-demand tech item</span>
                    </div>
                  </label>

                  {/* Badge */}
                  <div>
                    <label htmlFor="product-badge" className="font-bold text-slate-800 block mb-1">
                      Promotional Ribbon Badge
                    </label>
                    <input
                      id="product-badge"
                      type="text"
                      value={formData.badge}
                      onChange={(e) => handleChange('badge', e.target.value)}
                      placeholder="e.g. Flagship / 240Hz / 5 Star"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:bg-white focus:border-blue-600"
                    />
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Publishing Device...' : 'Publish Electronics Product'}</span>
                  </Button>

                  <ButtonLink href="/products" variant="secondary" className="w-full text-center block text-xs py-2.5">
                    Discard &amp; Cancel
                  </ButtonLink>
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
