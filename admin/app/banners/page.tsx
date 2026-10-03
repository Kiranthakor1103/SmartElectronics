'use client';

import { useState, useEffect, useMemo } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import AdminPagination from '../components/AdminPagination';
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
  CustomDropdown,
  DeleteConfirmModal,
} from '../components/ui';
import {
  Image as ImageIcon,
  Plus,
  CheckCircle2,
  Eye,
  Edit2,
  Trash2,
  ExternalLink,
  X,
  Save,
  Clock,
  PauseCircle,
} from 'lucide-react';

export interface BannerItem {
  id: string;
  title: string;
  placement: string;
  link: string;
  status: 'Active' | 'Scheduled' | 'Paused';
  impressions: string;
  imageUrl?: string;
}

const DEFAULT_BANNERS: BannerItem[] = [
  {
    id: '1',
    title: 'Mega Tech Fest 2026',
    placement: 'Home Hero (Desktop/Mobile)',
    link: '/deals',
    status: 'Active',
    impressions: '142,000',
    imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    title: 'M3 Max MacBook Pro Special',
    placement: 'Laptops Category Header',
    link: '/products/4',
    status: 'Active',
    impressions: '58,400',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: '3',
    title: 'Flagship OLED TV Festival',
    placement: 'TVs Department Top',
    link: '/products?category=TVs+%26+Entertainment',
    status: 'Active',
    impressions: '39,200',
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: '4',
    title: 'Galaxy S24 Ultra Pre-Orders',
    placement: 'Mobile Section Strip',
    link: '/products/2',
    status: 'Scheduled',
    impressions: '12,500',
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
  },
];

const PLACEMENT_OPTIONS = [
  'Home Hero (Desktop/Mobile)',
  'Laptops Category Header',
  'TVs Department Top',
  'Mobile Section Strip',
  'Audio & Gaming Showcase',
  'Deals Spotlight Banner',
  'Checkout Promo Strip',
];

const STORAGE_KEY = 'smart_admin_banners_v2';

export default function AdminBannersPage() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<BannerItem[]>(DEFAULT_BANNERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formPlacement, setFormPlacement] = useState(PLACEMENT_OPTIONS[0]);
  const [formLink, setFormLink] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Scheduled' | 'Paused'>('Active');
  const [formImpressions, setFormImpressions] = useState('0');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBanners(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  function persistBanners(list: BannerItem[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  function handleOpenAdd() {
    setEditingBanner(null);
    setFormTitle('');
    setFormPlacement(PLACEMENT_OPTIONS[0]);
    setFormLink('/products');
    setFormStatus('Active');
    setFormImpressions('0');
    setFormImageUrl('');
    setModalOpen(true);
  }

  function handleOpenEdit(banner: BannerItem) {
    setEditingBanner(banner);
    setFormTitle(banner.title);
    setFormPlacement(banner.placement);
    setFormLink(banner.link);
    setFormStatus(banner.status);
    setFormImpressions(banner.impressions);
    setFormImageUrl(banner.imageUrl || '');
    setModalOpen(true);
  }

  function handleSave() {
    if (!formTitle.trim()) {
      toast('Campaign title is required', 'error');
      return;
    }

    setSaving(true);
    try {
      let updated: BannerItem[];
      if (editingBanner) {
        updated = banners.map((b) =>
          b.id === editingBanner.id
            ? {
                ...b,
                title: formTitle.trim(),
                placement: formPlacement,
                link: formLink.trim() || '/products',
                status: formStatus,
                impressions: formImpressions,
                imageUrl: formImageUrl.trim(),
              }
            : b
        );
        toast(`Campaign "${formTitle}" updated successfully`, 'success');
      } else {
        const newBanner: BannerItem = {
          id: `banner-${Date.now()}`,
          title: formTitle.trim(),
          placement: formPlacement,
          link: formLink.trim() || '/products',
          status: formStatus,
          impressions: formImpressions === '0' ? '1,200' : formImpressions,
          imageUrl: formImageUrl.trim(),
        };
        updated = [newBanner, ...banners];
        toast(`New banner "${formTitle}" created!`, 'success');
      }

      setBanners(updated);
      persistBanners(updated);
      setModalOpen(false);
    } catch {
      toast('Failed to save banner', 'error');
    } finally {
      setSaving(false);
    }
  }

  const [deleteTargetBanner, setDeleteTargetBanner] = useState<BannerItem | null>(null);

  function handleDelete(banner: BannerItem) {
    setDeleteTargetBanner(banner);
  }

  function confirmDeleteBanner() {
    if (!deleteTargetBanner) return;
    const updated = banners.filter((b) => b.id !== deleteTargetBanner.id);
    setBanners(updated);
    persistBanners(updated);
    toast(`Campaign "${deleteTargetBanner.title}" deleted successfully`, 'success');
    setDeleteTargetBanner(null);
  }

  function handleToggleStatus(banner: BannerItem) {
    const nextStatus: 'Active' | 'Paused' = banner.status === 'Active' ? 'Paused' : 'Active';
    const updated = banners.map((b) => (b.id === banner.id ? { ...b, status: nextStatus } : b));
    setBanners(updated);
    persistBanners(updated);
    toast(`Campaign "${banner.title}" marked as ${nextStatus}`, 'success');
  }

  const filtered = useMemo(() => {
    return banners.filter((b) => {
      const matchSearch =
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.placement.toLowerCase().includes(search.toLowerCase()) ||
        b.link.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [banners, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedList = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const activeCount = banners.filter((b) => b.status === 'Active').length;
  const scheduledCount = banners.filter((b) => b.status === 'Scheduled').length;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Banners & Storefront Promotions"
          subtitle="Manage high-resolution promotional artwork, hero banners, and category campaign placements."
        />

        <main className="p-4 sm:p-6 space-y-6 flex-1 max-w-7xl w-full">
          {/* Dynamic Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard
              title="Active Campaigns"
              value={`${activeCount} Live`}
              icon={<ImageIcon className="w-5 h-5 text-blue-600" />}
            />
            <StatCard
              title="Total Impressions"
              value="252,100+"
              icon={<Eye className="w-5 h-5 text-indigo-600" />}
            />
            <StatCard
              title="Scheduled Drops"
              value={`${scheduledCount} Upcoming`}
              icon={<Clock className="w-5 h-5 text-emerald-600" />}
            />
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-72">
                <SearchInput
                  placeholder="Search campaign or placement..."
                  value={search}
                  onChange={setSearch}
                  onClear={() => setSearch('')}
                />
              </div>
              <div className="w-full sm:w-44">
                <CustomDropdown
                  options={[
                    { label: 'All Statuses', value: 'All' },
                    { label: 'Active', value: 'Active' },
                    { label: 'Scheduled', value: 'Scheduled' },
                    { label: 'Paused', value: 'Paused' },
                  ]}
                  value={statusFilter}
                  onChange={(v) => {
                    setStatusFilter(v);
                    setCurrentPage(1);
                  }}
                  direction="auto"
                />
              </div>
            </div>

            <Button variant="primary" onClick={handleOpenAdd} className="flex items-center gap-1.5 text-xs">
              <Plus className="w-4 h-4" />
              <span>Upload New Banner</span>
            </Button>
          </div>

          {/* Banners Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {filtered.length === 0 ? (
              <TableEmptyState
                icon={<ImageIcon className="w-10 h-10 text-slate-400" />}
                title="No banner campaigns found"
                description="Try adjusting your search query or status filter."
                action={
                  <Button variant="outline" size="sm" onClick={() => { setSearch(''); setStatusFilter('All'); }}>
                    Clear Filter
                  </Button>
                }
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign Title</TableHead>
                      <TableHead>Display Placement</TableHead>
                      <TableHead>Target Navigation Link</TableHead>
                      <TableHead>Impressions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedList.map((b) => (
                      <TableRow key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {b.imageUrl ? (
                                <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-xs text-slate-900 block">{b.title}</span>
                              <span className="text-[10px] text-slate-400">ID: {b.id}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-semibold text-slate-700">{b.placement}</span>
                        </TableCell>
                        <TableCell>
                          <code className="text-[11px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                            {b.link}
                          </code>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-xs text-blue-600">{b.impressions}</span>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => handleToggleStatus(b)}
                            className="cursor-pointer hover:opacity-85 transition-opacity"
                            title="Click to toggle status"
                          >
                            <Badge
                              variant={
                                b.status === 'Active' ? 'success' : b.status === 'Scheduled' ? 'sky' : 'warning'
                              }
                            >
                              {b.status}
                            </Badge>
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(b)}
                              title="Edit Banner"
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(b)}
                              title="Delete Banner"
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
                  itemName="campaign banners"
                />
              </>
            )}
          </div>
        </main>
      </div>

      {/* Add / Edit Banner Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h3 className="font-black text-sm text-slate-900">
                  {editingBanner ? `Edit Campaign: ${editingBanner.title}` : 'Upload New Banner Campaign'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Diwali Super Savings 2026"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Display Placement</label>
                <CustomDropdown
                  options={PLACEMENT_OPTIONS.map((p) => ({ label: p, value: p }))}
                  value={formPlacement}
                  onChange={(val) => setFormPlacement(val)}
                  direction="auto"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Link</label>
                <input
                  type="text"
                  placeholder="e.g. /deals or /products/1"
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Banner Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Status</label>
                  <CustomDropdown
                    options={[
                      { label: 'Active & Live', value: 'Active', colorDot: 'bg-emerald-500' },
                      { label: 'Scheduled', value: 'Scheduled', colorDot: 'bg-blue-500' },
                      { label: 'Paused', value: 'Paused', colorDot: 'bg-amber-400' },
                    ]}
                    value={formStatus}
                    onChange={(val) => setFormStatus(val as any)}
                    direction="auto"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Impressions</label>
                  <input
                    type="text"
                    value={formImpressions}
                    onChange={(e) => setFormImpressions(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
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
                <span>{saving ? 'Saving...' : 'Save Banner'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Common Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTargetBanner)}
        onClose={() => setDeleteTargetBanner(null)}
        onConfirm={confirmDeleteBanner}
        title="Delete Banner Campaign"
        itemName={deleteTargetBanner?.title}
        message={`Are you sure you want to delete banner campaign "${deleteTargetBanner?.title}"? It will immediately stop rendering on the storefront.`}
      />
    </div>
  );
}
