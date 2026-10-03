'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import AdminPagination from '../components/AdminPagination';
import { ApiClient } from '../lib/apiClient';
import { useToast } from '../components/ToastProvider';
import {
  Button,
  Badge,
  StatCard,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyState,
  Loader,
  AdminTableSkeleton,
} from '../components/ui';
import { Store, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Clock, Building2, CreditCard } from 'lucide-react';

interface SellerRecord {
  _id: string;
  companyName: string;
  gstNumber?: string;
  panNumber?: string;
  bankAccount?: string;
  bankIfsc?: string;
  kycStatus: 'pending' | 'approved' | 'rejected';
  commissionRate?: number;
  active?: boolean;
  createdAt?: string;
}

export default function AdminSellersPage() {
  const { toast } = useToast();

  const [sellers, setSellers] = useState<SellerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | 'pending' | 'approved' | 'rejected'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSellers, setTotalSellers] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  async function fetchSellers() {
    setLoading(true);
    try {
      const res = await ApiClient.get(
        `/admin/sellers?page=${currentPage}&limit=${pageSize}&status=${encodeURIComponent(statusFilter)}`
      );
      if (res.success) {
        if (res.data?.sellers) {
          setSellers(res.data.sellers);
          setTotalPages(res.data.pages || 1);
          setTotalSellers(res.data.total || 0);
        } else if (Array.isArray(res.data)) {
          setSellers(res.data);
          setTotalPages(Math.ceil(res.data.length / pageSize) || 1);
          setTotalSellers(res.data.length);
        }
      } else {
        toast(res.message || 'Failed to fetch sellers', 'error');
      }
    } catch (err) {
      toast('Error loading merchant sellers', 'error');
    } finally {
      setLoading(false);
    }
  }

  // Reset page to 1 when status filter or pageSize changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, pageSize]);

  useEffect(() => {
    fetchSellers();
  }, [statusFilter, currentPage, pageSize]);

  const handleUpdateKyc = async (sellerId: string, kycStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      const res = await ApiClient.put(`/admin/sellers/${sellerId}/kyc`, { kycStatus });
      if (res.success) {
        toast(`Seller KYC status updated to '${kycStatus}'`, 'success');
        fetchSellers();
      } else {
        toast(res.message || 'Failed to update KYC status', 'error');
      }
    } catch (err) {
      toast('Error updating seller KYC', 'error');
    }
  };

  const filteredSellers = statusFilter === 'All'
    ? sellers
    : sellers.filter((s) => s.kycStatus === statusFilter);

  const pendingCount = sellers.filter((s) => s.kycStatus === 'pending').length;
  const approvedCount = sellers.filter((s) => s.kycStatus === 'approved').length;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Merchant Seller & KYC Verification"
          subtitle="Review merchant onboarding applications, inspect tax credentials, and grant store sales permissions"
        />

        <main className="p-4 sm:p-6 space-y-6 flex-1">
          
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard
              title="Total Merchants"
              value={sellers.length}
              icon={<Store className="w-6 h-6" />}
              accentColor="indigo"
            />
            <StatCard
              title="Approved Sellers"
              value={approvedCount}
              icon={<ShieldCheck className="w-6 h-6" />}
              accentColor="emerald"
            />
            <StatCard
              title="Pending Review"
              value={pendingCount}
              icon={<Clock className="w-6 h-6" />}
              accentColor="amber"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 bg-white border border-slate-200/80 p-2 rounded-2xl shadow-xs overflow-x-auto">
            {(['All', 'pending', 'approved', 'rejected'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition capitalize whitespace-nowrap cursor-pointer ${
                  statusFilter === st
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {st === 'All' ? 'All Merchants' : st} (
                {st === 'All' ? sellers.length : sellers.filter((s) => s.kycStatus === st).length}
                )
              </button>
            ))}
          </div>

          {/* Sellers Data Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            {loading ? (
              <div className="p-6 space-y-4">
                <Loader size="lg" label="Loading merchant sellers..." sublabel="Verifying GST numbers and KYC credentials" />
                <AdminTableSkeleton rows={6} cols={6} />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <tr>
                    <TableHead>Merchant Company</TableHead>
                    <TableHead>Tax Identifiers (GST / PAN)</TableHead>
                    <TableHead>Settlement Bank</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>KYC Status</TableHead>
                    <TableHead className="text-right">Moderation Actions</TableHead>
                  </tr>
                </TableHeader>
                <TableBody>
                  {filteredSellers.length === 0 ? (
                    <TableEmptyState
                      title="No sellers found for this filter"
                      description="There are currently no merchants matching this KYC moderation status."
                      icon={<Store className="w-6 h-6" />}
                      colSpan={6}
                    />
                  ) : (
                    filteredSellers.map((seller) => (
                      <TableRow key={seller._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-xs uppercase shadow-2xs">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{seller.companyName}</p>
                              <p className="text-[10px] text-slate-400">
                                Applied: {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="space-y-1 font-mono text-[11px]">
                          <div>
                            <span className="text-slate-400 text-[10px] font-bold">GST: </span>
                            <span className="font-semibold text-slate-800">{seller.gstNumber || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] font-bold">PAN: </span>
                            <span className="font-semibold text-slate-800">{seller.panNumber || 'N/A'}</span>
                          </div>
                        </TableCell>

                        <TableCell className="space-y-0.5">
                          <p className="font-mono text-slate-800 font-semibold">{seller.bankAccount || 'N/A'}</p>
                          <p className="text-[10px] text-slate-400 font-mono">IFSC: {seller.bankIfsc || 'N/A'}</p>
                        </TableCell>

                        <TableCell className="font-bold text-slate-900">
                          {seller.commissionRate ?? 10}%
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              seller.kycStatus === 'approved'
                                ? 'success'
                                : seller.kycStatus === 'rejected'
                                ? 'danger'
                                : 'warning'
                            }
                            dot
                          >
                            {seller.kycStatus}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {seller.kycStatus !== 'approved' && (
                              <Button
                                onClick={() => handleUpdateKyc(seller._id, 'approved')}
                                variant="success"
                                size="sm"
                                className="!py-1.5 !px-3 !text-[11px]"
                              >
                                Approve KYC
                              </Button>
                            )}

                            {seller.kycStatus !== 'rejected' && (
                              <Button
                                onClick={() => handleUpdateKyc(seller._id, 'rejected')}
                                variant="danger"
                                size="sm"
                                className="!py-1.5 !px-3 !text-[11px]"
                              >
                                Reject
                              </Button>
                            )}

                            {seller.kycStatus !== 'pending' && (
                              <Button
                                onClick={() => handleUpdateKyc(seller._id, 'pending')}
                                variant="outline"
                                size="sm"
                                className="!py-1.5 !px-3 !text-[11px]"
                              >
                                Reset
                              </Button>
                            )}
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
              totalItems={totalSellers}
              itemsPerPage={pageSize}
              onPageChange={setCurrentPage}
              itemsPerPageOptions={[5, 10]}
              onItemsPerPageChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemName="merchants"
            />
          </div>

        </main>
      </div>
    </div>
  );
}
