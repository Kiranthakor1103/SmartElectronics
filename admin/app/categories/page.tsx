'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
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
  DeleteConfirmModal,
} from '../components/ui';
import {
  FolderTree,
  Plus,
  Smartphone,
  Laptop,
  Tv,
  Headphones,
  Watch,
  Cpu,
  Gamepad2,
  Zap,
  Wind,
  Coffee,
  Camera,
  Layers,
  CheckCircle2,
  Edit2,
  Trash2,
  RefreshCcw,
  X,
  Save,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Mobile & Tablets': <Smartphone className="w-4 h-4 text-blue-600" />,
  'Laptops & Computers': <Laptop className="w-4 h-4 text-indigo-600" />,
  'TVs & Entertainment': <Tv className="w-4 h-4 text-cyan-600" />,
  'Audio Devices': <Headphones className="w-4 h-4 text-violet-600" />,
  'Smart Devices': <Watch className="w-4 h-4 text-emerald-600" />,
  'Computer Accessories': <Cpu className="w-4 h-4 text-slate-600" />,
  'Gaming Zone': <Gamepad2 className="w-4 h-4 text-rose-600" />,
  'Power & Charging': <Zap className="w-4 h-4 text-amber-500" />,
  'Home Appliances': <Wind className="w-4 h-4 text-teal-600" />,
  'Kitchen Appliances': <Coffee className="w-4 h-4 text-orange-600" />,
  'Cameras & Security': <Camera className="w-4 h-4 text-pink-600" />,
};

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  subCount: number;
  itemCount: number;
  status: 'active' | 'inactive';
}

const FALLBACK_CATEGORIES: CategoryData[] = [
  { id: '1', name: 'Mobile & Tablets', slug: 'mobile-tablets', subCount: 7, itemCount: 45, status: 'active' },
  { id: '2', name: 'Laptops & Computers', slug: 'laptops-computers', subCount: 6, itemCount: 32, status: 'active' },
  { id: '3', name: 'TVs & Entertainment', slug: 'tvs-entertainment', subCount: 9, itemCount: 28, status: 'active' },
  { id: '4', name: 'Audio Devices', slug: 'audio-devices', subCount: 7, itemCount: 54, status: 'active' },
  { id: '5', name: 'Smart Devices', slug: 'smart-devices', subCount: 5, itemCount: 26, status: 'active' },
  { id: '6', name: 'Computer Accessories', slug: 'computer-accessories', subCount: 10, itemCount: 68, status: 'active' },
  { id: '7', name: 'Gaming Zone', slug: 'gaming-zone', subCount: 8, itemCount: 38, status: 'active' },
  { id: '8', name: 'Power & Charging', slug: 'power-charging', subCount: 7, itemCount: 42, status: 'active' },
  { id: '9', name: 'Home Appliances', slug: 'home-appliances', subCount: 13, itemCount: 40, status: 'active' },
  { id: '10', name: 'Kitchen Appliances', slug: 'kitchen-appliances', subCount: 6, itemCount: 29, status: 'active' },
  { id: '11', name: 'Cameras & Security', slug: 'cameras-security', subCount: 6, itemCount: 18, status: 'active' },
];

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);

  // Add/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
  const [formName, setFormName] = useState('');
  const [saving, setSaving] = useState(false);

  const isFetchingRef = useRef(false);

  async function fetchData() {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    try {
      const catRes = await ApiClient.get('/admin/categories');
      if (catRes?.success && catRes.data) {
        const catList = catRes.data.categories || (Array.isArray(catRes.data) ? catRes.data : []);
        setCategories(catList);
        setTotalProducts(
          catRes.data.totalProducts ??
            catList.reduce((acc: number, c: any) => acc + (c.itemCount || 0), 0)
        );
      } else {
        setCategories(FALLBACK_CATEGORIES);
      }
    } catch {
      toast('Failed to load categories', 'error');
      setCategories(FALLBACK_CATEGORIES);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }

  // Fetch once on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filtered = useMemo(() => {
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.slug.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedList = filtered.slice((validCurrentPage - 1) * pageSize, validCurrentPage * pageSize);

  const totalSubCats = categories.reduce((s, c) => s + c.subCount, 0);
  const totalItems = categories.reduce((s, c) => s + c.itemCount, 0);

  function openAdd() {
    setEditingCategory(null);
    setFormName('');
    setModalOpen(true);
  }
  function openEdit(cat: CategoryData) {
    setEditingCategory(cat);
    setFormName(cat.name);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!formName.trim()) { toast('Category name is required', 'error'); return; }
    setSaving(true);
    try {
      if (editingCategory) {
        await ApiClient.put(`/admin/categories/${editingCategory.id}`, {
          name: formName.trim(),
          slug: slugify(formName.trim()),
        });
        const updated = { ...editingCategory, name: formName.trim(), slug: slugify(formName.trim()) };
        setCategories((prev) => prev.map((c) => (c.id === editingCategory.id ? updated : c)));
        toast(`Category "${formName}" updated`, 'success');
      } else {
        const res = await ApiClient.post('/admin/categories', {
          name: formName.trim(),
          slug: slugify(formName.trim()),
        });
        const createdId = res?.data?._id || Date.now().toString();
        const newCat: CategoryData = {
          id: createdId,
          name: formName.trim(),
          slug: slugify(formName.trim()),
          subCount: 0,
          itemCount: 0,
          status: 'active',
        };
        setCategories((prev) => [...prev, newCat]);
        toast(`Category "${formName}" added`, 'success');
      }
      setModalOpen(false);
    } catch {
      toast('Failed to save category', 'error');
    } finally {
      setSaving(false);
    }
  }

  const [deleteTarget, setDeleteTarget] = useState<CategoryData | null>(null);

  function handleDelete(cat: CategoryData) {
    setDeleteTarget(cat);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await ApiClient.delete(`/admin/categories/${deleteTarget.id}`);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast(`Category "${deleteTarget.name}" deleted successfully`, 'success');
    } catch {
      toast('Failed to delete category', 'error');
    } finally {
      setDeleteTarget(null);
    }
  }

  async function toggleStatus(cat: CategoryData) {
    const nextStatus = cat.status === 'active' ? 'inactive' : 'active';
    try {
      await ApiClient.put(`/admin/categories/${cat.id}`, { status: nextStatus });
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, status: nextStatus } : c))
      );
      toast(`${cat.name} marked ${nextStatus}`, 'success');
    } catch {
      toast('Failed to update category status', 'error');
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Product Categories"
          subtitle="Manage 11 electronics departments, navigation slugs, and storefront hierarchy"
        />

        <main className="p-4 sm:p-6 space-y-6 flex-1 max-w-7xl w-full">

          {/* Live Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard
              title="Total Categories"
              value={loading ? '—' : String(categories.length)}
              icon={<FolderTree className="w-5 h-5 text-blue-600" />}
              accentColor="indigo"
              subtitle="Electronics departments"
            />
            <StatCard
              title="Sub-Categories Total"
              value={loading ? '—' : String(totalSubCats)}
              icon={<Layers className="w-5 h-5 text-indigo-600" />}
              accentColor="violet"
              subtitle="Across all departments"
            />
            <StatCard
              title="Live Catalog Products"
              value={loading ? '—' : String(totalProducts)}
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              accentColor="emerald"
              subtitle="Active in store"
            />
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="w-full sm:w-80">
              <SearchInput
                placeholder="Search category name or slug..."
                value={search}
                onChange={(v) => { setSearch(v); setCurrentPage(1); }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={fetchData}
                className="flex items-center gap-1.5 text-xs"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                Refresh
              </Button>
              <Button
                variant="primary"
                onClick={openAdd}
                className="flex items-center gap-1.5 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Category
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-8">
                <Loader size="md" label="Loading categories from catalog..." />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>URL Slug</TableHead>
                    <TableHead>Sub-Categories</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedList.length === 0 ? (
                    <TableEmptyState
                      colSpan={7}
                      icon={<FolderTree className="w-8 h-8 text-slate-300" />}
                      title="No categories found"
                      description="Try adjusting your search query"
                    />
                  ) : (
                    paginatedList.map((cat, i) => (
                      <TableRow key={cat.id}>
                        <TableCell className="text-slate-500 text-xs font-semibold">
                          {(currentPage - 1) * pageSize + i + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 border border-slate-100">
                              {CATEGORY_ICONS[cat.name] ?? <FolderTree className="w-4 h-4 text-slate-400" />}
                            </div>
                            <span className="font-bold text-slate-900 text-sm">{cat.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{cat.slug}</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="indigo" size="sm">{cat.subCount} sub</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-slate-800">{cat.itemCount}</span>
                          <span className="text-slate-400 text-xs ml-1">items</span>
                        </TableCell>
                        <TableCell>
                          <button type="button" onClick={() => toggleStatus(cat)}>
                            <Badge variant={cat.status === 'active' ? 'success' : 'warning'} size="sm" dot>
                              {cat.status === 'active' ? 'Active' : 'Inactive'}
                            </Badge>
                          </button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEdit(cat)}
                              className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-700 transition"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(cat)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          {totalPages > 1 && (
            <AdminPagination
              currentPage={validCurrentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={pageSize}
              itemsPerPageOptions={[5, 10, 20]}
              onItemsPerPageChange={(s: number) => { setPageSize(s); setCurrentPage(1); }}
              totalItems={filtered.length}
              itemName="categories"
            />
          )}
        </main>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                Category Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Mobile & Tablets"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:bg-white outline-none transition"
                autoFocus
              />
              {formName && (
                <p className="text-[11px] text-slate-400 mt-1">
                  Slug: <code className="font-mono text-slate-600">{slugify(formName)}</code>
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={saving || !formName.trim()}
                className="flex-1 flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving…' : editingCategory ? 'Update Category' : 'Add Category'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Common Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Category"
        itemName={deleteTarget?.name}
        message={`Are you sure you want to delete category "${deleteTarget?.name}"? All assigned products will need a new category.`}
      />
    </div>
  );
}
