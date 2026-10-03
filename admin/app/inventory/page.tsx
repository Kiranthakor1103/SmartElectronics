'use client';

import { useState, useEffect } from 'react';
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
} from '../components/ui';
import { Warehouse, AlertTriangle, CheckCircle2, RefreshCcw, Package, ArrowUpDown, TrendingDown } from 'lucide-react';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  thumbnail?: string;
}

export default function AdminInventoryPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [sortField, setSortField] = useState<'name' | 'stock' | 'price'>('stock');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  async function fetchInventory() {
    setLoading(true);
    try {
      const res = await ApiClient.get('/admin/products?page=1&limit=500');
      if (res?.success) {
        const prodList: any[] = res.data?.products || res.data || [];
        const mapped: InventoryItem[] = prodList.map((p: any) => ({
          id: p._id || p.id,
          sku: p.sku || `SE-${(p.category || 'GEN').toUpperCase().slice(0, 3)}-${String(p._id || p.id).slice(-6).toUpperCase()}`,
          name: p.title || p.name || 'Unnamed Product',
          category: p.category || 'General',
          stock: Number(p.stock ?? 0),
          price: Number(p.price ?? 0),
          thumbnail: p.thumbnail,
        }));
        setItems(mapped);
      } else {
        toast(res?.message || 'Failed to load inventory', 'error');
      }
    } catch {
      toast('Connection error loading inventory', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchInventory(); }, []);

  // Stats
  const totalStock = items.reduce((s, i) => s + i.stock, 0);
  const outOfStock = items.filter((i) => i.stock === 0).length;
  const lowStock = items.filter((i) => i.stock > 0 && i.stock < 5).length;
  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category))).sort()];

  const stockOptions = [
    { label: 'All Stock', value: 'All' },
    { label: 'In Stock', value: 'in' },
    { label: 'Low Stock (<5)', value: 'low' },
    { label: 'Out of Stock', value: 'out' },
  ];

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, stockFilter, pageSize]);

  // Filter + sort
  let filtered = items.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || item.category === categoryFilter;
    const matchStock =
      stockFilter === 'All' ||
      (stockFilter === 'out' && item.stock === 0) ||
      (stockFilter === 'low' && item.stock > 0 && item.stock < 5) ||
      (stockFilter === 'in' && item.stock >= 5);
    return matchSearch && matchCat && matchStock;
  });

  filtered = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'name') cmp = a.name.localeCompare(b.name);
    else if (sortField === 'stock') cmp = a.stock - b.stock;
    else if (sortField === 'price') cmp = a.price - b.price;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function toggleSort(field: typeof sortField) {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  }

  function getStockBadge(stock: number) {
    if (stock === 0) return <Badge variant="danger" size="sm" dot>Out of Stock</Badge>;
    if (stock < 5) return <Badge variant="warning" size="sm" dot>Low ({stock})</Badge>;
    return <Badge variant="success" size="sm" dot>In Stock ({stock})</Badge>;
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Live Inventory & Stock"
          subtitle="Real-time stock levels from catalog — monitor low stock and out-of-stock products instantly"
        />

        <main className="p-4 sm:p-6 space-y-6 flex-1 max-w-7xl w-full">

          {/* Live Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            <StatCard
              title="Total Products"
              value={loading ? '—' : String(items.length)}
              icon={<Package className="w-5 h-5" />}
              accentColor="indigo"
              subtitle="In catalog"
            />
            <StatCard
              title="Total Units"
              value={loading ? '—' : totalStock.toLocaleString()}
              icon={<Warehouse className="w-5 h-5" />}
              accentColor="emerald"
              subtitle="Combined stock"
            />
            <StatCard
              title="Low Stock"
              value={loading ? '—' : String(lowStock)}
              icon={<TrendingDown className="w-5 h-5" />}
              accentColor="amber"
              subtitle="Under 5 units"
            />
            <StatCard
              title="Out of Stock"
              value={loading ? '—' : String(outOfStock)}
              icon={<AlertTriangle className="w-5 h-5" />}
              accentColor="rose"
              subtitle="Needs restocking"
            />
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="w-full sm:w-72">
              <SearchInput
                placeholder="Search product, SKU, or category..."
                value={search}
                onChange={(v) => { setSearch(v); setCurrentPage(1); }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CustomDropdown
                label="Category"
                options={categories.map((c) => ({ label: c, value: c }))}
                value={categoryFilter}
                onChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}
              />
              <CustomDropdown
                label="Stock Status"
                options={stockOptions}
                value={stockFilter}
                onChange={(v) => { setStockFilter(v); setCurrentPage(1); }}
              />
              <button
                onClick={fetchInventory}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-10">
                <Loader size="md" label="Loading live inventory from catalog..." />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>
                      <button
                        type="button"
                        onClick={() => toggleSort('stock')}
                        className="flex items-center gap-1 hover:text-blue-700 transition"
                      >
                        Stock <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        type="button"
                        onClick={() => toggleSort('price')}
                        className="flex items-center gap-1 hover:text-blue-700 transition"
                      >
                        Price <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableEmptyState
                      colSpan={7}
                      icon={<Warehouse className="w-8 h-8 text-slate-300" />}
                      title="No inventory items found"
                      description="Try adjusting filters or refreshing"
                    />
                  ) : (
                    paginated.map((item, i) => (
                      <TableRow key={item.id} className={item.stock === 0 ? 'bg-rose-50/40' : item.stock < 5 ? 'bg-amber-50/40' : ''}>
                        <TableCell className="text-slate-400 text-xs font-semibold">
                          {(currentPage - 1) * pageSize + i + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            {item.thumbnail ? (
                              <img
                                src={item.thumbnail}
                                alt={item.name}
                                className="h-8 w-8 rounded-lg object-cover border border-slate-100 shrink-0"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4 text-slate-300" />
                              </div>
                            )}
                            <span className="font-semibold text-slate-800 text-xs line-clamp-2 max-w-[200px]">
                              {item.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-[11px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {item.sku}
                          </code>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-slate-600 font-semibold">{item.category}</span>
                        </TableCell>
                        <TableCell>
                          <span className={`font-black text-sm ${item.stock === 0 ? 'text-rose-600' : item.stock < 5 ? 'text-amber-600' : 'text-slate-900'}`}>
                            {item.stock}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-slate-800">₹{item.price.toLocaleString('en-IN')}</span>
                        </TableCell>
                        <TableCell>
                          {getStockBadge(item.stock)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          {totalPages > 1 && !loading && (
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={pageSize}
              itemsPerPageOptions={[5, 10]}
              onItemsPerPageChange={(s: number) => { setPageSize(s); setCurrentPage(1); }}
              totalItems={filtered.length}
              itemName="inventory items"
            />
          )}
        </main>
      </div>
    </div>
  );
}
