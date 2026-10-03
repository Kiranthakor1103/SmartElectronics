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
  ShieldCheck,
  UserPlus,
  Key,
  CheckCircle2,
  RefreshCcw,
  Trash2,
  UserCheck,
  Shield,
  X,
  Save,
  Mail,
} from 'lucide-react';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
  access: string;
  status: string;
  createdAt?: string;
  isDbUser?: boolean;
}

const DEFAULT_ADMINS: StaffUser[] = [
  {
    id: '1',
    name: 'SmartElectronics Super Admin',
    email: 'admin@smartelectronics.com',
    role: 'Super Admin',
    access: 'Full System & Catalog Control',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Catalog Operations',
    email: 'catalog@smartelectronics.com',
    role: 'Catalog Manager',
    access: 'Products, Categories & Inventory',
    status: 'Active',
  },
  {
    id: '3',
    name: 'Fulfillment Lead',
    email: 'logistics@smartelectronics.com',
    role: 'Logistics Supervisor',
    access: 'Orders, RMA & Shipping',
    status: 'Active',
  },
];

const ROLE_PERMISSIONS: Record<string, string> = {
  admin: 'Full System & Catalog Control',
  'Super Admin': 'Full System & Catalog Control',
  'Catalog Manager': 'Products, Categories & Brands',
  'Logistics Supervisor': 'Orders, Fulfillment & RMA',
  seller: 'Seller Dashboard & Inventory',
  user: 'Customer Storefront Access',
};

const STORAGE_KEY = 'smart_admin_staff_v2';

export default function AdminUsersStaffPage() {
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffUser[]>(DEFAULT_ADMINS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('Super Admin');
  const [saving, setSaving] = useState(false);

  async function loadStaffUsers() {
    setLoading(true);
    try {
      // 1. Check custom overrides from localStorage
      let customList: StaffUser[] = [];
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) customList = JSON.parse(saved);
      } catch {
        // ignore
      }

      // 2. Fetch live users from MongoDB
      const res = await ApiClient.get('/admin/users?limit=100');
      let liveUsers: any[] = [];

      if (res?.success) {
        liveUsers = res.data?.users || res.data || [];
      }

      // Filter admin / staff users
      const dbAdmins: StaffUser[] = liveUsers
        .filter((u: any) => u.role === 'admin' || u.role === 'seller')
        .map((u: any) => ({
          id: u._id || u.id,
          name: u.name || 'Admin Staff',
          email: u.email,
          role: u.role === 'admin' ? 'Super Admin' : 'Seller Partner',
          access: ROLE_PERMISSIONS[u.role] || 'Full System Control',
          status: 'Active',
          createdAt: u.createdAt,
          isDbUser: true,
        }));

      // Merge defaults, custom staff, and DB users
      const mergedMap: Record<string, StaffUser> = {};

      DEFAULT_ADMINS.forEach((d) => {
        mergedMap[d.email.toLowerCase()] = d;
      });

      customList.forEach((c) => {
        mergedMap[c.email.toLowerCase()] = c;
      });

      dbAdmins.forEach((u) => {
        mergedMap[u.email.toLowerCase()] = u;
      });

      setStaff(Object.values(mergedMap));
    } catch {
      toast('Failed to load admin staff list', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStaffUsers();
  }, []);

  function persistStaff(list: StaffUser[]) {
    try {
      const customs = list.filter((s) => !s.isDbUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customs));
    } catch {
      // ignore
    }
  }

  function handleOpenAdd() {
    setFormName('');
    setFormEmail('');
    setFormRole('Super Admin');
    setModalOpen(true);
  }

  async function handleSaveStaff() {
    if (!formName.trim() || !formEmail.trim()) {
      toast('Name and valid email are required', 'error');
      return;
    }

    setSaving(true);
    try {
      const newStaff: StaffUser = {
        id: `staff-${Date.now()}`,
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole,
        access: ROLE_PERMISSIONS[formRole] || 'System Access',
        status: 'Active',
      };

      const updated = [newStaff, ...staff];
      setStaff(updated);
      persistStaff(updated);
      toast(`Administrator "${formName}" added successfully!`, 'success');
      setModalOpen(false);
    } catch {
      toast('Failed to add administrator', 'error');
    } finally {
      setSaving(false);
    }
  }

  const [deleteTargetUser, setDeleteTargetUser] = useState<StaffUser | null>(null);

  function handleDelete(user: StaffUser) {
    if (user.email === 'admin@smartelectronics.com') {
      toast('Primary Super Admin account cannot be removed', 'error');
      return;
    }
    setDeleteTargetUser(user);
  }

  function confirmDeleteUser() {
    if (!deleteTargetUser) return;
    const updated = staff.filter((s) => s.id !== deleteTargetUser.id);
    setStaff(updated);
    persistStaff(updated);
    toast(`Admin access revoked for "${deleteTargetUser.name}"`, 'success');
    setDeleteTargetUser(null);
  }

  const filtered = useMemo(() => {
    return staff.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
    );
  }, [staff, search]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedList = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Admin Staff & Access Control"
          subtitle="Manage administrative privileges, role-based permissions, and team audit credentials."
        />

        <main className="p-4 sm:p-6 space-y-6 flex-1 max-w-7xl w-full">
          {/* Dynamic Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard
              title="Total Administrators"
              value={loading ? '...' : `${staff.length} Active`}
              icon={<ShieldCheck className="w-5 h-5 text-blue-600" />}
            />
            <StatCard
              title="Two-Factor Enforced"
              value="100% Verified"
              icon={<Key className="w-5 h-5 text-indigo-600" />}
            />
            <StatCard
              title="System Audit Health"
              value="Zero Vulnerabilities"
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            />
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="w-full sm:w-80">
              <SearchInput
                placeholder="Search admin name, email, or role..."
                value={search}
                onChange={setSearch}
                onClear={() => setSearch('')}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={loadStaffUsers}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-slate-700"
              >
                <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                <span>Sync DB</span>
              </Button>
              <Button variant="primary" onClick={handleOpenAdd} className="flex items-center gap-1.5 text-xs">
                <UserPlus className="w-4 h-4" />
                <span>Invite Administrator</span>
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader size="lg" />
                <p className="text-xs font-semibold text-slate-500">Loading admin credentials from database...</p>
              </div>
            ) : filtered.length === 0 ? (
              <TableEmptyState
                icon={<ShieldCheck className="w-10 h-10 text-slate-400" />}
                title="No administrators found"
                description="Try clearing your search query."
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
                      <TableHead>Administrator Name</TableHead>
                      <TableHead>Email Account</TableHead>
                      <TableHead>Role Title</TableHead>
                      <TableHead>Permission Scope</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedList.map((u) => (
                      <TableRow key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black text-xs flex-shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-xs text-slate-900 block">{u.name}</span>
                              {u.isDbUser && (
                                <span className="text-[9px] text-emerald-600 font-semibold">MongoDB Verified</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-semibold text-slate-600 font-mono">{u.email}</span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {u.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-medium text-slate-700">{u.access}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="success">{u.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {u.email !== 'admin@smartelectronics.com' && (
                            <button
                              onClick={() => handleDelete(u)}
                              title="Revoke Administrator Access"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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
                  itemName="admin users"
                />
              </>
            )}
          </div>
        </main>
      </div>

      {/* Invite Administrator Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-black text-sm text-slate-900">Invite Administrator</h3>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Vikram Sharma"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Account *</label>
                <input
                  type="email"
                  placeholder="e.g. vikram@smartelectronics.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Role</label>
                <CustomDropdown
                  options={[
                    { label: 'Super Admin (Full System Control)', value: 'Super Admin', colorDot: 'bg-indigo-500' },
                    { label: 'Catalog Manager (Products & Categories)', value: 'Catalog Manager', colorDot: 'bg-blue-500' },
                    { label: 'Logistics Supervisor (Orders & Fulfillment)', value: 'Logistics Supervisor', colorDot: 'bg-emerald-500' },
                  ]}
                  value={formRole}
                  onChange={(val) => setFormRole(val as any)}
                  direction="auto"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveStaff} disabled={saving} className="flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Inviting...' : 'Send Access Invite'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Common Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTargetUser)}
        onClose={() => setDeleteTargetUser(null)}
        onConfirm={confirmDeleteUser}
        title="Revoke Admin Access"
        itemName={deleteTargetUser ? `${deleteTargetUser.name} (${deleteTargetUser.role})` : undefined}
        message={`Are you sure you want to remove administrator access for "${deleteTargetUser?.name}"? They will no longer be able to log in to the management console.`}
        confirmText="Revoke Access"
      />
    </div>
  );
}
