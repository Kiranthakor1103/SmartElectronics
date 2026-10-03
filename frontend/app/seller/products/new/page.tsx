"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/app/components/ToastProvider";
import ImageUploader from "@/app/components/ui/ImageUploader";

interface Category {
  _id: string;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("0");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.data?.categories || []);
          if (data.data?.categories?.length > 0) {
            setCategory(data.data.categories[0].name);
          }
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    void fetchCategories();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "Product title is required";
    if (!category.trim()) newErrors.category = "Please select a category";
    if (!brand.trim()) newErrors.brand = "Brand name is required";
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = "Enter a valid price greater than 0";
    }
    if (originalPrice.trim() && (isNaN(Number(originalPrice)) || Number(originalPrice) <= 0)) {
      newErrors.originalPrice = "Enter a valid original price";
    }
    if (!stock.trim() || isNaN(Number(stock)) || Number(stock) < 0) {
      newErrors.stock = "Enter stock quantity (0 or more)";
    }
    if (!image.trim()) {
      newErrors.image = "Please upload an image file or provide an image URL";
    }
    if (!description.trim() || description.trim().length < 20) {
      newErrors.description = "Provide a description of at least 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload: Record<string, any> = {
        title,
        name: title,
        category,
        brand,
        price: Number(price),
        stock: Number(stock),
        thumbnail: image,
        image,
        description,
        discountPercentage: Number(discountPercentage),
      };

      if (originalPrice.trim()) {
        payload.originalPrice = Number(originalPrice);
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast("Product listed successfully! Pending moderation review.", "success");
        router.push("/seller/products");
      } else {
        toast(data.message || "Failed to list product", "error");
      }
    } catch (err) {
      toast("An error occurred. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back to Products */}
      <button
        onClick={() => router.push("/seller/products")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="h-4.5 w-4.5" />
        Back to listings
      </button>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">List a New Product</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Enter product attributes, specifications, and media links. Listings go live immediately after approval.
        </p>
      </div>

      {/* Main Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            
            {/* Title / Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Product Title / Name
              </label>
              <input
                type="text"
                placeholder="e.g. Sony WH-1000XM4 Wireless Noise Cancelling Headphones"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full rounded-xl border ${
                  errors.title ? "border-rose-500" : "border-slate-200"
                } bg-slate-50 py-3.5 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all`}
              />
              {errors.title && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.title}</p>}
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Category
              </label>
              {loadingCategories ? (
                <div className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 flex items-center px-4">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-650" />
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 px-4 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.category && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.category}</p>}
            </div>

            {/* Brand */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Brand
              </label>
              <input
                type="text"
                placeholder="e.g. Sony, Apple, Samsung"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className={`w-full rounded-xl border ${
                  errors.brand ? "border-rose-500" : "border-slate-200"
                } bg-slate-50 py-3.5 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all`}
              />
              {errors.brand && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.brand}</p>}
            </div>

            {/* Price (INR) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Selling Price (₹)
              </label>
              <input
                type="text"
                placeholder="e.g. 19990"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`w-full rounded-xl border ${
                  errors.price ? "border-rose-500" : "border-slate-200"
                } bg-slate-50 py-3.5 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all`}
              />
              {errors.price && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.price}</p>}
            </div>

            {/* Original Price */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Original Price (Optional ₹)
              </label>
              <input
                type="text"
                placeholder="e.g. 24990"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className={`w-full rounded-xl border ${
                  errors.originalPrice ? "border-rose-500" : "border-slate-200"
                } bg-slate-50 py-3.5 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all`}
              />
              {errors.originalPrice && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.originalPrice}</p>}
            </div>

            {/* Discount Percentage */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Discount Percentage (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
              />
            </div>

            {/* Stock Level */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Stock Quantity Available
              </label>
              <input
                type="text"
                placeholder="e.g. 50"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className={`w-full rounded-xl border ${
                  errors.stock ? "border-rose-500" : "border-slate-200"
                } bg-slate-50 py-3.5 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all`}
              />
              {errors.stock && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.stock}</p>}
            </div>

            {/* Product Image */}
            <div className="sm:col-span-2">
              <ImageUploader
                value={image}
                onChange={(url) => {
                  setImage(url);
                  if (errors.image) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.image;
                      return next;
                    });
                  }
                }}
                error={errors.image}
                label="Product Thumbnail Image"
                required
                helperText="Upload a product image directly from your computer, or toggle to paste an external image URL"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Detailed Product Description
              </label>
              <textarea
                rows={5}
                placeholder="Specify the product features, build materials, technical specifications, and box contents..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full rounded-xl border ${
                  errors.description ? "border-rose-500" : "border-slate-200"
                } bg-slate-50 py-3.5 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all resize-y`}
              />
              {errors.description && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.description}</p>}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-650 hover:bg-indigo-600 py-4 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-50 shadow-md shadow-indigo-650/10"
          >
            {submitting ? "Creating Listing…" : "Submit Product for Verification"}
          </button>
        </form>
      </div>
    </div>
  );
}
