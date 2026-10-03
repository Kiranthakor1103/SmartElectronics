"use client";

import { useEffect, useState } from "react";
import { Plus, Sparkles, Layers, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/app/components/ToastProvider";

interface Category {
  _id: string;
  name: string;
  image?: string;
  color?: string;
  href?: string;
}

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // New Category Fields
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [color, setColor] = useState("#4f46e5");
  const [href, setHref] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.data?.categories || []);
      }
    } catch (err) {
      toast("Failed to load catalog categories", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCategories();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Category name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const defaultHref = href.trim() || `/products?category=${name.toLowerCase().replace(/\s+/g, "-")}`;
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          image: image.trim() || undefined,
          color,
          href: defaultHref,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast("New category created successfully!", "success");
        setName("");
        setImage("");
        setHref("");
        setColor("#4f46e5");
        void fetchCategories();
      } else {
        toast(data.message || "Failed to create category", "error");
      }
    } catch (err) {
      toast("An error occurred during submission", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Left Columns: Categories List */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">Catalog Categories</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Configure default and merchant-accessible catalog taxonomy settings.
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-650" />
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 border-dashed bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 mb-4">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No categories</h3>
            <p className="mt-1.5 text-sm text-slate-500 max-w-sm mx-auto">
              Add product categories to structure your multi-vendor marketplace.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {categories.map((category) => (
              <div
                key={category._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center justify-between transition hover:border-slate-350 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 font-bold text-slate-800 shrink-0 border border-slate-200"
                    style={{ borderLeft: `4px solid ${category.color || "#4f46e5"}` }}
                  >
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-7 w-7 object-contain rounded"
                      />
                    ) : (
                      <Sparkles className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{category.name}</h3>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate max-w-[150px]">
                      {category.href}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Add Category Form */}
      <div>
        <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Create Category</h2>
          <form onSubmit={handleAddCategory} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Category Name
              </label>
              <input
                type="text"
                placeholder="e.g. Audio, Smart Home, Wearables"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full rounded-xl border ${
                  errors.name ? "border-rose-500" : "border-slate-200"
                } bg-slate-50 py-3 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all`}
              />
              {errors.name && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.name}</p>}
            </div>

            {/* Icon / Image Link */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Icon Image URL (Optional)
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. /images/categories/audio.png"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Path / Href */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Redirect Path (Optional)
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. /products?category=audio"
                  value={href}
                  onChange={(e) => setHref(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Color Accent */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Brand Accent Color
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-12 rounded-lg border border-slate-200 bg-slate-50 p-1 cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-555 py-3.5 text-sm font-bold text-white transition active:scale-95 disabled:opacity-50 shadow-md shadow-indigo-650/10"
            >
              <Plus className="h-4.5 w-4.5" />
              {submitting ? "Creating Category…" : "Add Category"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
