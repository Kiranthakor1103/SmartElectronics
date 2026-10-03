"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/app/lib/redux/features/product/productsSlice";
import {
  SlidersHorizontal,
  Check,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  Star,
  RefreshCcw,
  Package,
  ShieldCheck,
} from "lucide-react";

import { CategoryFilter } from "./filters/CategoryFilter";
import { PriceFilter } from "./filters/PriceFilter";
import { SortFilter, type SortOption, SORT_OPTIONS } from "./filters/SortFilter";

export { CategoryFilter } from "./filters/CategoryFilter";
export { PriceFilter } from "./filters/PriceFilter";
export { SortFilter, type SortOption, SORT_OPTIONS } from "./filters/SortFilter";

export interface ProductFiltersState {
  search: string;
  category: string;
  subCategory?: string;
  brand?: string;
  rating?: number;
  sort: SortOption;
  minPrice: number;
  maxPrice: number;
  inStockOnly: boolean;
  searchScope?: "category" | "all";
}

export const defaultFilters: ProductFiltersState = {
  search: "",
  category: "all",
  subCategory: "all",
  brand: "all",
  rating: 0,
  sort: "featured",
  minPrice: 0,
  maxPrice: 300000,
  inStockOnly: false,
  searchScope: "category",
};

export function filterAndSortProducts(
  products: Product[],
  filters: ProductFiltersState
): Product[] {
  let result = [...products];

  // Search keyword matching
  if (filters.search && filters.search.trim()) {
    const tokens = filters.search.toLowerCase().trim().split(/\s+/).filter(Boolean);
    result = result.filter((p) => {
      const title = (p.title || (p as any).name || "").toLowerCase();
      const brand = (p.brand || "").toLowerCase();
      const cat = (p.category || "").toLowerCase();
      const sub = ((p as any).subCategory || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const badge = (p.badge || "").toLowerCase();
      const tags = Array.isArray((p as any).tags) ? (p as any).tags.join(" ").toLowerCase() : "";
      const text = `${title} ${brand} ${cat} ${sub} ${desc} ${badge} ${tags}`;
      return tokens.every((token) => text.includes(token));
    });
  }

  // Category filter
  const isAllCategory = !filters.category || filters.category.toLowerCase() === "all";
  const shouldApplyCategory = !isAllCategory && filters.searchScope !== "all";

  if (shouldApplyCategory) {
    const cat = filters.category.toLowerCase().trim();
    if (cat === "top offers" || cat === "top-offers" || cat === "offers" || cat === "deals") {
      result = result.filter(
        (p) => (p.discountPercentage ?? 0) >= 8 || p.featured || Boolean(p.badge)
      );
    } else {
      result = result.filter((p) => {
        const pCat = (p.category || "").toLowerCase();
        if (cat === "mobile" || cat === "mobiles" || cat === "smartphones") {
          return pCat.includes("mobile") || pCat.includes("smartphone") || pCat.includes("phone");
        }
        if (cat === "tvs & appliances" || cat === "tvs-appliances" || cat === "tvs" || cat === "appliances") {
          return pCat.includes("tv") || pCat.includes("appliance") || pCat.includes("television");
        }
        if (cat === "electronics") {
          return pCat.includes("electronics") || pCat.includes("laptop") || pCat.includes("gadget");
        }
        return pCat === cat || pCat.includes(cat) || cat.includes(pCat);
      });
    }
  }

  // Sub-Category filter
  if (filters.subCategory && filters.subCategory.toLowerCase() !== "all") {
    const sub = filters.subCategory.toLowerCase().trim();
    result = result.filter((p) => {
      const pSub = ((p as any).subCategory || "").toLowerCase().trim();
      return pSub === sub || pSub.includes(sub) || sub.includes(pSub);
    });
  }

  // Brand filter
  if (filters.brand && filters.brand.toLowerCase() !== "all") {
    const brand = filters.brand.toLowerCase().trim();
    result = result.filter((p) => {
      const pBrand = (p.brand || "").toLowerCase().trim();
      return pBrand === brand || pBrand.includes(brand) || brand.includes(pBrand);
    });
  }

  // Rating filter
  if (filters.rating && filters.rating > 0) {
    result = result.filter((p) => (p.rating ?? 0) >= filters.rating!);
  }

  // Price Range filter
  result = result.filter(
    (p) => p.price >= filters.minPrice && p.price <= filters.maxPrice
  );

  // In-stock filter
  if (filters.inStockOnly) {
    result = result.filter((p) => (p.stock ?? 0) > 0);
  }

  // Sorting
  switch (filters.sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      break;
    case "name":
      result.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      break;
  }

  return result;
}

export function getCategories(products: Product[]): string[] {
  const cats = new Set<string>();
  products.forEach((p) => {
    if (p.category) cats.add(p.category);
  });
  return Array.from(cats).sort();
}

export function getSubCategories(products: Product[], category?: string): string[] {
  const subs = new Set<string>();
  const isAll = !category || category.toLowerCase() === "all";
  products.forEach((p) => {
    const pCat = (p.category || "").toLowerCase();
    const matchesCat = isAll || pCat === category!.toLowerCase() || pCat.includes(category!.toLowerCase());
    const sub = (p as any).subCategory;
    if (matchesCat && sub) {
      subs.add(sub);
    }
  });
  return Array.from(subs).sort();
}

export function getBrands(products: Product[], category?: string): { name: string; count: number }[] {
  const brandCountMap = new Map<string, number>();
  const isAll = !category || category.toLowerCase() === "all";

  products.forEach((p) => {
    const pCat = (p.category || "").toLowerCase();
    const matchesCat = isAll || pCat === category!.toLowerCase() || pCat.includes(category!.toLowerCase());
    if (matchesCat && p.brand) {
      const b = p.brand.trim();
      brandCountMap.set(b, (brandCountMap.get(b) || 0) + 1);
    }
  });

  return Array.from(brandCountMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

interface FilterSectionProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function FilterSection({ title, icon, defaultOpen = true, children }: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-none">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-3 text-left group"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 group-hover:text-blue-600 transition">
          {icon}
          {title}
        </span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 transition" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 transition" />
        )}
      </button>
      {open && <div className="pb-3.5">{children}</div>}
    </div>
  );
}

interface ProductFiltersProps {
  products: Product[];
  filters: ProductFiltersState;
  onChange: (filters: ProductFiltersState) => void;
  resultCount: number;
  totalCatalogMatches?: number;
  onSelectAllCategories?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function ProductFiltersBar({
  products,
  filters,
  onChange,
  resultCount,
  totalCatalogMatches,
  onSelectAllCategories,
  mobileOpen = false,
  onMobileClose,
}: ProductFiltersProps) {
  const [brandSearch, setBrandSearch] = useState("");

  const categories = useMemo(() => getCategories(products), [products]);
  const availableSubCategories = useMemo(
    () => getSubCategories(products, filters.category),
    [products, filters.category]
  );
  const brands = useMemo(
    () => getBrands(products, filters.category),
    [products, filters.category]
  );

  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return brands;
    return brands.filter((b) =>
      b.name.toLowerCase().includes(brandSearch.toLowerCase().trim())
    );
  }, [brands, brandSearch]);

  const maxProductPrice = useMemo(
    () => Math.max(...products.map((p) => p.price), 100000),
    [products]
  );

  const update = (partial: Partial<ProductFiltersState>) => {
    onChange({ ...filters, ...partial });
  };

  const hasActiveFilters = Boolean(
    filters.search ||
      (filters.category && filters.category !== "all") ||
      (filters.subCategory && filters.subCategory !== "all") ||
      (filters.brand && filters.brand !== "all") ||
      (filters.rating && filters.rating > 0) ||
      filters.inStockOnly ||
      filters.minPrice > 0 ||
      filters.maxPrice < maxProductPrice ||
      filters.sort !== "featured"
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="text-sm font-black text-slate-900 tracking-tight">Filters</span>
            {hasActiveFilters && (
              <span className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-600 text-[9px] font-black text-white">
                ✓
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...defaultFilters,
                  maxPrice: maxProductPrice,
                  sort: filters.sort,
                })
              }
              className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-md transition"
            >
              <RefreshCcw className="h-3 w-3" />
              Reset
            </button>
          )}
          {onMobileClose && (
            <button
              type="button"
              onClick={onMobileClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Close filters"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Result count pill */}
      <div className="px-4 py-2 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 border-b border-slate-100 shrink-0 flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
          <Package className="h-3.5 w-3.5 text-blue-600" />
          <span>
            <strong className="font-black text-blue-700">{resultCount}</strong> product{resultCount !== 1 ? "s" : ""} found
          </span>
        </span>
      </div>

      {/* Scrollable Filter Sections with smooth custom scrollbar */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-8 overscroll-contain">
        
        {/* Search */}
        <FilterSection title="Search" icon={<Search className="h-3 w-3 text-blue-600" />} defaultOpen={true}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => update({ search: e.target.value })}
              placeholder="Search products, brands…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 transition-all"
              aria-label="Search products"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => update({ search: "" })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          {filters.category !== "all" && (
            <div className="mt-2 flex gap-1.5">
              <button
                type="button"
                onClick={() => update({ searchScope: "category" })}
                className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  filters.searchScope !== "all"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                In {filters.category.split(" ")[0]}
              </button>
              <button
                type="button"
                onClick={() => update({ searchScope: "all" })}
                className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  filters.searchScope === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Store
              </button>
            </div>
          )}
        </FilterSection>

        {/* ── Decomposed Component: CategoryFilter ── */}
        <CategoryFilter
          category={filters.category}
          subCategory={filters.subCategory}
          categories={categories}
          availableSubCategories={availableSubCategories}
          onSelectCategory={(cat) => {
            if (cat === "all") {
              update({ category: "all", subCategory: "all", brand: "all", searchScope: "all" });
            } else {
              update({ category: cat, subCategory: "all", searchScope: "category" });
            }
          }}
          onSelectSubCategory={(sub) => update({ subCategory: sub })}
        />

        {/* ── Decomposed Component: PriceFilter ── */}
        <PriceFilter
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          maxProductPrice={maxProductPrice}
          onPriceChange={(min, max) => update({ minPrice: min, maxPrice: max })}
        />

        {/* ── Decomposed Component: SortFilter (Sidebar Mode) ── */}
        <SortFilter
          sort={filters.sort}
          onSortChange={(sort) => update({ sort })}
          variant="sidebar"
        />

        {/* Brand Filter */}
        {brands.length > 0 && (
          <FilterSection
            title="Brand"
            icon={<ShieldCheck className="h-3 w-3 text-blue-600" />}
            defaultOpen={true}
          >
            <div className="space-y-2">
              {brands.length > 6 && (
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    placeholder="Search Brand…"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-7 pr-2 text-[11px] font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                <label className="flex items-center justify-between py-1 px-1 rounded-lg hover:bg-slate-50 cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                        !filters.brand || filters.brand === "all"
                          ? "border-blue-600 bg-blue-600"
                          : "border-slate-300 bg-white group-hover:border-blue-400"
                      }`}
                    >
                      {(!filters.brand || filters.brand === "all") && (
                        <Check className="h-2.5 w-2.5 text-white stroke-[3]" />
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => update({ brand: "all" })}
                      className="text-xs font-semibold text-slate-700 group-hover:text-blue-700 text-left"
                    >
                      All Brands
                    </button>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{products.length}</span>
                </label>

                {filteredBrands.map((b) => {
                  const isSelected = filters.brand?.toLowerCase() === b.name.toLowerCase();
                  return (
                    <label
                      key={b.name}
                      className="flex items-center justify-between py-1 px-1 rounded-lg hover:bg-slate-50 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                            isSelected
                              ? "border-blue-600 bg-blue-600"
                              : "border-slate-300 bg-white group-hover:border-blue-400"
                          }`}
                        >
                          {isSelected && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
                        </span>
                        <button
                          type="button"
                          onClick={() => update({ brand: isSelected ? "all" : b.name })}
                          className={`text-xs font-semibold text-left ${
                            isSelected ? "text-blue-700 font-bold" : "text-slate-700 group-hover:text-blue-700"
                          }`}
                        >
                          {b.name}
                        </button>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{b.count}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </FilterSection>
        )}

        {/* Customer Ratings */}
        <FilterSection
          title="Customer Ratings"
          icon={<Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
          defaultOpen={false}
        >
          <div className="space-y-1">
            {[
              { rating: 4, label: "4★ & above" },
              { rating: 3, label: "3★ & above" },
            ].map((r) => {
              const isSelected = filters.rating === r.rating;
              return (
                <button
                  key={r.rating}
                  type="button"
                  onClick={() => update({ rating: isSelected ? 0 : r.rating })}
                  className={`flex items-center justify-between w-full py-1.5 px-2 rounded-xl text-xs font-semibold transition ${
                    isSelected
                      ? "bg-amber-50 text-amber-800 font-bold border border-amber-200"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="flex items-center gap-0.5 text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                    </span>
                    <span>{r.label}</span>
                  </span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-amber-600" />}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Availability */}
        <FilterSection
          title="Availability"
          icon={<Package className="h-3 w-3 text-blue-600" />}
          defaultOpen={true}
        >
          <label className="flex items-center gap-2.5 py-1 cursor-pointer group">
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                filters.inStockOnly
                  ? "border-blue-600 bg-blue-600"
                  : "border-slate-300 bg-white group-hover:border-blue-400"
              }`}
            >
              {filters.inStockOnly && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
            </span>
            <button
              type="button"
              onClick={() => update({ inStockOnly: !filters.inStockOnly })}
              className={`text-xs font-semibold w-full text-left transition ${
                filters.inStockOnly ? "text-blue-700 font-extrabold" : "text-slate-700 hover:text-blue-700"
              }`}
            >
              Exclude Out of Stock
            </button>
          </label>
        </FilterSection>

        {/* Cross-category link */}
        {filters.category !== "all" && filters.search && totalCatalogMatches !== undefined && totalCatalogMatches > resultCount && (
          <div className="py-3">
            <button
              type="button"
              onClick={() => {
                if (onSelectAllCategories) {
                  onSelectAllCategories();
                } else {
                  update({ category: "all", subCategory: "all", searchScope: "all" });
                }
              }}
              className="w-full text-center text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 py-2 rounded-xl transition"
            >
              View {totalCatalogMatches} results across all categories →
            </button>
          </div>
        )}

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>
    </div>
  );

  return (
    <>
      {/* ─── Desktop Sidebar (always visible lg+) ─── */}
      <aside className="hidden lg:flex flex-col w-[275px] shrink-0 bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden self-start sticky top-[84px] max-h-[calc(100vh-96px)]">
        {sidebarContent}
      </aside>

      {/* ─── Mobile Drawer Overlay ─── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <div className="fixed inset-y-0 left-0 z-50 flex flex-col w-[85vw] max-w-xs bg-white shadow-2xl lg:hidden animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
