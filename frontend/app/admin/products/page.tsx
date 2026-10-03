"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, X, Building, Sparkles, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/app/components/ToastProvider";
import ProductImportModal from "@/app/components/ProductImportModal";

interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  status: "pending" | "approved" | "rejected";
  sellerId?: {
    companyName: string;
  };
}

const ProductImage = ({ src, alt }: { src?: string; alt: string }) => {
  const [imgSrc, setImgSrc] = useState(src || "");
  const [error, setError] = useState(!src);

  useEffect(() => {
    setImgSrc(src || "");
    setError(!src);
  }, [src]);

  if (error) {
    return <Sparkles className="h-5 w-5 text-slate-400" />;
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className="object-cover"
      sizes="48px"
      onError={() => setError(true)}
    />
  );
};

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      toast("Failed to load products for moderation", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
  }, []);

  const handleUpdateStatus = async (id: number, newStatus: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/admin/products/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast(`Product status updated to ${newStatus}`);
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
        );
      } else {
        const data = await res.json();
        toast(data.message || "Failed to update product status", "error");
      }
    } catch (err) {
      toast("An error occurred updating product status", "error");
    }
  };

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">Catalog Moderation</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Review incoming merchant catalog listings, check details, pricing, and approve them.
          </p>
        </div>
        <button
          onClick={() => setImportOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 active:scale-95 shadow-sm shrink-0"
        >
          <FileSpreadsheet className="h-4.5 w-4.5 text-indigo-600" />
          Import CSV
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 border-dashed bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No products found</h3>
          <p className="mt-1.5 text-sm text-slate-500 max-w-sm mx-auto">
            No product listings are currently submitted for review.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 font-semibold">Product info</th>
                <th className="px-6 py-4 font-semibold">Merchant / Owner</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Price / Stock</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/30 transition-colors">
                  {/* Product Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                        <ProductImage src={product.image} alt={product.title} />
                      </div>
                      <span className="font-bold text-slate-800 truncate max-w-xs">{product.title}</span>
                    </div>
                  </td>
                  {/* Owner */}
                  <td className="px-6 py-4">
                    {product.sellerId ? (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-600">
                        <Building className="h-3.5 w-3.5 text-indigo-500" />
                        {product.sellerId.companyName}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium italic">KTStore Platform</span>
                    )}
                  </td>
                  {/* Category */}
                  <td className="px-6 py-4 font-medium text-slate-600">{product.category}</td>
                  {/* Financials */}
                  <td className="px-6 py-4 text-xs text-slate-600">
                    <div>Price: ₹{product.price.toLocaleString("en-IN")}</div>
                    <div className="mt-1 text-slate-400">Stock: {product.stock} units</div>
                  </td>
                  {/* Status */}
                  <td className="px-6 py-4">
                    {product.status === "approved" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 text-xs font-semibold">
                        Approved
                      </span>
                    )}
                    {product.status === "pending" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 text-xs font-semibold animate-pulse">
                        Pending Approval
                      </span>
                    )}
                    {product.status === "rejected" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-0.5 text-xs font-semibold">
                        Rejected
                      </span>
                    )}
                  </td>
                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    {product.status === "pending" ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleUpdateStatus(product.id, "approved")}
                          className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-555 text-white transition active:scale-95 shadow-md shadow-emerald-600/10"
                          title="Approve Listing"
                        >
                          <Check className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(product.id, "rejected")}
                          className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-rose-600 hover:bg-rose-555 text-white transition active:scale-95 shadow-md shadow-rose-600/10"
                          title="Reject Listing"
                        >
                          <X className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Moderated</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/30">
              <span className="text-xs font-medium text-slate-500">
                Showing <strong className="text-slate-800">{Math.min(products.length, (currentPage - 1) * itemsPerPage + 1)}</strong> to{" "}
                <strong className="text-slate-800">{Math.min(products.length, currentPage * itemsPerPage)}</strong> of{" "}
                <strong className="text-slate-800">{products.length}</strong> products
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-650 hover:bg-slate-50 hover:text-slate-850 transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                  <span>Page</span>
                  <span className="flex h-7 min-w-7 items-center justify-center rounded-md bg-indigo-50 text-indigo-650 px-1.5">
                    {currentPage}
                  </span>
                  <span>of</span>
                  <span>{totalPages}</span>
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-650 hover:bg-slate-50 hover:text-slate-850 transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <ProductImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={fetchProducts}
        role="admin"
      />
    </div>
  );
}
