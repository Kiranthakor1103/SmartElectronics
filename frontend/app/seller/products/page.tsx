"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Edit2, Trash2, ShieldCheck, ShieldAlert, Sparkles, FileSpreadsheet, X } from "lucide-react";
import { useToast } from "@/app/components/ToastProvider";
import ProductImportModal from "@/app/components/ProductImportModal";
import { Loader, TableSkeleton } from "@/app/components/ui/Loader";

interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  brand?: string;
  status: "pending" | "approved" | "rejected";
}

const ProductImage = ({ src, alt }: { src?: string; alt: string }) => {
  const [error, setError] = useState(false);

  if (!src || error) {
    return <Sparkles className="h-5 w-5 text-slate-400" />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes="48px"
      onError={() => setError(true)}
    />
  );
};

export default function SellerProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products?myProducts=true");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch {
      toast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product listing?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast("Product deleted successfully");
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        const data = await res.json();
        toast(data.message || "Failed to delete product", "error");
      }
    } catch {
      toast("Failed to delete product", "error");
    }
  };

  const filteredProducts = products.filter((product) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      product.title.toLowerCase().includes(q) ||
      (product.category || "").toLowerCase().includes(q) ||
      (product.brand || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">My Catalog</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Manage your listed products, review moderation status, and configure stocks.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setImportOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 active:scale-95 shadow-sm"
          >
            <FileSpreadsheet className="h-4.5 w-4.5 text-indigo-600" />
            Import CSV
          </button>
          <Link
            href="/seller/products/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-600/10"
          >
            <Plus className="h-4.5 w-4.5" />
            Add New Product
          </Link>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by title, category or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Catalog Grid/Table */}
      {loading ? (
        <div className="space-y-4">
          <Loader size="lg" label="Loading merchant inventory..." sublabel="Retrieving your listed products and approval status" />
          <TableSkeleton rows={5} cols={5} />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 border-dashed bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No products found</h3>
          <p className="mt-1.5 text-sm text-slate-500 max-w-sm mx-auto">
            {searchQuery ? "No search matches. Try adjusting filters." : "Start listing products on the KTStore marketplace to get started."}
          </p>
          {!searchQuery && (
            <Link
              href="/seller/products/new"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-200 transition"
            >
              List your first product
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 font-semibold">Product info</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Stock</th>
                <th className="px-6 py-4 font-semibold">Moderation</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                        <ProductImage src={product.image} alt={product.title} />
                      </div>
                      <span className="font-bold text-slate-800 truncate max-w-xs">{product.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">{product.category}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">₹{product.price.toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${product.stock <= 5 ? "text-amber-600" : "text-slate-500"}`}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {product.status === "approved" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Approved
                      </span>
                    )}
                    {product.status === "pending" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 animate-pulse">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        Pending Review
                      </span>
                    )}
                    {product.status === "rejected" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        Rejected
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/seller/products/${product.id}/edit`}
                        className="flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-indigo-650 hover:border-indigo-200 hover:bg-indigo-50/20 transition"
                        title="Edit Listing"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition"
                        title="Delete Listing"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/30">
              <span className="text-xs font-medium text-slate-500">
                Showing <strong className="text-slate-800">{Math.min(filteredProducts.length, (currentPage - 1) * itemsPerPage + 1)}</strong> to{" "}
                <strong className="text-slate-800">{Math.min(filteredProducts.length, currentPage * itemsPerPage)}</strong> of{" "}
                <strong className="text-slate-800">{filteredProducts.length}</strong> products
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
        role="seller"
      />
    </div>
  );
}
