'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import AdminPagination from '../components/AdminPagination';
import { ApiClient } from '../lib/apiClient';
import { useToast } from '../components/ToastProvider';
import {
  StatCard,
  Button,
  SearchInput,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyState,
  Loader,
  CustomDropdown,
  DeleteConfirmModal,
} from '../components/ui';
import {
  Award,
  Plus,
  ShieldCheck,
  Star,
  RefreshCcw,
  Edit2,
  Trash2,
  ExternalLink,
  Layers,
  Building,
  CheckCircle2,
  X,
  Save,
  Globe2,
} from 'lucide-react';

export interface BrandPartner {
  id: string;
  name: string;
  origin: string;
  catalogItems: number;
  warranty: string;
  status: 'authorized' | 'pending' | 'inactive';
  categories?: string[];
  isCustom?: boolean;
}

const ORIGIN_MAP: Record<string, string> = {
  Apple: 'USA (Cupertino, CA)',
  Samsung: 'South Korea (Suwon)',
  Sony: 'Japan (Tokyo)',
  ASUS: 'Taiwan (Taipei)',
  Dell: 'USA (Round Rock, TX)',
  LG: 'South Korea (Seoul)',
  Philips: 'Netherlands (Amsterdam)',
  JBL: 'USA (Los Angeles, CA)',
  Anker: 'USA (Seattle, WA)',
  Logitech: 'Switzerland (Lausanne)',
  Havells: 'India (Noida, UP)',
  Belkin: 'USA (Playa Vista, CA)',
  Marshall: 'United Kingdom (Milton Keynes)',
  Nokia: 'Finland (Espoo)',
  Amazon: 'USA (Seattle, WA)',
  Panasonic: 'Japan (Osaka)',
  Eufy: 'USA (Seattle, WA)',
  Nintendo: 'Japan (Kyoto)',
  GoPro: 'USA (San Mateo, CA)',
  Google: 'USA (Mountain View, CA)',
  Canon: 'Japan (Tokyo)',
  Dyson: 'Singapore / UK',
  'TP-Link': 'China (Shenzhen)',
  HP: 'USA (Palo Alto, CA)',
  GM: 'India (Mumbai)',
  Meta: 'USA (Menlo Park, CA)',
  Fitbit: 'USA (San Francisco, CA)',
  TCL: 'China (Huizhou)',
  Microsoft: 'USA (Redmond, WA)',
  'Morphy Richards': 'United Kingdom',
  "De'Longhi": 'Italy (Treviso)',
};

const DEFAULT_WARRANTIES: Record<string, string> = {
  Apple: '1 Year Apple Manufacturer Warranty',
  Samsung: '1-20 Years (Compressor/Display Dependent)',
  Sony: '1-3 Years Comprehensive Sony Warranty',
  ASUS: '2 Years Onsite Brand Warranty + ADP',
  Dell: '3 Years Advanced Exchange Service',
  LG: '10 Years Compressor + 1 Year Comprehensive',
  Philips: '2-5 Years Domestic & Global Warranty',
  JBL: '1 Year Harman Brand Comprehensive',
  Anker: '2 Years Official Replacement Warranty',
  Logitech: '1-3 Years Hardware Limited Warranty',
  Havells: '7 Years Tank + 2 Years Comprehensive',
};

const STORAGE_KEY = 'smart_admin_custom_brands_v2';

export default function AdminBrandsPage() {
  const { toast } = useToast();
  const [brands, setBrands] = useState<BrandPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandPartner | null>(null);
  const [formName, setFormName] = useState('');
  const [formOrigin, setFormOrigin] = useState('');
  const [formWarranty, setFormWarranty] = useState('');
  const [formStatus, setFormStatus] = useState<'authorized' | 'pending' | 'inactive'>('authorized');
  const [formCategories, setFormCategories] = useState('');
  const [saving, setSaving] = useState(false);

  const isFetchingRef = useRef(false);

  // Load brands from API or Product catalog
  async function loadBrands() {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    try {
      // 1. Check custom overrides in localStorage
      let customBrands: BrandPartner[] = [];
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) customBrands = JSON.parse(saved);
      } catch {
        // ignore
      }

      // 2. Fetch live brands from API
      const res = await ApiClient.get('/admin/brands');
      let liveAggregated: any[] = [];

      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        liveAggregated = res.data;
      } else if (res?.success && Array.isArray(res.data)) {
        // Valid response but empty catalog
        liveAggregated = [];
      } else {
        // Fallback only if endpoint failed or returned unexpected payload
        const prodRes = await ApiClient.get('/admin/products?limit=100');
        const prods: any[] = prodRes?.data?.products || prodRes?.data || [];
        const groupMap: Record<string, { count: number; categories: Set<string>; warranties: Set<string> }> = {};

        for (const p of prods) {
          const b = (p.brand || '').trim();
          if (!b) continue;
          if (!groupMap[b]) {
            groupMap[b] = { count: 0, categories: new Set(), warranties: new Set() };
          }
          groupMap[b].count++;
          if (p.category) groupMap[b].categories.add(p.category);
          if (p.warranty) groupMap[b].warranties.add(p.warranty);
        }

        liveAggregated = Object.entries(groupMap).map(([brandName, val]) => ({
          _id: brandName,
          catalogItems: val.count,
          categories: Array.from(val.categories),
          warranties: Array.from(val.warranties),
        }));
      }

      // Merge DB brands with origin map and custom overrides
      const mergedList: BrandPartner[] = liveAggregated.map((item: any, idx: number) => {
        const name = item._id || item.name || 'Brand';
        const customMatch = customBrands.find((c) => c.name.toLowerCase() === name.toLowerCase());

        return {
          id: customMatch?.id || `brand-${idx + 1}`,
          name: name,
          origin: customMatch?.origin || ORIGIN_MAP[name] || 'Global / International',
          catalogItems: item.catalogItems || item.count || 1,
          warranty:
            customMatch?.warranty ||
            item.warranties?.[0] ||
            DEFAULT_WARRANTIES[name] ||
            '1 Year Official Brand Warranty',
          status: customMatch?.status || 'authorized',
          categories: item.categories || [],
          isCustom: customMatch?.isCustom || false,
        };
      });

      // Also append any purely custom brands added by admin that aren't in DB yet
      for (const custom of customBrands) {
        if (!mergedList.some((m) => m.name.toLowerCase() === custom.name.toLowerCase())) {
          mergedList.push(custom);
        }
      }

      // Sort by catalog items descending
      mergedList.sort((a, b) => b.catalogItems - a.catalogItems);
      setBrands(mergedList);
    } catch {
      toast('Failed to load dynamic brand catalog', 'error');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }

  useEffect(() => {
    loadBrands();
  }, []);

  // Save custom brands to localStorage
  function persistCustomBrands(updatedList: BrandPartner[]) {
    try {
      const customs = updatedList.filter((b) => b.isCustom || b.origin || b.warranty);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customs));
    } catch {
      // ignore
    }
  }

  // Open Add Modal
  function handleOpenAdd() {
    setEditingBrand(null);
    setFormName('');
    setFormOrigin('India');
    setFormWarranty('1 Year Comprehensive Brand Warranty');
    setFormStatus('authorized');
    setFormCategories('');
    setModalOpen(true);
  }

  // Open Edit Modal
  function handleOpenEdit(brand: BrandPartner) {
    setEditingBrand(brand);
    setFormName(brand.name);
    setFormOrigin(brand.origin);
    setFormWarranty(brand.warranty);
    setFormStatus(brand.status);
    setFormCategories((brand.categories || []).join(', '));
    setModalOpen(true);
  }

  // Handle Save
  function handleSaveBrand() {
    if (!formName.trim()) {
      toast('Brand name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      let updated: BrandPartner[];

      if (editingBrand) {
        // Edit existing
        updated = brands.map((b) => {
          if (b.id === editingBrand.id || b.name.toLowerCase() === editingBrand.name.toLowerCase()) {
            return {
              ...b,
              name: formName.trim(),
              origin: formOrigin.trim() || 'Global / International',
              warranty: formWarranty.trim() || '1 Year Manufacturer Warranty',
              status: formStatus,
              categories: formCategories ? formCategories.split(',').map((c) => c.trim()) : b.categories,
              isCustom: true,
            };
          }
          return b;
        });
        toast(`Brand "${formName}" updated successfully!`, 'success');
      } else {
        // Add new brand
        const newBrand: BrandPartner = {
          id: `custom-${Date.now()}`,
          name: formName.trim(),
          origin: formOrigin.trim() || 'India',
          catalogItems: 0,
          warranty: formWarranty.trim() || '1 Year Manufacturer Warranty',
          status: formStatus,
          categories: formCategories ? formCategories.split(',').map((c) => c.trim()) : ['Electronics'],
          isCustom: true,
        };
        updated = [newBrand, ...brands];
        toast(`Brand partner "${formName}" added successfully!`, 'success');
      }

      setBrands(updated);
      persistCustomBrands(updated);
      setModalOpen(false);
    } catch {
      toast('Failed to save brand partner', 'error');
    } finally {
      setSaving(false);
    }
  }

  const [deleteTargetBrand, setDeleteTargetBrand] = useState<BrandPartner | null>(null);

  // Handle Delete Request
  function handleDeleteBrand(brand: BrandPartner) {
    setDeleteTargetBrand(brand);
  }

  // Confirm Delete Action
  function confirmDeleteBrand() {
    if (!deleteTargetBrand) return;
    const updated = brands.filter((b) => b.id !== deleteTargetBrand.id && b.name !== deleteTargetBrand.name);
    setBrands(updated);
    persistCustomBrands(updated);
    toast(`Brand "${deleteTargetBrand.name}" deleted successfully`, 'success');
    setDeleteTargetBrand(null);
  }

  // Extract all categories for filtering
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    brands.forEach((b) => {
      (b.categories || []).forEach((c) => set.add(c));
    });
    return ['All', ...Array.from(set).sort()];
  }, [brands]);

  // Filtered List
  const filtered = useMemo(() => {
    return brands.filter((b) => {
      const matchSearch =
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.origin.toLowerCase().includes(search.toLowerCase()) ||
        b.warranty.toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        categoryFilter === 'All' ||
        (b.categories && b.categories.some((c) => c.toLowerCase() === categoryFilter.toLowerCase()));

      return matchSearch && matchCategory;
    });
  }, [brands, search, categoryFilter]);

  // Auto-reset page when search or category filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter]);

  // Pagination with safe bounds clamping
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedList = filtered.slice((validCurrentPage - 1) * pageSize, validCurrentPage * pageSize);

  // Compute live stats
  const totalBrandedSkus = brands.reduce((acc, b) => acc + (b.catalogItems || 0), 0);
  const authorizedCount = brands.filter((b) => b.status === 'authorized').length;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Authorized Brands & Partnerships"
          subtitle="Real-time electronics manufacturer catalog sync, warranty guidelines, and official storefront partnerships."
        />

        <main className="p-4 sm:p-6 space-y-6 flex-1 max-w-7xl w-full">
          {/* Dynamic Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatCard
              title="Active Brand Partners"
              value={loading ? '...' : `${brands.length} Brands`}
              icon={<Award className="w-5 h-5 text-blue-600" />}
            />
            <StatCard
              title="Official Authorized"
              value={loading ? '...' : `${authorizedCount} Verified`}
              icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
            />
            <StatCard
              title="Catalog Hardware SKUs"
              value={loading ? '...' : `${totalBrandedSkus} Models`}
              icon={<Star className="w-5 h-5 text-amber-500" />}
            />
            <StatCard
              title="Avg Warranty Coverage"
              value="100% Covered"
              icon={<CheckCircle2 className="w-5 h-5 text-indigo-600" />}
            />
          </div>

          {/* Action Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="w-full sm:w-72">
                <SearchInput
                  placeholder="Search brand name, origin, or warranty..."
                  value={search}
                  onChange={setSearch}
                  onClear={() => setSearch('')}
                />
              </div>

              {/* Category Filter */}
              <div className="w-full sm:w-56">
                <CustomDropdown
                  options={allCategories.map((c) => ({ label: c === 'All' ? 'All Departments' : c, value: c }))}
                  value={categoryFilter}
                  onChange={(val) => {
                    setCategoryFilter(val);
                    setCurrentPage(1);
                  }}
                  direction="auto"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                onClick={loadBrands}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-blue-600"
              >
                <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                <span>Sync DB</span>
              </Button>

              <Button
                variant="primary"
                onClick={handleOpenAdd}
                className="flex items-center gap-1.5 text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Brand Partner</span>
              </Button>
            </div>
          </div>

          {/* Brands Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader size="lg" />
                <p className="text-xs font-semibold text-slate-500">Synchronizing brand catalog with MongoDB...</p>
              </div>
            ) : filtered.length === 0 ? (
              <TableEmptyState
                icon={<Award className="w-10 h-10 text-slate-400" />}
                title="No brands found"
                description="Try clearing your search query or changing the department filter."
                action={
                  <Button variant="outline" size="sm" onClick={() => { setSearch(''); setCategoryFilter('All'); }}>
                    Clear Filters
                  </Button>
                }
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Brand Name & Partner</TableHead>
                      <TableHead>Headquarters / Origin</TableHead>
                      <TableHead>Live Catalog SKUs</TableHead>
                      <TableHead>Primary Departments</TableHead>
                      <TableHead>Standard Warranty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedList.map((b) => (
                      <TableRow key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                              {b.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-slate-900 text-xs">{b.name}</p>
                                {b.isCustom && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-50 text-amber-700 border border-amber-200 rounded">
                                    Custom
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400">Verified Direct Partner</p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                            <Globe2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>{b.origin}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="font-bold text-xs text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-100">
                            {b.catalogItems} Models
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {b.categories && b.categories.length > 0 ? (
                              b.categories.slice(0, 2).map((cat, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded truncate max-w-[130px]"
                                >
                                  {cat}
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-slate-400">General</span>
                            )}
                            {b.categories && b.categories.length > 2 && (
                              <span className="text-[9px] font-bold bg-slate-200 text-slate-600 px-1 py-0.5 rounded">
                                +{b.categories.length - 2}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-xs font-semibold text-slate-800 line-clamp-1 max-w-[220px]" title={b.warranty}>
                            {b.warranty}
                          </span>
                        </TableCell>

                        <TableCell>
                          <Badge variant={b.status === 'authorized' ? 'success' : b.status === 'pending' ? 'warning' : 'danger'}>
                            {b.status === 'authorized' ? 'Authorized' : b.status === 'pending' ? 'Pending Verification' : 'Inactive'}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(b)}
                              title="Edit Brand Information"
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBrand(b)}
                              title="Remove Brand"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <AdminPagination
                  currentPage={validCurrentPage}
                  totalPages={totalPages}
                  totalItems={filtered.length}
                  itemsPerPage={pageSize}
                  onPageChange={setCurrentPage}
                  itemsPerPageOptions={[5, 10, 20]}
                  onItemsPerPageChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  itemName="authorized brands"
                />
              </>
            )}
          </div>
        </main>
      </div>

      {/* Add / Edit Brand Partner Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-black text-sm text-slate-900">
                  {editingBrand ? `Edit Brand: ${editingBrand.name}` : 'Add New Brand Partner'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Bose, OnePlus, Razer..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Headquarters / Origin Country</label>
                <input
                  type="text"
                  placeholder="e.g. USA (Framingham, MA)"
                  value={formOrigin}
                  onChange={(e) => setFormOrigin(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Standard Brand Warranty</label>
                <input
                  type="text"
                  placeholder="e.g. 1 Year Manufacturer Warranty"
                  value={formWarranty}
                  onChange={(e) => setFormWarranty(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Associated Categories (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Audio Devices, Smart Devices"
                  value={formCategories}
                  onChange={(e) => setFormCategories(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Partnership Status</label>
                <CustomDropdown
                  options={[
                    { label: 'Authorized & Verified', value: 'authorized', colorDot: 'bg-emerald-500' },
                    { label: 'Pending Verification', value: 'pending', colorDot: 'bg-amber-400' },
                    { label: 'Inactive / Suspended', value: 'inactive', colorDot: 'bg-rose-500' },
                  ]}
                  value={formStatus}
                  onChange={(val) => setFormStatus(val as any)}
                  direction="auto"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveBrand} disabled={saving} className="flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Partner'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Common Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTargetBrand)}
        onClose={() => setDeleteTargetBrand(null)}
        onConfirm={confirmDeleteBrand}
        title="Remove Brand Partner"
        itemName={deleteTargetBrand?.name}
        message={`Are you sure you want to remove "${deleteTargetBrand?.name}" from authorized brand partners? Associated products will no longer display official brand badges.`}
      />
    </div>
  );
}
