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
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  X,
  Save,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';

export interface ReturnTicket {
  id: string;
  customer: string;
  product: string;
  reason: string;
  date: string;
  status: 'Inspecting' | 'Approved' | 'Completed' | 'Rejected';
  resolution: string;
}

const DEFAULT_RETURNS: ReturnTicket[] = [
  {
    id: 'RMA-8041',
    customer: 'Rahul Sharma',
    product: 'Sony WH-1000XM5 Headphones',
    reason: 'ANC Microphone Issue',
    date: '2026-09-08',
    status: 'Inspecting',
    resolution: 'Replacement',
  },
  {
    id: 'RMA-8039',
    customer: 'Ananya Verma',
    product: 'Apple Watch Ultra 2 (Titanium)',
    reason: 'Defective Strap Buckle',
    date: '2026-09-07',
    status: 'Approved',
    resolution: 'Part Replaced',
  },
  {
    id: 'RMA-8035',
    customer: 'Vikas Rao',
    product: 'JBL Bar 1300X Soundbar',
    reason: 'Subwoofer Wireless Sync Lag',
    date: '2026-09-05',
    status: 'Completed',
    resolution: 'Replaced with New Unit',
  },
  {
    id: 'RMA-8031',
    customer: 'Tanvi Desai',
    product: 'Dell UltraSharp 32-inch 4K Monitor',
    reason: 'Dead Pixel Cluster (Center)',
    date: '2026-09-03',
    status: 'Approved',
    resolution: 'Unit Replacement',
  },
];

const RESOLUTION_OPTIONS = [
  'Replacement',
  'Part Replaced',
  'Replaced with New Unit',
  'Full Refund',
  'Brand Service Center Repair',
  'Pending Diagnosis',
];

const STORAGE_KEY = 'smart_admin_returns_v2';

export default function AdminReturnsPage() {
  const { toast } = useToast();
  const [returns, setReturns] = useState<ReturnTicket[]>(DEFAULT_RETURNS);
  const [catalogProducts, setCatalogProducts] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [formCustomer, setFormCustomer] = useState('');
  const [formProduct, setFormProduct] = useState('');
  const [formReason, setFormReason] = useState('');
  const [formResolution, setFormResolution] = useState(RESOLUTION_OPTIONS[0]);
  const [formStatus, setFormStatus] = useState<ReturnTicket['status']>('Inspecting');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReturns(parsed);
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

  function persistReturns(list: ReturnTicket[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  function handleOpenAdd() {
    setFormCustomer('');
    setFormProduct(catalogProducts[0] || 'Sony WH-1000XM5 Headphones');
    setFormReason('');
    setFormResolution(RESOLUTION_OPTIONS[0]);
    setFormStatus('Inspecting');
    setModalOpen(true);
  }

  function handleSave() {
    if (!formCustomer.trim()) {
      toast('Customer name is required', 'error');
      return;
    }
    if (!formReason.trim()) {
      toast('Issue description is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const newTicket: ReturnTicket = {
        id: `RMA-${Math.floor(8000 + Math.random() * 1000)}`,
        customer: formCustomer.trim(),
        product: formProduct.trim() || 'Hardware Device',
        reason: formReason.trim(),
        date: new Date().toISOString().split('T')[0],
        status: formStatus,
        resolution: formResolution,
      };

      const updated = [newTicket, ...returns];
      setReturns(updated);
      persistReturns(updated);
      toast(`RMA ticket ${newTicket.id} created successfully!`, 'success');
      setModalOpen(false);
    } catch {
      toast('Failed to create return ticket', 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleUpdateStatus(ticket: ReturnTicket, newStatus: ReturnTicket['status']) {
    const updated = returns.map((r) => (r.id === ticket.id ? { ...r, status: newStatus } : r));
    setReturns(updated);
    persistReturns(updated);
    toast(`${ticket.id} status updated to ${newStatus}`, 'success');
  }

  const [deleteTargetTicket, setDeleteTargetTicket] = useState<ReturnTicket | null>(null);

  function handleDelete(ticket: ReturnTicket) {
    setDeleteTargetTicket(ticket);
  }

  function confirmDeleteTicket() {
    if (!deleteTargetTicket) return;
    const updated = returns.filter((r) => r.id !== deleteTargetTicket.id);
    setReturns(updated);
    persistReturns(updated);
    toast(`Return ticket "${deleteTargetTicket.id}" deleted successfully`, 'success');
    setDeleteTargetTicket(null);
  }

  const filtered = useMemo(() => {
    return returns.filter((r) => {
      const matchSearch =
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.customer.toLowerCase().includes(search.toLowerCase()) ||
        r.product.toLowerCase().includes(search.toLowerCase()) ||
        r.reason.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [returns, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedList = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const activeCases = returns.filter((r) => r.status === 'Inspecting' || r.status === 'Approved').length;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Returns & RMA Management"
          subtitle="Track device inspection, warranty verification, component diagnosis, and customer replacements."
        />

        <main className="p-4 sm:p-6 space-y-6 flex-1 max-w-7xl w-full">
          {/* Dynamic Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard
              title="Active RMA Cases"
              value={`${activeCases} Pending`}
              icon={<RotateCcw className="w-5 h-5 text-blue-600" />}
            />
            <StatCard
              title="Avg Resolution Time"
              value="2.4 Days"
              icon={<Clock className="w-5 h-5 text-indigo-600" />}
            />
            <StatCard
              title="Warranty Approval Rate"
              value="98.5% Approved"
              icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
            />
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-80">
                <SearchInput
                  placeholder="Search RMA ID, customer or device..."
                  value={search}
                  onChange={setSearch}
                  onClear={() => setSearch('')}
                />
              </div>
              <div className="w-full sm:w-44">
                <CustomDropdown
                  options={[
                    { label: 'All Statuses', value: 'All' },
                    { label: 'Inspecting', value: 'Inspecting' },
                    { label: 'Approved', value: 'Approved' },
                    { label: 'Completed', value: 'Completed' },
                    { label: 'Rejected', value: 'Rejected' },
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
              <span>Create RMA Ticket</span>
            </Button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {filtered.length === 0 ? (
              <TableEmptyState
                icon={<RotateCcw className="w-10 h-10 text-slate-400" />}
                title="No RMA tickets found"
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
                      <TableHead>RMA Ticket</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Hardware Item</TableHead>
                      <TableHead>Reported Issue</TableHead>
                      <TableHead>Filing Date</TableHead>
                      <TableHead>Resolution Mode</TableHead>
                      <TableHead>Status & Action</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedList.map((r) => (
                      <TableRow key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <TableCell>
                          <code className="text-[11px] font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                            {r.id}
                          </code>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-xs text-slate-900">{r.customer}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-semibold text-slate-800">{r.product}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-slate-600 max-w-xs truncate block" title={r.reason}>
                            {r.reason}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-slate-500">{r.date}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-bold text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-100">
                            {r.resolution}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="w-36">
                            <CustomDropdown
                              size="sm"
                              options={[
                                { label: 'Inspecting', value: 'Inspecting', colorDot: 'bg-amber-400' },
                                { label: 'Approved', value: 'Approved', colorDot: 'bg-blue-500' },
                                { label: 'Completed', value: 'Completed', colorDot: 'bg-emerald-500' },
                                { label: 'Rejected', value: 'Rejected', colorDot: 'bg-rose-500' },
                              ]}
                              value={r.status}
                              onChange={(val) => handleUpdateStatus(r, val as any)}
                              direction="auto"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            onClick={() => handleDelete(r)}
                            title="Delete Ticket"
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
                  itemName="return requests"
                />
              </>
            )}
          </div>
        </main>
      </div>

      {/* Add Return Ticket Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <h3 className="font-black text-sm text-slate-900">Create RMA Return Ticket</h3>
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
                  placeholder="e.g. Sunil Verma"
                  value={formCustomer}
                  onChange={(e) => setFormCustomer(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hardware Product *</label>
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
                    placeholder="e.g. Sony WH-1000XM5 Headphones"
                    value={formProduct}
                    onChange={(e) => setFormProduct(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Resolution Mode</label>
                <CustomDropdown
                  options={RESOLUTION_OPTIONS.map((res) => ({ label: res, value: res }))}
                  value={formResolution}
                  onChange={(val) => setFormResolution(val)}
                  direction="auto"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Status</label>
                <CustomDropdown
                  options={[
                    { label: 'Inspecting', value: 'Inspecting', colorDot: 'bg-amber-400' },
                    { label: 'Approved', value: 'Approved', colorDot: 'bg-blue-500' },
                    { label: 'Completed', value: 'Completed', colorDot: 'bg-emerald-500' },
                    { label: 'Rejected', value: 'Rejected', colorDot: 'bg-rose-500' },
                  ]}
                  value={formStatus}
                  onChange={(val) => setFormStatus(val as any)}
                  direction="auto"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reported Defect / Issue *</label>
                <textarea
                  rows={3}
                  placeholder="Detail the malfunction or physical defect..."
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
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
                <span>{saving ? 'Saving...' : 'Issue Ticket'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Common Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTargetTicket)}
        onClose={() => setDeleteTargetTicket(null)}
        onConfirm={confirmDeleteTicket}
        title="Delete RMA Return Ticket"
        itemName={deleteTargetTicket?.id}
        message={`Are you sure you want to delete return ticket "${deleteTargetTicket?.id}" for ${deleteTargetTicket?.customer}? This action cannot be undone.`}
      />
    </div>
  );
}
