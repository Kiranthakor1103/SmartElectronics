'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Boxes,
  Plus,
  Sliders,
  CheckCircle2,
  Edit2,
  Trash2,
  X,
  Save,
  Layers,
  Sparkles,
  RefreshCcw,
} from 'lucide-react';

export interface VariantItem {
  id: string;
  baseProduct: string;
  variantType: string;
  options: string;
  skuCount: number;
  status: 'Active' | 'Inactive';
}

const DEFAULT_VARIANTS: VariantItem[] = [
  {
    id: '1',
    baseProduct: 'Apple iPhone 15 Pro Max',
    variantType: 'Storage & Color',
    options: '256GB / 512GB / 1TB • Titanium Black, Natural, Blue',
    skuCount: 9,
    status: 'Active',
  },
  {
    id: '2',
    baseProduct: 'Samsung Galaxy S24 Ultra',
    variantType: 'Storage & Color',
    options: '256GB / 512GB / 1TB • Titanium Gray, Black, Violet',
    skuCount: 9,
    status: 'Active',
  },
  {
    id: '3',
    baseProduct: 'MacBook Pro 16-inch M3',
    variantType: 'Unified Memory & SSD',
    options: '36GB / 48GB / 128GB • 1TB / 2TB / 4TB SSD',
    skuCount: 6,
    status: 'Active',
  },
  {
    id: '4',
    baseProduct: 'ASUS ROG Strix SCAR 16',
    variantType: 'GPU & Display',
    options: 'RTX 4080 (240Hz Mini LED) / RTX 4090 (240Hz)',
    skuCount: 2,
    status: 'Active',
  },
  {
    id: '5',
    baseProduct: 'Sony Bravia XR OLED TV',
    variantType: 'Screen Size',
    options: '55-inch / 65-inch / 77-inch',
    skuCount: 3,
    status: 'Active',
  },
  {
    id: '6',
    baseProduct: 'LG AI Dual Inverter AC',
    variantType: 'Tonnage & Star Rating',
    options: '1.0 Ton 5-Star / 1.5 Ton 5-Star / 2.0 Ton 3-Star',
    skuCount: 3,
    status: 'Active',
  },
  {
    id: '7',
    baseProduct: 'Havells Adonia Storage Geyser',
    variantType: 'Capacity',
    options: '10 Litres / 15 Litres / 25 Litres',
    skuCount: 3,
    status: 'Active',
  },
];

const VARIANT_TYPE_OPTIONS = [
  'Storage & Color',
  'Unified Memory & SSD',
  'GPU & Display',
  'Screen Size',
  'Tonnage & Star Rating',
  'Capacity & Power',
  'Connectivity & Band',
];

const STORAGE_KEY = 'smart_admin_variants_v2';

export default function AdminVariantsPage() {
  const { toast } = useToast();
  const [variants, setVariants] = useState<VariantItem[]>(DEFAULT_VARIANTS);
  const [catalogProducts, setCatalogProducts] = useState<string[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<VariantItem | null>(null);
  const [formBaseProduct, setFormBaseProduct] = useState('');
  const [formVariantType, setFormVariantType] = useState(VARIANT_TYPE_OPTIONS[0]);
  const [formOptions, setFormOptions] = useState('');
  const [formSkuCount, setFormSkuCount] = useState(3);
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [saving, setSaving] = useState(false);

  // Load live catalog products for dropdown
  async function loadProducts() {
    setLoadingProducts(true);
    try {
      const res = await ApiClient.get('/admin/products?limit=200');
      const prods: any[] = res?.data?.products || res?.data || [];
      const titles = Array.from(new Set(prods.map((p: any) => p.title || p.name).filter(Boolean)));
      if (titles.length > 0) {
        setCatalogProducts(titles as string[]);
        if (!formBaseProduct) setFormBaseProduct(titles[0] as string);
      }
    } catch {
      // ignore
    } finally {
      setLoadingProducts(false);
    }
  }

  // Load variants on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setVariants(parsed);
        }
      }
    } catch {
      // ignore
    }
    loadProducts();
  }, []);

  function persistVariants(list: VariantItem[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  function handleOpenAdd() {
    setEditingVariant(null);
    setFormBaseProduct(catalogProducts[0] || 'Apple iPhone 15 Pro Max');
    setFormVariantType(VARIANT_TYPE_OPTIONS[0]);
    setFormOptions('128GB / 256GB / 512GB');
    setFormSkuCount(3);
    setFormStatus('Active');
    setModalOpen(true);
  }

  function handleOpenEdit(v: VariantItem) {
    setEditingVariant(v);
    setFormBaseProduct(v.baseProduct);
    setFormVariantType(v.variantType);
    setFormOptions(v.options);
    setFormSkuCount(v.skuCount);
    setFormStatus(v.status);
    setModalOpen(true);
  }

  function handleSave() {
    if (!formBaseProduct.trim()) {
      toast('Base product is required', 'error');
      return;
    }
    if (!formOptions.trim()) {
      toast('Options matrix is required', 'error');
      return;
    }

    setSaving(true);
    try {
      let updated: VariantItem[];
      if (editingVariant) {
        updated = variants.map((v) =>
          v.id === editingVariant.id
            ? {
                ...v,
                baseProduct: formBaseProduct.trim(),
                variantType: formVariantType,
                options: formOptions.trim(),
                skuCount: Number(formSkuCount) || 1,
                status: formStatus,
              }
            : v
        );
        toast(`Variant matrix for "${formBaseProduct}" updated`, 'success');
      } else {
        const newV: VariantItem = {
          id: `var-${Date.now()}`,
          baseProduct: formBaseProduct.trim(),
          variantType: formVariantType,
          options: formOptions.trim(),
          skuCount: Number(formSkuCount) || 1,
          status: formStatus,
        };
        updated = [newV, ...variants];
        toast(`New variant matrix defined!`, 'success');
      }

      setVariants(updated);
      persistVariants(updated);
      setModalOpen(false);
    } catch {
      toast('Failed to save variant', 'error');
    } finally {
      setSaving(false);
    }
  }

  const [deleteTargetVariant, setDeleteTargetVariant] = useState<VariantItem | null>(null);

  function handleDelete(v: VariantItem) {
    setDeleteTargetVariant(v);
  }

  function confirmDeleteVariant() {
    if (!deleteTargetVariant) return;
    const updated = variants.filter((x) => x.id !== deleteTargetVariant.id);
    setVariants(updated);
    persistVariants(updated);
    toast(`Variant matrix for "${deleteTargetVariant.baseProduct}" deleted successfully`, 'success');
    setDeleteTargetVariant(null);
  }

  function handleToggleStatus(v: VariantItem) {
    const nextStatus: VariantItem['status'] = v.status === 'Active' ? 'Inactive' : 'Active';
    const updated = variants.map((item) => (item.id === v.id ? { ...item, status: nextStatus } : item));
    setVariants(updated);
    persistVariants(updated);
    toast(`Variant matrix set to ${nextStatus}`, 'success');
  }

  const filtered = useMemo(() => {
    return variants.filter(
      (v) =>
        v.baseProduct.toLowerCase().includes(search.toLowerCase()) ||
        v.variantType.toLowerCase().includes(search.toLowerCase()) ||
        v.options.toLowerCase().includes(search.toLowerCase())
    );
  }, [variants, search]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedList = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalSubSkus = variants.reduce((acc, v) => acc + (v.skuCount || 0), 0);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Product Variants & SKU Permutations"
          subtitle="Configure multi-tier hardware permutations: RAM, Storage, Screen Sizes, and Color matrices."
        />

        <main className="p-4 sm:p-6 space-y-6 flex-1 max-w-7xl w-full">
          {/* Dynamic Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard
              title="Multi-Variant Devices"
              value={`${variants.length} Models`}
              icon={<Boxes className="w-5 h-5 text-blue-600" />}
            />
            <StatCard
              title="Active Sub-SKUs"
              value={`${totalSubSkus} Variants`}
              icon={<Sliders className="w-5 h-5 text-indigo-600" />}
            />
            <StatCard
              title="Price Sync Status"
              value="Live & Linked"
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            />
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="w-full sm:w-80">
              <SearchInput
                placeholder="Search base device or variant..."
                value={search}
                onChange={setSearch}
                onClear={() => setSearch('')}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadProducts}
                disabled={loadingProducts}
                className="flex items-center gap-1.5 text-xs text-slate-700"
              >
                <RefreshCcw className={`w-3.5 h-3.5 ${loadingProducts ? 'animate-spin text-blue-600' : ''}`} />
                <span>Sync Products</span>
              </Button>
              <Button variant="primary" onClick={handleOpenAdd} className="flex items-center gap-1.5 text-xs">
                <Plus className="w-4 h-4" />
                <span>Define New Variant</span>
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {filtered.length === 0 ? (
              <TableEmptyState
                icon={<Boxes className="w-10 h-10 text-slate-400" />}
                title="No variants found"
                description="Try clearing your search query or add a new variant matrix."
                action={
                  <Button variant="outline" size="sm" onClick={() => setSearch('')}>
                    Clear Search
                  </Button>
                }
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Base Electronics Model</TableHead>
                      <TableHead>Variant Attributes</TableHead>
                      <TableHead>Available Options Matrix</TableHead>
                      <TableHead>Linked SKUs</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedList.map((v) => (
                      <TableRow key={v.id} className="hover:bg-slate-50/70 transition-colors">
                        <TableCell>
                          <span className="font-bold text-xs text-slate-900">{v.baseProduct}</span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                            {v.variantType}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-slate-600 font-medium">{v.options}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-xs text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded-md border border-indigo-100">
                            {v.skuCount} SKUs
                          </span>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => handleToggleStatus(v)}
                            className="cursor-pointer hover:opacity-85 transition-opacity"
                            title="Click to toggle status"
                          >
                            <Badge variant={v.status === 'Active' ? 'success' : 'warning'}>{v.status}</Badge>
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(v)}
                              title="Edit Variant"
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(v)}
                              title="Delete Variant"
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
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filtered.length}
                  itemsPerPage={pageSize}
                  onPageChange={setCurrentPage}
                  itemsPerPageOptions={[5, 10]}
                  onItemsPerPageChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  itemName="device variants"
                />
              </>
            )}
          </div>
        </main>
      </div>

      {/* Add / Edit Variant Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Boxes className="w-4 h-4" />
                </div>
                <h3 className="font-black text-sm text-slate-900">
                  {editingVariant ? `Edit Variant: ${editingVariant.baseProduct}` : 'Define New Variant Matrix'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Base Product *</label>
                {catalogProducts.length > 0 ? (
                  <CustomDropdown
                    options={catalogProducts.map((title) => ({ label: title, value: title }))}
                    value={formBaseProduct}
                    onChange={(val) => setFormBaseProduct(val)}
                    direction="auto"
                  />
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. Apple iPhone 15 Pro Max"
                    value={formBaseProduct}
                    onChange={(e) => setFormBaseProduct(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Variant Type</label>
                <CustomDropdown
                  options={VARIANT_TYPE_OPTIONS.map((t) => ({ label: t, value: t }))}
                  value={formVariantType}
                  onChange={(val) => setFormVariantType(val)}
                  direction="auto"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Options Matrix *</label>
                <input
                  type="text"
                  placeholder="e.g. 256GB / 512GB / 1TB • Titanium Gray, Black"
                  value={formOptions}
                  onChange={(e) => setFormOptions(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Linked Sub-SKUs</label>
                  <input
                    type="number"
                    min="1"
                    value={formSkuCount}
                    onChange={(e) => setFormSkuCount(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <CustomDropdown
                    options={[
                      { label: 'Active', value: 'Active', colorDot: 'bg-emerald-500' },
                      { label: 'Inactive', value: 'Inactive', colorDot: 'bg-slate-400' },
                    ]}
                    value={formStatus}
                    onChange={(val) => setFormStatus(val as any)}
                    direction="auto"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave} disabled={saving} className="flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Matrix'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Common Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTargetVariant)}
        onClose={() => setDeleteTargetVariant(null)}
        onConfirm={confirmDeleteVariant}
        title="Delete Variant Matrix"
        itemName={deleteTargetVariant?.baseProduct}
        message={`Are you sure you want to delete variants for "${deleteTargetVariant?.baseProduct}"? All linked SKU variants and technical attributes will be permanently removed.`}
      />
    </div>
  );
}
