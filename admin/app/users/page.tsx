'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import AdminPagination from '../components/AdminPagination';
import { ApiClient } from '../lib/apiClient';
import { useToast } from '../components/ToastProvider';
import {
  Button,
  CustomDropdown,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyState,
  Loader,
  AdminTableSkeleton,
  DeleteConfirmModal,
} from '../components/ui';
import { Users, Shield, Trash2, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';

interface UserAccount {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'seller' | 'admin';
  phone?: string;
  createdAt?: string;
}

export default function AdminUsersPage() {
  const { toast } = useToast();

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await ApiClient.get(`/admin/users?page=${currentPage}&limit=${pageSize}`);
      if (res.success) {
        if (res.data?.users) {
          setUsers(res.data.users);
          setTotalPages(res.data.pages || 1);
          setTotalUsers(res.data.total || 0);
        } else if (Array.isArray(res.data)) {
          setUsers(res.data);
          setTotalPages(Math.ceil(res.data.length / pageSize) || 1);
          setTotalUsers(res.data.length);
        }
      } else {
        toast(res.message || 'Failed to fetch users', 'error');
      }
    } catch (err) {
      toast('Error fetching users from server', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize]);

  const handleRoleChange = async (userId: string, newRole: 'user' | 'seller' | 'admin') => {
    try {
      const res = await ApiClient.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.success) {
        toast(`User role updated to '${newRole}' successfully`, 'success');
        fetchUsers();
      } else {
        toast(res.message || 'Failed to update role', 'error');
      }
    } catch (err) {
      toast('Error updating user role', 'error');
    }
  };

  const [deleteTargetUser, setDeleteTargetUser] = useState<UserAccount | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  const confirmDeleteUser = async () => {
    if (!deleteTargetUser) return;
    setDeletingUser(true);
    try {
      const res = await ApiClient.delete(`/admin/users/${deleteTargetUser._id}`);
      if (res.success) {
        toast(`User account '${deleteTargetUser.name}' deleted successfully`, 'success');
        setDeleteTargetUser(null);
        fetchUsers();
      } else {
        toast(res.message || 'Failed to delete user', 'error');
      }
    } catch (err) {
      toast('Error deleting user account', 'error');
    } finally {
      setDeletingUser(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader title="User & Role Management" subtitle="Manage registered customers, merchant sellers, and system admin permissions" />

        <main className="p-4 sm:p-6 space-y-6 flex-1">
          
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Registered Accounts Directory</h3>
                  <p className="text-xs text-slate-400">Total registered accounts: {totalUsers || users.length}</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-6 space-y-4">
                <Loader size="lg" label="Loading customer accounts..." sublabel="Connecting to user credentials database" />
                <AdminTableSkeleton rows={6} cols={5} />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <tr>
                    <TableHead>User Details</TableHead>
                    <TableHead>Phone Contact</TableHead>
                    <TableHead>Role Permission</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </tr>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableEmptyState
                      title="No user accounts found"
                      description="There are currently no registered users matching your criteria."
                      icon={<Users className="w-6 h-6" />}
                      colSpan={5}
                    />
                  ) : (
                    users.map((u, idx) => (
                      <TableRow key={u._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 text-white flex items-center justify-center font-black text-xs uppercase shadow-2xs">
                              {u.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{u.name}</p>
                              <p className="text-[11px] text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="font-mono text-slate-500">
                          {u.phone || 'N/A'}
                        </TableCell>

                        <TableCell>
                          <CustomDropdown
                            options={[
                              { label: 'Customer (User)', value: 'user', badge: 'USER', colorDot: 'bg-slate-400', badgeClassName: 'bg-slate-100 text-slate-600' },
                              { label: 'Merchant (Seller)', value: 'seller', badge: 'STORE', colorDot: 'bg-amber-500', badgeClassName: 'bg-amber-100 text-amber-700' },
                              { label: 'Admin (Superuser)', value: 'admin', badge: 'ROOT', colorDot: 'bg-indigo-600', badgeClassName: 'bg-indigo-100 text-indigo-700 font-bold' },
                            ]}
                            value={u.role}
                            onChange={(newRole) => handleRoleChange(u._id, newRole as any)}
                            direction="auto"
                            size="sm"
                            buttonClassName="!py-1 !px-2.5 !rounded-xl"
                          />
                        </TableCell>

                        <TableCell className="text-slate-500 text-[11px]">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            onClick={() => setDeleteTargetUser(u)}
                            variant="danger"
                            size="sm"
                            className="!p-2 !rounded-lg"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
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
              totalItems={totalUsers}
              itemsPerPage={pageSize}
              onPageChange={setCurrentPage}
              itemsPerPageOptions={[5, 10]}
              onItemsPerPageChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemName="users"
            />
          </div>

        </main>
      </div>

      {/* Common Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTargetUser)}
        onClose={() => !deletingUser && setDeleteTargetUser(null)}
        onConfirm={confirmDeleteUser}
        loading={deletingUser}
        title="Delete User Account"
        itemName={deleteTargetUser?.name}
        message={`Are you sure you want to permanently delete user account '${deleteTargetUser?.name}' (${deleteTargetUser?.email})? All associated customer profile data will be permanently wiped.`}
      />
    </div>
  );
}
