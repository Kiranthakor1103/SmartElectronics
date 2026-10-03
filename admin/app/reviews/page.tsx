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
  CustomDropdown,
  DeleteConfirmModal,
} from '../components/ui';
import {
  Star,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  Check,
  EyeOff,
} from 'lucide-react';

export interface ReviewItem {
  id: string;
  customer: string;
  product: string;
  rating: number;
  comment: string;
  status: 'Published' | 'Pending' | 'Flagged';
  date: string;
}

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: 'REV-101',
    customer: 'Siddharth M.',
    product: 'Apple iPhone 15 Pro Max',
    rating: 5,
    comment: 'Phenomenal build and battery. Got delivered in under 24 hours with warranty card verified.',
    status: 'Published',
    date: '2026-09-08',
  },
  {
    id: 'REV-102',
    customer: 'Deepika K.',
    product: 'Sony Bravia 65 OLED TV',
    rating: 5,
    comment: 'Black levels are breathtaking. Free wall installation done next morning by authorized Sony team.',
    status: 'Published',
    date: '2026-09-07',
  },
  {
    id: 'REV-103',
    customer: 'Aman Patel',
    product: 'ASUS ROG Strix SCAR 16',
    rating: 5,
    comment: 'Handles Cyberpunk 2077 at 120+ FPS easily. Thermals are very well controlled.',
    status: 'Published',
    date: '2026-09-06',
  },
  {
    id: 'REV-104',
    customer: 'Kavita Roy',
    product: 'LG 1.5 Ton 5 Star Dual Inverter AC',
    rating: 4,
    comment: 'Cools my bedroom rapidly even during peak noon. Wi-Fi app setup was super easy.',
    status: 'Published',
    date: '2026-09-05',
  },
  {
    id: 'REV-105',
    customer: 'Rohan Deshmukh',
    product: 'Samsung Galaxy S24 Ultra',
    rating: 5,
    comment: 'The anti-reflective display is truly groundbreaking outdoors. S-Pen works seamlessly.',
    status: 'Published',
    date: '2026-09-04',
  },
];

const STORAGE_KEY = 'smart_admin_reviews_v2';

export default function AdminReviewsPage() {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<ReviewItem[]>(DEFAULT_REVIEWS);
  const [catalogProducts, setCatalogProducts] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [formCustomer, setFormCustomer] = useState('');
  const [formProduct, setFormProduct] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [formStatus, setFormStatus] = useState<ReviewItem['status']>('Published');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReviews(parsed);
        }
      }
    } catch {
      // ignore
    }

    // Load products
    ApiClient.get('/admin/products?limit=100').then((res) => {
      const prods: any[] = res?.data?.products || res?.data || [];
      const titles = Array.from(new Set(prods.map((p: any) => p.title || p.name).filter(Boolean)));
      if (titles.length > 0) setCatalogProducts(titles as string[]);
    });
  }, []);

  function persistReviews(list: ReviewItem[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  function handleOpenAdd() {
    setFormCustomer('');
    setFormProduct(catalogProducts[0] || 'Apple iPhone 15 Pro Max');
    setFormRating(5);
    setFormComment('');
    setFormStatus('Published');
    setModalOpen(true);
  }

  function handleSave() {
    if (!formCustomer.trim()) {
      toast('Customer name is required', 'error');
      return;
    }
    if (!formComment.trim()) {
      toast('Review comment cannot be blank', 'error');
      return;
    }

    setSaving(true);
    try {
      const newRev: ReviewItem = {
        id: `REV-${Math.floor(100 + Math.random() * 900)}`,
        customer: formCustomer.trim(),
        product: formProduct.trim() || 'Electronics Item',
        rating: formRating,
        comment: formComment.trim(),
        status: formStatus,
        date: new Date().toISOString().split('T')[0],
      };

      const updated = [newRev, ...reviews];
      setReviews(updated);
      persistReviews(updated);
      toast('Verified customer review added successfully!', 'success');
      setModalOpen(false);
    } catch {
      toast('Failed to save review', 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleToggleStatus(rev: ReviewItem) {
    const nextStatus: ReviewItem['status'] = rev.status === 'Published' ? 'Flagged' : 'Published';
    const updated = reviews.map((r) => (r.id === rev.id ? { ...r, status: nextStatus } : r));
    setReviews(updated);
    persistReviews(updated);
    toast(`Review from ${rev.customer} set to ${nextStatus}`, 'success');
  }

  const [deleteTargetReview, setDeleteTargetReview] = useState<ReviewItem | null>(null);

  function handleDelete(rev: ReviewItem) {
    setDeleteTargetReview(rev);
  }

  function confirmDeleteReview() {
    if (!deleteTargetReview) return;
    const updated = reviews.filter((r) => r.id !== deleteTargetReview.id);
    setReviews(updated);
    persistReviews(updated);
    toast(`Review from "${deleteTargetReview.customer}" deleted successfully`, 'success');
    setDeleteTargetReview(null);
  }

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const matchSearch =
        r.customer.toLowerCase().includes(search.toLowerCase()) ||
        r.product.toLowerCase().includes(search.toLowerCase()) ||
        r.comment.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [reviews, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedList = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0';
  const pendingCount = reviews.filter((r) => r.status === 'Pending').length;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Customer Ratings & Reviews"
          subtitle="Moderate verified buyer feedback, authenticate tech ratings, and ensure consumer trust standards."
        />

        <main className="p-4 sm:p-6 space-y-6 flex-1 max-w-7xl w-full">
          {/* Dynamic Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard
              title="Average Store Rating"
              value={`${avgRating} ★`}
              icon={<Star className="w-5 h-5 text-amber-500" />}
            />
            <StatCard
              title="Verified Buyer Reviews"
              value={`${reviews.length} Reviews`}
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            />
            <StatCard
              title="Pending Moderation"
              value={`${pendingCount} Cases`}
              icon={<MessageSquare className="w-5 h-5 text-blue-600" />}
            />
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-72">
                <SearchInput
                  placeholder="Search reviewer, product, or keyword..."
                  value={search}
                  onChange={setSearch}
                  onClear={() => setSearch('')}
                />
              </div>
              <div className="w-full sm:w-44">
                <CustomDropdown
                  options={[
                    { label: 'All Statuses', value: 'All' },
                    { label: 'Published', value: 'Published' },
                    { label: 'Pending', value: 'Pending' },
                    { label: 'Flagged', value: 'Flagged' },
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
              <span>Add Verified Review</span>
            </Button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {filtered.length === 0 ? (
              <TableEmptyState
                icon={<MessageSquare className="w-10 h-10 text-slate-400" />}
                title="No reviews found"
                description="Try clearing your search query or filter."
                action={
                  <Button variant="outline" size="sm" onClick={() => { setSearch(''); setStatusFilter('All'); }}>
                    Clear Search
                  </Button>
                }
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Purchased Device</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Review Commentary</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedList.map((r) => (
                      <TableRow key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
                              {r.customer.charAt(0)}
                            </div>
                            <span className="font-bold text-xs text-slate-900">{r.customer}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-semibold text-slate-800">{r.product}</span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                            {r.rating} ★
                          </span>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs text-slate-600 font-medium max-w-sm truncate" title={r.comment}>
                            {r.comment}
                          </p>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-slate-500">{r.date}</span>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => handleToggleStatus(r)}
                            className="cursor-pointer hover:opacity-85 transition-opacity"
                            title="Click to toggle status"
                          >
                            <Badge
                              variant={r.status === 'Published' ? 'success' : r.status === 'Pending' ? 'warning' : 'danger'}
                            >
                              {r.status}
                            </Badge>
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            onClick={() => handleDelete(r)}
                            title="Delete Review"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
                  itemName="reviews"
                />
              </>
            )}
          </div>
        </main>
      </div>

      {/* Add Review Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <Star className="w-4 h-4" />
                </div>
                <h3 className="font-black text-sm text-slate-900">Add Verified Buyer Review</h3>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Priya Nair"
                  value={formCustomer}
                  onChange={(e) => setFormCustomer(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Purchased Product *</label>
                {catalogProducts.length > 0 ? (
                  <CustomDropdown
                    options={catalogProducts.map((p) => ({ label: p, value: p }))}
                    value={formProduct}
                    onChange={(val) => setFormProduct(val)}
                    direction="auto"
                  />
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. Apple iPhone 15 Pro Max"
                    value={formProduct}
                    onChange={(e) => setFormProduct(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rating (Stars)</label>
                  <CustomDropdown
                    options={[
                      { label: '5 Stars ★★★★★', value: 5 },
                      { label: '4 Stars ★★★★☆', value: 4 },
                      { label: '3 Stars ★★★☆☆', value: 3 },
                      { label: '2 Stars ★★☆☆☆', value: 2 },
                      { label: '1 Star ★☆☆☆☆', value: 1 },
                    ]}
                    value={formRating}
                    onChange={(val) => setFormRating(Number(val))}
                    direction="auto"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Moderation Status</label>
                  <CustomDropdown
                    options={[
                      { label: 'Published', value: 'Published', colorDot: 'bg-emerald-500' },
                      { label: 'Pending', value: 'Pending', colorDot: 'bg-amber-400' },
                      { label: 'Flagged', value: 'Flagged', colorDot: 'bg-rose-500' },
                    ]}
                    value={formStatus}
                    onChange={(val) => setFormStatus(val as any)}
                    direction="auto"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Review Commentary *</label>
                <textarea
                  rows={3}
                  placeholder="Share authentic product experience..."
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave} disabled={saving} className="flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Review'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Common Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTargetReview)}
        onClose={() => setDeleteTargetReview(null)}
        onConfirm={confirmDeleteReview}
        title="Delete Customer Review"
        itemName={deleteTargetReview ? `${deleteTargetReview.customer} (${deleteTargetReview.product})` : undefined}
        message={`Are you sure you want to delete the review from "${deleteTargetReview?.customer}"? It will be removed from customer ratings and public showcase.`}
      />
    </div>
  );
}
