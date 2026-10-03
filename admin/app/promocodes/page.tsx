'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import AdminPagination from '../components/AdminPagination';
import { ApiClient } from '../lib/apiClient';
import { useToast } from '../components/ToastProvider';
import {
  Button,
  ButtonLink,
  CustomDropdown,
  SearchInput,
  Badge,
  StatCard,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyState,
  DeleteConfirmModal,
} from '../components/ui';
import {
  Ticket,
  Plus,
  Edit2,
  Trash2,
  Percent,
  IndianRupee,
  CheckCircle2,
  Tag,
  Filter,
} from 'lucide-react';

interface PromoCodeItem {
  _id: string;
  code: string;
  label: string;
  type: 'percent' | 'flat';
  value: number;
  minOrder?: number;
  active: boolean;
  appliesTo?: 'all' | 'products';
  applicableProducts?: any[];
  createdAt?: string;
}

export default function AdminPromocodesPage() {
  const { toast } = useToast();

  const [promocodes, setPromocodes] = useState<PromoCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  async function fetchPromocodes() {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(currentPage),
        limit: String(pageSize),
      });
      if (search.trim()) queryParams.set('search', search.trim());
      if (typeFilter !== 'all') queryParams.set('type', typeFilter);
      if (statusFilter !== 'all') queryParams.set('status', statusFilter);

      const res = await ApiClient.get(`/admin/coupons?${queryParams.toString()}`);
      if (res.success) {
        setPromocodes(res.data?.coupons || []);
        setTotalPages(res.data?.pages || 1);
        setTotalItems(res.data?.total || 0);
      } else {
        toast(res.message || 'Failed to fetch promocodes', 'error');
      }
    } catch (err) {
      toast('Failed to connect to promocode API', 'error');
    } finally {
      setLoading(false);
    }
  }

  // Reset page to 1 when filters or pageSize change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, statusFilter, pageSize]);

  useEffect(() => {
    fetchPromocodes();
  }, [search, typeFilter, statusFilter, currentPage, pageSize]);

  const handleToggleActive = async (id: string, currentStatus: boolean, code: string) => {
    try {
      const res = await ApiClient.put(`/admin/coupons/${id}`, {
        active: !currentStatus,
      });
      if (res.success) {
        toast(`Promocode ${code} is now ${!currentStatus ? 'Active' : 'Inactive'}`, 'success');
        fetchPromocodes();
      } else {
        toast(res.message || 'Failed to update status', 'error');
      }
    } catch (err) {
      toast('Error toggling promocode status', 'error');
    }
  };

  const [deleteTargetPromo, setDeleteTargetPromo] = useState<{ id: string; code: string } | null>(null);
  const [deletingPromo, setDeletingPromo] = useState(false);

  const confirmDeletePromo = async () => {
    if (!deleteTargetPromo) return;
    setDeletingPromo(true);
    try {
      const res = await ApiClient.delete(`/admin/coupons/${deleteTargetPromo.id}`);
      if (res.success) {
        toast(`Promocode "${deleteTargetPromo.code}" deleted successfully`, 'success');
        setDeleteTargetPromo(null);
        fetchPromocodes();
      } else {
        toast(res.message || 'Failed to delete promocode', 'error');
      }
    } catch (err) {
      toast('Error deleting promocode', 'error');
    } finally {
      setDeletingPromo(false);
    }
  };

  // Quick stats
  const activeCount = promocodes.filter((c) => c.active).length;
  const percentCount = promocodes.filter((c) => c.type === 'percent').length;
  const flatCount = promocodes.filter((c) => c.type === 'flat').length;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Promocodes & Discount Vouchers"
          subtitle="Create, configure, and manage store discount promo codes and customer incentives"
        />

        <main className="p-4 sm:p-6 space-y-6 flex-1">
          
          {/* Quick Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Vouchers"
              value={totalItems}
              icon={<Ticket className="w-6 h-6" />}
              accentColor="indigo"
            />
            <StatCard
              title="Active Live"
              value={activeCount}
              icon={<CheckCircle2 className="w-6 h-6" />}
              accentColor="emerald"
            />
            <StatCard
              title="% Discounts"
              value={percentCount}
              icon={<Percent className="w-6 h-6" />}
              accentColor="violet"
            />
            <StatCard
              title="Flat Discounts"
              value={flatCount}
              icon={<IndianRupee className="w-6 h-6" />}
              accentColor="amber"
            />
          </div>

          {/* Controls Bar: SearchInput, CustomDropdown filters, Add CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
            <div className="flex flex-1 flex-wrap items-center gap-3 w-full sm:w-auto">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search promo code or label..."
                className="w-full sm:w-64"
              />

              <CustomDropdown
                label="Type"
                options={[
                  { label: 'All Types', value: 'all' },
                  { label: 'Percentage (% OFF)', value: 'percent' },
                  { label: 'Flat Amount (₹)', value: 'flat' },
                ]}
                value={typeFilter}
                onChange={setTypeFilter}
              />

              <CustomDropdown
                label="Status"
                options={[
                  { label: 'All Statuses', value: 'all' },
                  { label: 'Active Only', value: 'active' },
                  { label: 'Inactive Only', value: 'inactive' },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
              />
            </div>

            <ButtonLink
              href="/promocodes/new"
              icon={<Plus className="w-4 h-4" />}
              size="md"
              className="w-full sm:w-auto"
            >
              Create Promocode
            </ButtonLink>
          </div>

          {/* Promocode Data Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            {loading ? (
              <div className="text-center py-16 text-xs text-slate-400">Loading discount vouchers...</div>
            ) : (
              <Table>
                <TableHeader>
                  <tr>
                    <TableHead>Promo Code</TableHead>
                    <TableHead>Campaign Label</TableHead>
                    <TableHead>Discount Rate</TableHead>
                    <TableHead>Min. Order Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </tr>
                </TableHeader>
                <TableBody>
                  {promocodes.length === 0 ? (
                    <TableEmptyState
                      title="No promocodes found"
                      description="Try adjusting your search query or filters, or create a new coupon code."
                      icon={<Ticket className="w-6 h-6" />}
                      colSpan={6}
                      action={
                        <ButtonLink href="/promocodes/new" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
                          Create Promocode
                        </ButtonLink>
                      }
                    />
                  ) : (
                    promocodes.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <div className="flex flex-col gap-1 items-start">
                            <span className="font-mono font-black text-xs text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-lg">
                              {item.code}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              item.appliesTo === 'products'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {item.appliesTo === 'products' ? '📦 Assigned Products' : '🌐 All Products'}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="font-bold text-slate-800">
                          {item.label}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={item.type === 'percent' ? 'indigo' : 'success'}
                            className="font-black"
                          >
                            {item.type === 'percent' ? (
                              <span className="flex items-center gap-1">
                                <Percent className="w-3 h-3" />
                                <span>{item.value}% OFF</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <IndianRupee className="w-3 h-3" />
                                <span>₹{item.value.toLocaleString()} FLAT</span>
                              </span>
                            )}
                          </Badge>
                        </TableCell>

                        <TableCell className="font-semibold text-slate-600">
                          {item.minOrder && item.minOrder > 0 ? (
                            <span>Min ₹{item.minOrder.toLocaleString()}</span>
                          ) : (
                            <span className="text-slate-400 font-normal">No Minimum</span>
                          )}
                        </TableCell>

                        <TableCell>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(item._id, item.active, item.code)}
                            className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                            title="Click to toggle status"
                          >
                            <Badge
                              variant={item.active ? 'success' : 'neutral'}
                              dot
                            >
                              {item.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </button>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <ButtonLink
                              href={`/promocodes/${item._id}/edit`}
                              variant="outline"
                              size="sm"
                              className="!p-2 !rounded-lg"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                            </ButtonLink>

                            <Button
                              onClick={() => setDeleteTargetPromo({ id: item._id, code: item.code })}
                              variant="danger"
                              size="sm"
                              className="!p-2 !rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}

            {/* Dynamic Pagination Bar */}
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={pageSize}
              onPageChange={setCurrentPage}
              itemsPerPageOptions={[5, 10]}
              onItemsPerPageChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemName="promocodes"
            />
          </div>

        </main>
      </div>

      {/* Common Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTargetPromo)}
        onClose={() => !deletingPromo && setDeleteTargetPromo(null)}
        onConfirm={confirmDeletePromo}
        loading={deletingPromo}
        title="Delete Promo Code"
        itemName={deleteTargetPromo?.code}
        message={`Are you sure you want to delete promocode "${deleteTargetPromo?.code}"? Customers will no longer be able to apply this discount.`}
      />
    </div>
  );
}
