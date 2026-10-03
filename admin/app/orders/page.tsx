'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import AdminPagination from '../components/AdminPagination';
import { ApiClient } from '../lib/apiClient';
import { useToast } from '../components/ToastProvider';
import {
  CustomDropdown,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyState,
  Button,
  Badge,
  Loader,
  AdminTableSkeleton,
} from '../components/ui';
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  MapPin,
  Phone,
  Mail,
  Copy,
  Check,
  Eye,
  X,
  CreditCard,
  Banknote,
  Package,
  Calendar,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface OrderItem {
  _id: string;
  orderNumber?: string;
  stripeSessionId?: string;
  amount: number;
  status: string;
  paymentMethod?: 'cod' | 'stripe' | 'card' | 'upi';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  userId?: { name?: string; email?: string; phone?: string };
  customer?: { name?: string; email?: string; phone?: string };
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    pincode?: string;
    locality?: string;
    address?: string;
    city?: string;
    state?: string;
    addressType?: string;
  };
  items?: Array<{
    productId?: any;
    title?: string;
    thumbnail?: string;
    price: number;
    quantity: number;
  }>;
  createdAt?: string;
  paidAt?: string;
  deliveredAt?: string;
  discount?: number;
  shipping?: number;
}

export default function AdminOrdersPage() {
  const { toast } = useToast();

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Selected Order for Details Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  // Flipkart Fulfillment Pipeline Statuses
  const validStatuses = [
    'placed',
    'confirmed',
    'processing',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ];

  const orderStatusDropdownOptions = [
    { label: 'PLACED', value: 'placed', colorDot: 'bg-amber-500' },
    { label: 'CONFIRMED', value: 'confirmed', colorDot: 'bg-blue-500' },
    { label: 'PROCESSING', value: 'processing', colorDot: 'bg-indigo-500' },
    { label: 'SHIPPED', value: 'shipped', colorDot: 'bg-sky-500' },
    { label: 'OUT FOR DELIVERY', value: 'out_for_delivery', colorDot: 'bg-purple-500' },
    { label: 'DELIVERED', value: 'delivered', colorDot: 'bg-emerald-500' },
    { label: 'CANCELLED', value: 'cancelled', colorDot: 'bg-rose-500' },
  ];

  async function fetchOrders() {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(currentPage),
        limit: String(pageSize),
        status: statusFilter,
      });
      if (searchQuery.trim()) {
        queryParams.append('search', searchQuery.trim());
      }

      const res = await ApiClient.get(`/admin/orders?${queryParams.toString()}`);
      if (res.success) {
        if (res.data?.orders) {
          setOrders(res.data.orders);
          setTotalPages(res.data.pages || 1);
          setTotalOrders(res.data.total || 0);
        } else if (Array.isArray(res.data)) {
          setOrders(res.data);
          setTotalPages(Math.ceil(res.data.length / pageSize) || 1);
          setTotalOrders(res.data.length);
        }
      } else {
        toast(res.message || 'Failed to fetch orders', 'error');
      }
    } catch (err) {
      toast('Error loading orders from server', 'error');
    } finally {
      setLoading(false);
    }
  }

  // Reset page to 1 when status filter, search, or pageSize changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery, pageSize]);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, currentPage, searchQuery, pageSize]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await ApiClient.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      if (res.success) {
        if (newStatus === 'delivered') {
          toast(
            `Order marked as Delivered! COD payment automatically confirmed as Paid/Collected.`,
            'success'
          );
        } else {
          toast(`Order status updated to '${newStatus}'`, 'success');
        }

        // Update selected order if modal is open
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(res.data);
        }

        fetchOrders();
      } else {
        toast(res.message || 'Failed to update order status', 'error');
      }
    } catch (err) {
      toast('Error updating order status', 'error');
    }
  };

  const handleMarkPaymentPaid = async (orderId: string) => {
    setUpdatingPayment(true);
    try {
      const res = await ApiClient.put(`/admin/orders/${orderId}/payment-status`, {
        paymentStatus: 'paid',
      });
      if (res.success) {
        toast('COD cash payment marked as Collected & Paid!', 'success');
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(res.data);
        }
        fetchOrders();
      } else {
        toast(res.message || 'Failed to update payment status', 'error');
      }
    } catch (err) {
      toast('Network error updating payment status', 'error');
    } finally {
      setUpdatingPayment(false);
    }
  };

  const copyOrderNumber = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const copyFullAddress = (addrText: string) => {
    navigator.clipboard.writeText(addrText);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Order Fulfillment & COD Management"
          subtitle="Flipkart-grade tracking: Manage order shipments, verify delivery addresses, and track Cash on Delivery collections"
        />

        <main className="p-4 sm:p-6 space-y-6 flex-1">
          
          {/* Top Control Bar: Search & Status Tabs */}
          <div className="space-y-4">
            {/* Search Input Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Order #, Customer, Phone, or City..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-600 outline-none transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="text-xs font-bold text-slate-500">
                Showing <span className="text-indigo-600 font-extrabold">{orders.length}</span> of {totalOrders} orders
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200/90 p-1.5 rounded-2xl shadow-2xs overflow-x-auto">
              <button
                onClick={() => setStatusFilter('All')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition capitalize whitespace-nowrap cursor-pointer ${
                  statusFilter === 'All'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold'
                }`}
              >
                All Orders {statusFilter === 'All' && totalOrders > 0 ? `(${totalOrders})` : ''}
              </button>
              {validStatuses.map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition capitalize whitespace-nowrap cursor-pointer ${
                    statusFilter === st
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold'
                  }`}
                >
                  {st.replace(/_/g, ' ')} {statusFilter === st && totalOrders > 0 ? `(${totalOrders})` : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            {loading ? (
              <div className="p-6 space-y-4">
                <Loader size="lg" label="Loading order fulfillment records..." sublabel="Connecting to tracking pipeline" />
                <AdminTableSkeleton rows={6} cols={6} />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <tr>
                    <TableHead>Order Reference</TableHead>
                    <TableHead>Customer &amp; Destination</TableHead>
                    <TableHead>Amount &amp; Items</TableHead>
                    <TableHead>Payment &amp; COD Status</TableHead>
                    <TableHead>Fulfillment Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </tr>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableEmptyState
                      title="No orders found"
                      description="There are no customer orders matching your search or status filter."
                      icon={<ShoppingBag className="w-6 h-6" />}
                      colSpan={6}
                    />
                  ) : (
                    orders.map((o, idx) => {
                      const displayOrderNo =
                        o.orderNumber ||
                        `OD-KT-${o._id?.slice(-8)?.toUpperCase()}`;
                      const customerName =
                        o.customer?.name ||
                        o.shippingAddress?.fullName ||
                        o.userId?.name ||
                        'Guest Customer';
                      const customerPhone =
                        o.customer?.phone ||
                        o.shippingAddress?.phone ||
                        o.userId?.phone ||
                        '—';
                      const destination =
                        o.shippingAddress?.city && o.shippingAddress?.state
                          ? `${o.shippingAddress.city}, ${o.shippingAddress.state}`
                          : o.shippingAddress?.city || 'Local Delivery';

                      const isCod = o.paymentMethod === 'cod';
                      const isPaid =
                        o.paymentStatus === 'paid' ||
                        o.status === 'delivered' ||
                        o.status === 'paid';

                      return (
                        <TableRow key={o._id} className="hover:bg-slate-50/80 transition">
                          {/* Order Reference */}
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900 font-mono text-xs">
                                {displayOrderNo}
                              </span>
                              <button
                                onClick={() => copyOrderNumber(displayOrderNo)}
                                className="text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                                title="Copy Order Number"
                              >
                                {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }) : 'N/A'}
                            </p>
                          </TableCell>

                          {/* Customer & Destination */}
                          <TableCell>
                            <p className="font-bold text-slate-900 text-xs">{customerName}</p>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                              {customerPhone !== '—' ? (
                                <a
                                  href={`tel:${customerPhone}`}
                                  className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                                >
                                  <Phone className="w-3 h-3" /> {customerPhone}
                                </a>
                              ) : (
                                <span className="text-slate-400">No phone</span>
                              )}
                              <span>•</span>
                              <span className="flex items-center gap-0.5 text-slate-600">
                                <MapPin className="w-3 h-3 text-slate-400" /> {destination}
                              </span>
                            </div>
                          </TableCell>

                          {/* Total Amount & Items */}
                          <TableCell>
                            <div className="font-black text-slate-900 text-sm">
                              ₹{o.amount?.toLocaleString('en-IN')}
                            </div>
                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                              {o.items?.length || 1} Item(s)
                            </p>
                          </TableCell>

                          {/* Payment Details (COD vs Prepaid) */}
                          <TableCell>
                            <div className="space-y-1">
                              {/* Payment Method Badge */}
                              <div>
                                {isCod ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-md">
                                    <Banknote className="w-3 h-3 text-amber-600" /> Cash on Delivery
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200/80 px-2 py-0.5 rounded-md">
                                    <CreditCard className="w-3 h-3 text-blue-600" /> {o.paymentMethod?.toUpperCase() || 'PREPAID'}
                                  </span>
                                )}
                              </div>

                              {/* Payment Collection Status */}
                              <div>
                                {isPaid ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    {isCod ? 'COD COLLECTED' : 'PAID'}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-orange-50 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-md">
                                    <AlertCircle className="w-3 h-3 text-orange-600" />
                                    {isCod ? `COLLECT ₹${o.amount?.toLocaleString('en-IN')}` : 'UNPAID'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          {/* Fulfillment Status Dropdown */}
                          <TableCell>
                            <CustomDropdown
                              options={orderStatusDropdownOptions}
                              value={o.status || 'placed'}
                              onChange={(newSt) => handleStatusChange(o._id, newSt)}
                              direction="auto"
                              size="sm"
                              buttonClassName="!py-1.5 !px-3 !rounded-xl text-xs font-bold border-slate-200 hover:border-indigo-400"
                            />
                          </TableCell>

                          {/* Action Button */}
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<Eye className="w-3.5 h-3.5" />}
                              onClick={() => setSelectedOrder(o)}
                              className="!py-1.5 !px-3 !text-xs !rounded-xl"
                            >
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}

            {/* Pagination Bar */}
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalOrders}
              itemsPerPage={pageSize}
              onPageChange={setCurrentPage}
              itemsPerPageOptions={[5, 10]}
              onItemsPerPageChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemName="orders"
            />
          </div>

        </main>
      </div>

      {/* ── FLIPKART-GRADE ORDER DETAILS MODAL ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 font-mono">
                    {selectedOrder.orderNumber || `OD-${selectedOrder._id?.slice(-8)?.toUpperCase()}`}
                  </h3>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                    selectedOrder.status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedOrder.status === 'cancelled'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {selectedOrder.status?.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Placed on {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('en-IN') : 'N/A'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-6 text-xs">
              
              {/* Payment & COD Verification Box */}
              <div className={`p-4 rounded-2xl border ${
                selectedOrder.paymentStatus === 'paid'
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/70 border-amber-200 text-amber-900'
              } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                    selectedOrder.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedOrder.paymentMethod === 'cod' ? <Banknote className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm capitalize">
                      {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery (Doorstep Payment)' : 'Prepaid Online Order'}
                    </h4>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      {selectedOrder.paymentStatus === 'paid'
                        ? `Payment of ₹${selectedOrder.amount?.toLocaleString('en-IN')} Received & Verified.`
                        : `Collect ₹${selectedOrder.amount?.toLocaleString('en-IN')} in cash or UPI scan at delivery.`}
                    </p>
                  </div>
                </div>

                {/* Mark as Paid CTA Button */}
                {selectedOrder.paymentStatus !== 'paid' && (
                  <Button
                    variant="success"
                    size="sm"
                    disabled={updatingPayment}
                    loading={updatingPayment}
                    icon={<Check className="w-3.5 h-3.5" />}
                    onClick={() => handleMarkPaymentPaid(selectedOrder._id)}
                    className="!py-2 !px-4 !text-xs whitespace-nowrap self-end sm:self-auto"
                  >
                    Mark Cash as Collected
                  </Button>
                )}
              </div>

              {/* Delivery Address & Contact Section */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-slate-400" /> Delivery Destination &amp; Recipient
                  </span>
                  {selectedOrder.shippingAddress?.address && (
                    <button
                      type="button"
                      onClick={() => {
                        const addr = `${selectedOrder.shippingAddress?.fullName} (${selectedOrder.shippingAddress?.phone}), ${selectedOrder.shippingAddress?.address}, ${selectedOrder.shippingAddress?.locality || ''}, ${selectedOrder.shippingAddress?.city}, ${selectedOrder.shippingAddress?.state} - ${selectedOrder.shippingAddress?.pincode}`;
                        copyFullAddress(addr);
                      }}
                      className="text-indigo-600 hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedAddress ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copiedAddress ? 'Copied Label!' : 'Copy Address Label'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Recipient Name</span>
                    <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                      {selectedOrder.shippingAddress?.fullName || selectedOrder.customer?.name || 'Customer'}
                    </p>
                    {selectedOrder.shippingAddress?.addressType && (
                      <span className="inline-block bg-slate-200 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded mt-1">
                        {selectedOrder.shippingAddress.addressType} Delivery
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Phone</span>
                    {selectedOrder.shippingAddress?.phone || selectedOrder.customer?.phone ? (
                      <a
                        href={`tel:${selectedOrder.shippingAddress?.phone || selectedOrder.customer?.phone}`}
                        className="font-bold text-indigo-600 hover:underline text-xs flex items-center gap-1 mt-0.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {selectedOrder.shippingAddress?.phone || selectedOrder.customer?.phone}
                      </a>
                    ) : (
                      <span className="text-slate-400">Not provided</span>
                    )}
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Delivery Address</span>
                  <div className="text-slate-700 text-xs font-medium leading-relaxed mt-0.5">
                    {selectedOrder.shippingAddress?.address ? (
                      <div>
                        {selectedOrder.shippingAddress.address}
                        {selectedOrder.shippingAddress.locality ? `, ${selectedOrder.shippingAddress.locality}` : ''},<br />
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} — {selectedOrder.shippingAddress.pincode}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">No detailed shipping address available for this order.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items Breakdown */}
              <div className="space-y-3">
                <span className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider block">
                  Purchased Items ({selectedOrder.items?.length || 1})
                </span>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((it, idx) => {
                      const thumb = it.thumbnail || '/placeholder.svg';
                      return (
                        <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50">
                          <div className="relative w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0">
                            <Image src={thumb} alt={it.title || 'Product'} fill className="object-contain p-1" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 truncate text-xs">{it.title || 'Product Item'}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Quantity: <span className="font-bold text-slate-700">{it.quantity}</span> × ₹{Number(it.price).toLocaleString('en-IN')}
                            </p>
                          </div>
                          <div className="text-right font-extrabold text-slate-900 text-xs">
                            ₹{(Number(it.price) * Number(it.quantity)).toLocaleString('en-IN')}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-slate-400 py-2">No itemized products found for this order.</div>
                  )}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Shipping &amp; Logistics</span>
                  <span className="font-bold text-emerald-600">
                    {selectedOrder.shipping === 0 ? 'FREE' : `₹${selectedOrder.shipping || 0}`}
                  </span>
                </div>
                {selectedOrder.discount ? (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount Applied</span>
                    <span>−₹{selectedOrder.discount}</span>
                  </div>
                ) : null}
                <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900 text-sm">
                  <span>Grand Total</span>
                  <span className="text-indigo-600 font-extrabold text-base">
                    ₹{selectedOrder.amount?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="text-[11px] text-slate-500">
                Update status or mark collected to keep records synchronized.
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrder(null)}
                className="!px-5 !py-2 !text-xs"
              >
                Close
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

