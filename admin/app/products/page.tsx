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
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Tag,
  RefreshCw,
} from 'lucide-react';

interface ProductItem {
  _id: string;
  id?: number;
  title: string;
  price: number;
  discountPercentage?: number;
  category: string;
  subCategory?: string;
  brand?: string;
  stock: number;
  thumbnail: string;
  description?: string;
  status: string;
  couponCode?: string;
}

interface AvailableCoupon {
  _id: string;
  code: string;
  label?: string;
  type?: string;
  value?: number;
}

export default function AdminProductsPage() {
  const { toast } = useToast();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>([]);
  const [updatingCouponId, setUpdatingCouponId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [categories, setCategories] = useState<string[]>([
    'All',
    'Mobile & Tablets',
    'Laptops & Computers',
    'TVs & Entertainment',
    'Audio Devices',
    'Smart Devices',
    'Computer Accessories',
    'Gaming Zone',
    'Power & Charging',
    'Home Appliances',
    'Kitchen Appliances',
    'Cameras & Security',
  ]);

  // Fetch real categories from API on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await ApiClient.get('/categories');
        if (res.success && res.data?.categories) {
          const catNames: string[] = res.data.categories.map((c: any) => c.name);
          const uniqueCats = ['All', ...Array.from(new Set(catNames))];
          setCategories(uniqueCats);
        }
      } catch (err) {
        console.warn('Fallback categories in use');
      }
    }
    loadCategories();
  }, []);

  // Fetch active promo coupons for assignment
  useEffect(() => {
    async function loadCoupons() {
      try {
        const res = await ApiClient.get('/admin/coupons?limit=100');
        if (res.success && res.data?.coupons) {
          setAvailableCoupons(res.data.coupons);
        }
      } catch (err) {
        console.warn('Fallback: could not load coupons from admin');
      }
    }
    loadCoupons();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await ApiClient.get(
        `/admin/products?page=${currentPage}&limit=${pageSize}&search=${encodeURIComponent(search)}&category=${encodeURIComponent(categoryFilter)}`
      );
      if (res.success) {
        setProducts(res.data.products || []);
        setTotalPages(res.data.pages || 1);
        setTotalProducts(res.data.total || 0);
      } else {
        toast(res.message || 'Failed to fetch products', 'error');
      }
    } catch (err) {
      toast('Failed to load products from server', 'error');
    } finally {
      setLoading(false);
    }
  }

  // Reset page to 1 when search, category filter, or pageSize changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, pageSize]);

  useEffect(() => {
    fetchProducts();

    // Real-time stock synchronization: auto-poll stock changes every 15 seconds
    const interval = setInterval(() => {
      fetchProducts();
    }, 15000);
    return () => clearInterval(interval);
  }, [search, categoryFilter, currentPage, pageSize]);

  const handleUpdateCoupon = async (productId: string, newCouponCode: string) => {
    setUpdatingCouponId(productId);
    try {
      const res = await ApiClient.put(`/admin/products/${productId}`, {
        couponCode: newCouponCode,
      });

      if (res.success) {
        setProducts((prev) =>
          prev.map((p) =>
            (p._id === productId || String(p.id) === productId)
              ? { ...p, couponCode: newCouponCode }
              : p
          )
        );
        toast(
          newCouponCode
            ? `Coupon ${newCouponCode} assigned to product!`
            : 'Coupon removed from product',
          'success'
        );
      } else {
        toast(res.message || 'Failed to update product coupon', 'error');
      }
    } catch (err) {
      toast('Error saving coupon assignment', 'error');
    } finally {
      setUpdatingCouponId(null);
    }
  };

  const [deleteTargetProduct, setDeleteTargetProduct] = useState<ProductItem | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);

  const confirmDeleteProduct = async () => {
    if (!deleteTargetProduct) return;
    const prodId = deleteTargetProduct._id || String(deleteTargetProduct.id);
    const prodTitle = deleteTargetProduct.title;
    setDeletingProduct(true);
    try {
      const res = await ApiClient.delete(`/admin/products/${prodId}`);
      if (res.success) {
        toast(`Product "${prodTitle}" deleted successfully`, 'success');
        setDeleteTargetProduct(null);
        fetchProducts();
      } else {
        toast(res.message || 'Failed to delete product', 'error');
      }
    } catch (err) {
      toast('Error deleting product', 'error');
    } finally {
      setDeletingProduct(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader title="Product Catalog Management" subtitle="Add, edit, manage stock, and maintain store products" />

        <main className="p-4 sm:p-6 space-y-6 flex-1">
          
          {/* Controls Bar: SearchInput, CustomDropdown Filter, Add CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
            <div className="flex flex-1 items-center gap-3 w-full sm:w-auto flex-wrap">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search catalog products..."
                className="w-full sm:w-72"
              />

              <CustomDropdown
                label="Category"
                icon={<Filter className="w-3.5 h-3.5" />}
                options={categories.map((cat) => ({
                  label: cat === 'All Categories' ? 'All Categories' : cat,
                  value: cat,
                }))}
                value={categoryFilter}
                onChange={setCategoryFilter}
              />
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Button
                variant="outline"
                size="md"
                onClick={fetchProducts}
                icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />}
                className="w-full sm:w-auto text-slate-700 bg-white hover:bg-slate-50 border-slate-200"
                title="Refresh stock levels from live database"
              >
                Sync Stock
              </Button>

              <ButtonLink
                href="/products/new"
                icon={<Plus className="w-4 h-4" />}
                size="md"
                className="w-full sm:w-auto"
              >
                Add New Product
              </ButtonLink>
            </div>
          </div>

          {/* Product Data Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            {loading ? (
              <div className="p-6 space-y-4">
                <Loader size="lg" label="Synchronizing store catalog..." sublabel="Fetching latest inventory and stock levels" />
                <AdminTableSkeleton rows={6} cols={6} />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <tr>
                    <TableHead>Product Details</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Coupon Offer</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </tr>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableEmptyState
                      title="No products found matching criteria"
                      description="Try adjusting your search query or category filter."
                      icon={<Package className="w-6 h-6" />}
                      colSpan={7}
                      action={
                        <ButtonLink href="/products/new" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
                          Add New Product
                        </ButtonLink>
                      }
                    />
                  ) : (
                    products.map((prod, idx) => (
                      <TableRow key={prod._id || prod.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                              <img
                                src={prod.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'}
                                alt={prod.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 line-clamp-1">{prod.title}</p>
                              <p className="text-[10px] text-slate-400 font-semibold">{prod.brand || 'Generic'}</p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="capitalize font-semibold text-slate-700">
                            {prod.category}
                          </div>
                          {prod.subCategory && (
                            <span className="inline-block mt-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100/80 px-2 py-0.5 rounded-md">
                              {prod.subCategory}
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="font-black text-slate-900">
                          ₹{prod.price?.toLocaleString()}
                          {prod.discountPercentage ? (
                            <span className="ml-1 text-[10px] text-emerald-600 font-bold">
                              ({prod.discountPercentage}% OFF)
                            </span>
                          ) : null}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1.5 min-w-[170px]">
                            <CustomDropdown
                              options={[
                                { label: '— No Coupon —', value: '' },
                                ...availableCoupons.map((c) => ({
                                  label: `${c.code} (${c.type === 'percent' ? `${c.value}% OFF` : `₹${c.value} OFF`})`,
                                  value: c.code,
                                  badge: c.type === 'percent' ? `${c.value}%` : `₹${c.value}`,
                                })),
                              ]}
                              value={prod.couponCode || ''}
                              onChange={(newCode) => handleUpdateCoupon(prod._id || String(prod.id), newCode)}
                              disabled={updatingCouponId === (prod._id || String(prod.id))}
                              direction="auto"
                              size="sm"
                              placeholder="— No Coupon —"
                              icon={<Tag className="w-3.5 h-3.5" />}
                              buttonClassName={
                                prod.couponCode
                                  ? '!bg-emerald-50/90 !border-emerald-300 !text-emerald-800 font-mono tracking-wider'
                                  : '!bg-slate-50 !border-slate-200 !text-slate-500'
                              }
                            />

                            {prod.couponCode && (
                              <button
                                type="button"
                                disabled={updatingCouponId === (prod._id || String(prod.id))}
                                onClick={() => handleUpdateCoupon(prod._id || String(prod.id), '')}
                                title="Remove coupon assignment"
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                              >
                                <span className="sr-only">Remove coupon</span>
                                ✕
                              </button>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={prod.stock > 10 ? 'success' : prod.stock > 0 ? 'warning' : 'danger'}
                            dot
                          >
                            {prod.stock > 0 ? `${prod.stock} in stock` : 'Out of Stock'}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge variant="indigo">
                            {prod.status || 'approved'}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <ButtonLink
                              href={`/products/${prod._id || prod.id}/edit`}
                              variant="outline"
                              size="sm"
                              className="!p-2 !rounded-lg"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                            </ButtonLink>

                            <Button
                              onClick={() => setDeleteTargetProduct(prod)}
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

            {/* Responsive Electronics Products Pagination Bar */}
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalProducts}
              itemsPerPage={pageSize}
              onPageChange={setCurrentPage}
              itemsPerPageOptions={[5, 10]}
              onItemsPerPageChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemName="products"
            />
          </div>

        </main>
      </div>

      {/* Common Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTargetProduct)}
        onClose={() => !deletingProduct && setDeleteTargetProduct(null)}
        onConfirm={confirmDeleteProduct}
        loading={deletingProduct}
        title="Delete Product"
        itemName={deleteTargetProduct?.title}
        message={`Are you sure you want to delete "${deleteTargetProduct?.title}" from the store catalog? Customers will no longer be able to view or purchase this product.`}
      />
    </div>
  );
}
