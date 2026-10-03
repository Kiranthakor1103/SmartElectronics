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
  Percent,
  Plus,
  Tag,
  ShieldCheck,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Save,
  CreditCard,
  Sparkles,
} from 'lucide-react';

export interface OfferCampaign {
  id: string;
  title: string;
  discount: string;
  type: 'Bank Offer' | 'Financing' | 'Cashback' | 'Exchange';
  appliesTo: string;
  status: 'Active' | 'Inactive';
}

const DEFAULT_OFFERS: OfferCampaign[] = [
  {
    id: '1',
    title: 'HDFC Instant Bank Discount',
    discount: '10% Instant (Up to ₹2,500)',
    type: 'Bank Offer',
    appliesTo: 'Laptops, Smart TVs, Mobiles',
    status: 'Active',
  },
  {
    id: '2',
    title: 'No Cost EMI 12 Months',
    discount: 'Zero Interest EMI',
    type: 'Financing',
    appliesTo: 'Orders above ₹25,000',
    status: 'Active',
  },
  {
    id: '3',
    title: 'SmartElectronics Tech Launch Cashback',
    discount: '₹1,500 Direct Wallet Cashback',
    type: 'Cashback',
    appliesTo: 'Flagship Smartphones',
    status: 'Active',
  },
  {
    id: '4',
    title: 'Old Electronics Exchange Bonus',
    discount: 'Extra ₹3,000 on Trade-In',
    type: 'Exchange',
    appliesTo: 'Laptops & Smartphones',
    status: 'Active',
  },
];

const OFFER_TYPES = ['Bank Offer', 'Financing', 'Cashback', 'Exchange'] as const;
const STORAGE_KEY = 'smart_admin_offers_v2';

export default function AdminOffersPage() {
  const { toast } = useToast();
  const [offers, setOffers] = useState<OfferCampaign[]>(DEFAULT_OFFERS);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferCampaign | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDiscount, setFormDiscount] = useState('');
  const [formType, setFormType] = useState<OfferCampaign['type']>('Bank Offer');
  const [formAppliesTo, setFormAppliesTo] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [saving, setSaving] = useState(false);

  // Load saved offers
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOffers(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  function persistOffers(list: OfferCampaign[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  function handleOpenAdd() {
    setEditingOffer(null);
    setFormTitle('');
    setFormDiscount('10% Instant Discount');
    setFormType('Bank Offer');
    setFormAppliesTo('All Electronics & Smart Devices');
    setFormStatus('Active');
    setModalOpen(true);
  }

  function handleOpenEdit(offer: OfferCampaign) {
    setEditingOffer(offer);
    setFormTitle(offer.title);
    setFormDiscount(offer.discount);
    setFormType(offer.type);
    setFormAppliesTo(offer.appliesTo);
    setFormStatus(offer.status);
    setModalOpen(true);
  }

  function handleSave() {
    if (!formTitle.trim()) {
      toast('Campaign title is required', 'error');
      return;
    }
    if (!formDiscount.trim()) {
      toast('Discount value is required', 'error');
      return;
    }

    setSaving(true);
    try {
      let updated: OfferCampaign[];
      if (editingOffer) {
        updated = offers.map((o) =>
          o.id === editingOffer.id
            ? {
                ...o,
                title: formTitle.trim(),
                discount: formDiscount.trim(),
                type: formType,
                appliesTo: formAppliesTo.trim() || 'Storewide',
                status: formStatus,
              }
            : o
        );
        toast(`Offer "${formTitle}" updated successfully`, 'success');
      } else {
        const newOffer: OfferCampaign = {
          id: `offer-${Date.now()}`,
          title: formTitle.trim(),
          discount: formDiscount.trim(),
          type: formType,
          appliesTo: formAppliesTo.trim() || 'Storewide',
          status: formStatus,
        };
        updated = [newOffer, ...offers];
        toast(`New offer campaign "${formTitle}" created!`, 'success');
      }

      setOffers(updated);
      persistOffers(updated);
      setModalOpen(false);
    } catch {
      toast('Failed to save offer', 'error');
    } finally {
      setSaving(false);
    }
  }

  const [deleteTargetOffer, setDeleteTargetOffer] = useState<OfferCampaign | null>(null);

  function handleDelete(offer: OfferCampaign) {
    setDeleteTargetOffer(offer);
  }

  function confirmDeleteOffer() {
    if (!deleteTargetOffer) return;
    const updated = offers.filter((o) => o.id !== deleteTargetOffer.id);
    setOffers(updated);
    persistOffers(updated);
    toast(`Offer "${deleteTargetOffer.title}" deleted successfully`, 'success');
    setDeleteTargetOffer(null);
  }

  function handleToggleStatus(offer: OfferCampaign) {
    const nextStatus: 'Active' | 'Inactive' = offer.status === 'Active' ? 'Inactive' : 'Active';
    const updated = offers.map((o) => (o.id === offer.id ? { ...o, status: nextStatus } : o));
    setOffers(updated);
    persistOffers(updated);
    toast(`Offer "${offer.title}" set to ${nextStatus}`, 'success');
  }

  const filtered = useMemo(() => {
    return offers.filter((o) => {
      const matchSearch =
        o.title.toLowerCase().includes(search.toLowerCase()) ||
        o.discount.toLowerCase().includes(search.toLowerCase()) ||
        o.appliesTo.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'All' || o.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [offers, search, typeFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedList = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const activeCount = offers.filter((o) => o.status === 'Active').length;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Bank Offers & EMI Campaigns"
          subtitle="Configure instant bank discounts, No Cost EMI tenures, wallet cashbacks, and trade-in exchange bonuses."
        />

        <main className="p-4 sm:p-6 space-y-6 flex-1 max-w-7xl w-full">
          {/* Dynamic Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard
              title="Active Promotions"
              value={`${activeCount} Live Offers`}
              icon={<Percent className="w-5 h-5 text-blue-600" />}
            />
            <StatCard
              title="Partner Banks"
              value="6 Tier-1 Banks"
              icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
            />
            <StatCard
              title="Financing Options"
              value="No-Cost EMI Active"
              icon={<Tag className="w-5 h-5 text-indigo-600" />}
            />
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-72">
                <SearchInput
                  placeholder="Search campaign, bank, or scope..."
                  value={search}
                  onChange={setSearch}
                  onClear={() => setSearch('')}
                />
              </div>
              <div className="w-full sm:w-48">
                <CustomDropdown
                  options={[
                    { label: 'All Offer Types', value: 'All' },
                    { label: 'Bank Offer', value: 'Bank Offer' },
                    { label: 'Financing', value: 'Financing' },
                    { label: 'Cashback', value: 'Cashback' },
                    { label: 'Exchange', value: 'Exchange' },
                  ]}
                  value={typeFilter}
                  onChange={(v) => {
                    setTypeFilter(v);
                    setCurrentPage(1);
                  }}
                  direction="auto"
                />
              </div>
            </div>

            <Button variant="primary" onClick={handleOpenAdd} className="flex items-center gap-1.5 text-xs">
              <Plus className="w-4 h-4" />
              <span>Create Campaign</span>
            </Button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {filtered.length === 0 ? (
              <TableEmptyState
                icon={<Percent className="w-10 h-10 text-slate-400" />}
                title="No offer campaigns found"
                description="Try clearing your search query or switching the offer type filter."
                action={
                  <Button variant="outline" size="sm" onClick={() => { setSearch(''); setTypeFilter('All'); }}>
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
                      <TableHead>Discount Value</TableHead>
                      <TableHead>Offer Type</TableHead>
                      <TableHead>Applicable Products / Scope</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedList.map((o) => (
                      <TableRow key={o.id} className="hover:bg-slate-50/70 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-xs text-slate-900">{o.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-extrabold text-xs text-emerald-600 bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-100">
                            {o.discount}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                            {o.type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-slate-600 font-medium">{o.appliesTo}</span>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => handleToggleStatus(o)}
                            className="cursor-pointer hover:opacity-85 transition-opacity"
                            title="Click to toggle status"
                          >
                            <Badge variant={o.status === 'Active' ? 'success' : 'danger'}>{o.status}</Badge>
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(o)}
                              title="Edit Offer"
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(o)}
                              title="Delete Offer"
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
                  itemName="store offers"
                />
              </>
            )}
          </div>
        </main>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Percent className="w-4 h-4" />
                </div>
                <h3 className="font-black text-sm text-slate-900">
                  {editingOffer ? `Edit Offer: ${editingOffer.title}` : 'Create Promotion Campaign'}
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
                  placeholder="e.g. ICICI Instant 10% Off"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Discount Value *</label>
                <input
                  type="text"
                  placeholder="e.g. 10% Instant (Up to ₹3,000)"
                  value={formDiscount}
                  onChange={(e) => setFormDiscount(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Offer Type</label>
                <CustomDropdown
                  options={OFFER_TYPES.map((t) => ({ label: t, value: t }))}
                  value={formType}
                  onChange={(val) => setFormType(val as any)}
                  direction="auto"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Applicable Scope / Products</label>
                <input
                  type="text"
                  placeholder="e.g. Flagship Smartphones & Laptops"
                  value={formAppliesTo}
                  onChange={(e) => setFormAppliesTo(e.target.value)}
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

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave} disabled={saving} className="flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Campaign'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Common Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTargetOffer)}
        onClose={() => setDeleteTargetOffer(null)}
        onConfirm={confirmDeleteOffer}
        title="Delete Offer Campaign"
        itemName={deleteTargetOffer?.title}
        message={`Are you sure you want to remove offer campaign "${deleteTargetOffer?.title}"? The promotional discount will immediately expire.`}
      />
    </div>
  );
}
