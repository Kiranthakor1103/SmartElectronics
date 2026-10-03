'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/app/lib/redux/hooks';
import ProductCard from '@/app/components/ProductCard';
import { fetchProducts } from '@/app/lib/redux/features/product/productsSlice';
import { Loader, ProductGridSkeleton } from '@/app/components/ui/Loader';
import { Button } from '@/app/components/ui/Button';
import ScrollReveal from '@/app/components/ScrollReveal';
import ProductFiltersBar, {
  defaultFilters,
  filterAndSortProducts,
  type ProductFiltersState,
  type SortOption,
} from '@/app/components/ProductFilters';
import {
  Home,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  ArrowLeft,
  Search,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  Zap,
} from 'lucide-react';

const SORT_LABELS: Record<SortOption, string> = {
  featured: 'Featured',
  'price-asc': 'Price ↑',
  'price-desc': 'Price ↓',
  rating: 'Top Rated',
  name: 'A → Z',
};

export default function ProductsPageContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const products = useAppSelector((state) => state.products.items);
  const status = useAppSelector((state) => state.products.status);
  const error = useAppSelector((state) => state.products.error);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const [filters, setFilters] = useState<ProductFiltersState>(() => ({
    ...defaultFilters,
    search: searchParams.get('q') ?? '',
    category: searchParams.get('category') ?? 'all',
    subCategory: searchParams.get('subCategory') ?? 'all',
    brand: searchParams.get('brand') ?? 'all',
    rating: Number(searchParams.get('rating') ?? 0),
    sort: (searchParams.get('sort') as SortOption) ?? 'featured',
    minPrice: Number(searchParams.get('minPrice') ?? 0),
    maxPrice: Number(searchParams.get('maxPrice') ?? 300000),
    inStockOnly: searchParams.get('inStock') === 'true',
    searchScope: searchParams.get('scope') === 'all' ? 'all' : 'category',
  }));

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [dispatch, status]);

  // Sync state from URL changes
  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    const cat = searchParams.get('category') ?? 'all';
    const subCat = searchParams.get('subCategory') ?? 'all';
    const brand = searchParams.get('brand') ?? 'all';
    const rating = Number(searchParams.get('rating') ?? 0);
    const sort = (searchParams.get('sort') as SortOption) ?? 'featured';
    const minPrice = Number(searchParams.get('minPrice') ?? 0);
    const maxPrice = Number(searchParams.get('maxPrice') ?? 300000);
    const inStock = searchParams.get('inStock') === 'true';
    const scope = searchParams.get('scope') === 'all' ? 'all' : 'category';

    setFilters((prev) => {
      if (
        prev.search === q &&
        prev.category === cat &&
        prev.subCategory === subCat &&
        prev.brand === brand &&
        prev.rating === rating &&
        prev.sort === sort &&
        prev.minPrice === minPrice &&
        prev.maxPrice === maxPrice &&
        prev.inStockOnly === inStock &&
        prev.searchScope === scope
      ) {
        return prev;
      }
      return {
        ...prev,
        search: q,
        category: cat,
        subCategory: subCat,
        brand,
        rating,
        sort,
        minPrice,
        maxPrice,
        inStockOnly: inStock,
        searchScope: scope,
      };
    });
  }, [searchParams]);

  const syncUrlWithFilters = useCallback((nextFilters: ProductFiltersState) => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (nextFilters.category && nextFilters.category !== 'all') params.set('category', nextFilters.category);
    if (nextFilters.subCategory && nextFilters.subCategory !== 'all') params.set('subCategory', nextFilters.subCategory);
    if (nextFilters.brand && nextFilters.brand !== 'all') params.set('brand', nextFilters.brand);
    if (nextFilters.rating && nextFilters.rating > 0) params.set('rating', String(nextFilters.rating));
    if (nextFilters.search && nextFilters.search.trim()) params.set('q', nextFilters.search.trim());
    if (nextFilters.sort && nextFilters.sort !== 'featured') params.set('sort', nextFilters.sort);
    if (nextFilters.minPrice > 0) params.set('minPrice', String(nextFilters.minPrice));
    if (nextFilters.maxPrice < 300000) params.set('maxPrice', String(nextFilters.maxPrice));
    if (nextFilters.inStockOnly) params.set('inStock', 'true');
    if (nextFilters.searchScope === 'all' && nextFilters.category !== 'all' && nextFilters.search.trim()) {
      params.set('scope', 'all');
    }
    const queryString = params.toString();
    const targetUrl = queryString ? `/products?${queryString}` : '/products';
    const currentUrl = window.location.pathname + window.location.search;
    if (currentUrl !== targetUrl) window.history.replaceState(null, '', targetUrl);
  }, []);

  const handleFiltersChange = useCallback(
    (newFilters: ProductFiltersState) => {
      setFilters(newFilters);
      syncUrlWithFilters(newFilters);
    },
    [syncUrlWithFilters]
  );

  const filtered = useMemo(() => filterAndSortProducts(products, filters), [products, filters]);

  // Reset to page 1 whenever any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    filters.search,
    filters.category,
    filters.subCategory,
    filters.brand,
    filters.rating,
    filters.sort,
    filters.minPrice,
    filters.maxPrice,
    filters.inStockOnly,
    filters.searchScope,
  ]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedProducts = useMemo(() => {
    return filtered.slice(startIndex, endIndex);
  }, [filtered, startIndex, endIndex]);

  const handlePageChange = (newPage: number) => {
    const clamped = Math.min(Math.max(1, newPage), totalPages);
    setCurrentPage(clamped);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 140, behavior: 'smooth' });
    }
  };

  const allCatalogMatches = useMemo(() => {
    if (!filters.search.trim()) return [];
    return filterAndSortProducts(products, { ...filters, category: 'all', searchScope: 'all' });
  }, [products, filters]);

  const activeCategory = filters.category && filters.category !== 'all' ? filters.category : '';
  const activeSearch = filters.search.trim();
  const isSearchingInAll = filters.searchScope === 'all' || filters.category === 'all';

  const hasActiveFilters = Boolean(
    filters.search ||
      (filters.category && filters.category !== 'all') ||
      (filters.subCategory && filters.subCategory !== 'all') ||
      (filters.brand && filters.brand !== 'all') ||
      (filters.rating && filters.rating > 0) ||
      filters.inStockOnly ||
      filters.minPrice > 0 ||
      filters.maxPrice < 300000 ||
      filters.sort !== 'featured'
  );

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">

      {/* Top Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200/80 shadow-xs py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 flex-wrap">
            <Link href="/" className="flex items-center gap-1 hover:text-blue-600 transition text-slate-600 font-bold">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <button
              type="button"
              onClick={() => {
                const next = { ...filters, category: 'all', searchScope: 'all' as const };
                setFilters(next);
                syncUrlWithFilters(next);
              }}
              className="hover:text-blue-600 transition font-bold"
            >
              Products
            </button>
            {activeCategory && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <button
                  type="button"
                  onClick={() => {
                    const next = { ...filters, subCategory: 'all' };
                    setFilters(next);
                    syncUrlWithFilters(next);
                  }}
                  className="capitalize font-extrabold text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded"
                >
                  {activeCategory}
                </button>
              </>
            )}
            {filters.subCategory && filters.subCategory !== 'all' && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="capitalize font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {filters.subCategory}
                </span>
              </>
            )}
            {activeSearch && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="font-extrabold text-slate-800">"{activeSearch}"</span>
              </>
            )}
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-lg border border-blue-100 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
        </div>
      </div>

      {/* Loading / Error States */}
      {status === 'loading' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">
          <Loader size="lg" label="Loading products…" sublabel="Connecting to SmartElectronics catalog…" />
          <ProductGridSkeleton count={8} />
        </div>
      )}

      {status === 'failed' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-slate-200 mt-6">
          <p className="text-lg font-semibold text-rose-600">{error}</p>
          <Button variant="secondary" className="mt-6" onClick={() => dispatch(fetchProducts())}>
            Try Again
          </Button>
        </div>
      )}

      {status === 'succeeded' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">

          {/* ── Mobile Top Bar: title + filter button + sort ── */}
          <div className="flex items-center justify-between gap-3 mb-4 lg:hidden">
            <div className="min-w-0">
              <h1 className="text-base font-black text-slate-900 truncate">
                {filters.subCategory && filters.subCategory !== 'all'
                  ? filters.subCategory
                  : activeCategory
                  ? `${activeCategory}`
                  : activeSearch
                  ? `"${activeSearch}"`
                  : 'All Products'}
              </h1>
              <p className="text-[11px] text-slate-500 font-semibold">{filtered.length} products</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Mobile sort quick picker */}
              <select
                value={filters.sort}
                onChange={(e) => handleFiltersChange({ ...filters, sort: e.target.value as SortOption })}
                className="text-xs font-bold border border-slate-200 rounded-xl px-2 py-2 bg-white text-slate-700 focus:outline-none focus:border-blue-500"
                aria-label="Sort products"
              >
                {Object.entries(SORT_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>

              {/* Mobile filter toggle button */}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="relative flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-black text-white shadow-sm shadow-blue-500/30 transition hover:bg-blue-700"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-rose-500 text-[9px] font-black text-white flex items-center justify-center shadow">✓</span>
                )}
              </button>
            </div>
          </div>

          {/* ── Main two-column layout ── */}
          <div className="flex gap-6 items-start">

            {/* LEFT SIDEBAR FILTERS */}
            <ProductFiltersBar
              products={products}
              filters={filters}
              onChange={handleFiltersChange}
              resultCount={filtered.length}
              totalCatalogMatches={allCatalogMatches.length}
              onSelectAllCategories={() => {
                const next = { ...filters, category: 'all', subCategory: 'all', searchScope: 'all' as const };
                setFilters(next);
                syncUrlWithFilters(next);
              }}
              mobileOpen={mobileFiltersOpen}
              onMobileClose={() => setMobileFiltersOpen(false)}
            />

            {/* RIGHT: Product Grid */}
            <div className="flex-1 min-w-0">

              {/* Desktop: Title + result count + sort bar */}
              <div className="hidden lg:flex items-center justify-between mb-5 gap-4">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    {filters.subCategory && filters.subCategory !== 'all'
                      ? filters.subCategory
                      : activeCategory
                      ? `${activeCategory}`
                      : activeSearch
                      ? `Results for "${activeSearch}"`
                      : 'All Electronics & Deals'}
                  </h1>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5">
                    <Zap className="h-3 w-3 text-blue-600" />
                    {filtered.length} genuine product{filtered.length !== 1 ? 's' : ''} with SmartElectronics warranty
                  </p>
                </div>

                {/* Desktop Sort */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Sort:</span>
                  <div className="flex gap-1.5">
                    {Object.entries(SORT_LABELS).map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleFiltersChange({ ...filters, sort: val as SortOption })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          filters.sort === val
                            ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/25'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active filter tags row */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Active:</span>
                  {filters.category !== 'all' && (
                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-full px-2.5 py-0.5 text-[11px] font-bold">
                      {filters.category}
                      <button type="button" onClick={() => handleFiltersChange({ ...filters, category: 'all', subCategory: 'all', searchScope: 'all' })} className="hover:text-blue-900"><X className="h-2.5 w-2.5" /></button>
                    </span>
                  )}
                  {filters.subCategory && filters.subCategory !== 'all' && (
                    <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-full px-2.5 py-0.5 text-[11px] font-bold">
                      {filters.subCategory}
                      <button type="button" onClick={() => handleFiltersChange({ ...filters, subCategory: 'all' })} className="hover:text-indigo-900"><X className="h-2.5 w-2.5" /></button>
                    </span>
                  )}
                  {filters.brand && filters.brand !== 'all' && (
                    <span className="inline-flex items-center gap-1 bg-violet-100 text-violet-800 border border-violet-200 rounded-full px-2.5 py-0.5 text-[11px] font-bold">
                      Brand: {filters.brand}
                      <button type="button" onClick={() => handleFiltersChange({ ...filters, brand: 'all' })} className="hover:text-violet-900"><X className="h-2.5 w-2.5" /></button>
                    </span>
                  )}
                  {filters.rating ? (
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full px-2.5 py-0.5 text-[11px] font-bold">
                      ★ {filters.rating}+
                      <button type="button" onClick={() => handleFiltersChange({ ...filters, rating: 0 })} className="hover:text-amber-900"><X className="h-2.5 w-2.5" /></button>
                    </span>
                  ) : null}
                  {(filters.minPrice > 0 || (filters.maxPrice < 300000 && filters.maxPrice > 0)) && (
                    <span className="inline-flex items-center gap-1 bg-cyan-100 text-cyan-800 border border-cyan-200 rounded-full px-2.5 py-0.5 text-[11px] font-bold">
                      ₹{filters.minPrice.toLocaleString('en-IN')} – ₹{filters.maxPrice.toLocaleString('en-IN')}
                      <button type="button" onClick={() => handleFiltersChange({ ...filters, minPrice: 0, maxPrice: 300000 })} className="hover:text-cyan-900"><X className="h-2.5 w-2.5" /></button>
                    </span>
                  )}
                  {filters.search && (
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-full px-2.5 py-0.5 text-[11px] font-bold">
                      "{filters.search}"
                      <button type="button" onClick={() => handleFiltersChange({ ...filters, search: '' })} className="hover:text-slate-900"><X className="h-2.5 w-2.5" /></button>
                    </span>
                  )}
                  {filters.inStockOnly && (
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full px-2.5 py-0.5 text-[11px] font-bold">
                      In Stock
                      <button type="button" onClick={() => handleFiltersChange({ ...filters, inStockOnly: false })} className="hover:text-emerald-900"><X className="h-2.5 w-2.5" /></button>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const maxP = Math.max(...products.map((p) => p.price), 300000);
                      setFilters({ ...defaultFilters, maxPrice: maxP });
                      syncUrlWithFilters({ ...defaultFilters, maxPrice: maxP });
                    }}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 px-2.5 py-0.5 rounded-full transition"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Cross-category suggestion */}
              {!isSearchingInAll && filtered.length === 0 && allCatalogMatches.length > 0 && (
                <div className="rounded-2xl border-2 border-blue-200/80 bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/80 p-6 text-center shadow-xs mb-6">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white mb-3">
                    <Search className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">
                    No matches in "{activeCategory}" for "{filters.search}"
                  </h3>
                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    Found <span className="font-black text-blue-600">{allCatalogMatches.length} products</span> in All Categories!
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-3">
                    <Button
                      variant="primary"
                      onClick={() => {
                        const next = { ...filters, category: 'all', searchScope: 'all' as const };
                        setFilters(next);
                        syncUrlWithFilters(next);
                      }}
                    >
                      Show All {allCatalogMatches.length} Results
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const next = { ...filters, search: '' };
                        setFilters(next);
                        syncUrlWithFilters(next);
                      }}
                    >
                      Clear Search
                    </Button>
                  </div>
                </div>
              )}

              {/* No results */}
              {filtered.length === 0 && (isSearchingInAll || allCatalogMatches.length === 0) ? (
                <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-xs">
                  <p className="text-lg font-semibold text-slate-900">No products found</p>
                  <p className="mt-2 text-slate-500 text-sm">
                    {filters.search
                      ? `No products matched "${filters.search}". Try another keyword or reset filters.`
                      : 'Try adjusting your filters.'}
                  </p>
                  <div className="mt-6 flex justify-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFilters(defaultFilters);
                        syncUrlWithFilters(defaultFilters);
                      }}
                    >
                      Reset Filters
                    </Button>
                    <Button variant="primary" onClick={() => router.push('/')}>
                      Return to Home
                    </Button>
                  </div>
                </div>
              ) : (
                /* Product Grid: 2 cols mobile, 3 cols md, 3 cols lg (sidebar takes space) */
                <>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
                    {paginatedProducts.map((product, i) => (
                      <ScrollReveal key={product.id} className={i % 3 === 1 ? 'md:mt-2' : ''}>
                        <ProductCard product={product} />
                      </ScrollReveal>
                    ))}
                  </div>

                  {/* Catalog Pagination Controls */}
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                    {/* Item count summary */}
                    <div className="text-xs font-semibold text-slate-500">
                      Showing <span className="font-bold text-slate-800">{totalItems > 0 ? startIndex + 1 : 0}</span> to{' '}
                      <span className="font-bold text-slate-800">{endIndex}</span> of{' '}
                      <span className="font-bold text-blue-600">{totalItems}</span> products
                    </div>

                    {/* Page buttons */}
                    {totalPages > 1 && (
                      <div className="flex items-center gap-1.5 flex-wrap justify-center">
                        {/* First page */}
                        <button
                          type="button"
                          onClick={() => handlePageChange(1)}
                          disabled={validCurrentPage === 1}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition text-xs font-bold"
                          title="First Page"
                        >
                          <ChevronsLeft className="h-3.5 w-3.5" />
                        </button>

                        {/* Prev page */}
                        <button
                          type="button"
                          onClick={() => handlePageChange(validCurrentPage - 1)}
                          disabled={validCurrentPage === 1}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition text-xs font-bold"
                          title="Previous Page"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </button>

                        {/* Numeric page pills */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((p) => {
                            if (totalPages <= 7) return true;
                            if (p === 1 || p === totalPages) return true;
                            return Math.abs(p - validCurrentPage) <= 1;
                          })
                          .map((p, idx, arr) => {
                            const prev = arr[idx - 1];
                            const showEllipsis = prev && p - prev > 1;
                            return (
                              <span key={p} className="flex items-center">
                                {showEllipsis && (
                                  <span className="px-1 text-slate-400 text-xs font-bold select-none">…</span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handlePageChange(p)}
                                  className={`inline-flex h-8 min-w-[32px] px-2.5 items-center justify-center rounded-lg text-xs font-bold transition ${
                                    validCurrentPage === p
                                      ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30'
                                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  {p}
                                </button>
                              </span>
                            );
                          })}

                        {/* Next page */}
                        <button
                          type="button"
                          onClick={() => handlePageChange(validCurrentPage + 1)}
                          disabled={validCurrentPage === totalPages}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition text-xs font-bold"
                          title="Next Page"
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>

                        {/* Last page */}
                        <button
                          type="button"
                          onClick={() => handlePageChange(totalPages)}
                          disabled={validCurrentPage === totalPages}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition text-xs font-bold"
                          title="Last Page"
                        >
                          <ChevronsRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Page size selector */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <span>Per page:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value={12}>12</option>
                        <option value={24}>24</option>
                        <option value={48}>48</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
