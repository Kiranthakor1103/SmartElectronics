"use client";

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, X, CheckCircle2, AlertTriangle, AlertCircle, Sparkles } from "lucide-react";
import { useToast } from "./ToastProvider";

interface ProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role: "admin" | "seller";
}

interface ParsedProduct {
  title: string;
  description: string;
  price: string;
  category: string;
  brand: string;
  image: string;
  stock: string;
  isValid: boolean;
  errors: string[];
}

export default function ProductImportModal({
  isOpen,
  onClose,
  onSuccess,
  role,
}: ProductImportModalProps) {
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [products, setProducts] = useState<ParsedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const parseCSV = (text: string): ParsedProduct[] => {
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) return [];

    // Parse headers
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const parsedList: ParsedProduct[] = [];

    // Valid columns lookup
    const expectedHeaders = ["title", "description", "price", "category", "brand", "image", "stock"];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Split line by comma respecting quotes
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const rowData: Record<string, string> = {};
      headers.forEach((header, index) => {
        let val = values[index] || "";
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        }
        rowData[header] = val;
      });

      // Map to product schema & Validate
      const title = rowData.title || "";
      const description = rowData.description || "";
      const price = rowData.price || "";
      const category = rowData.category || "General";
      const brand = rowData.brand || "";
      const image = rowData.image || "";
      const stock = rowData.stock || "0";

      const errors: string[] = [];
      if (!title) errors.push("Title is required");
      
      const numPrice = Number(price);
      if (isNaN(numPrice) || price === "") {
        errors.push("Price must be a valid number");
      } else if (numPrice < 0) {
        errors.push("Price cannot be negative");
      }

      const numStock = Number(stock);
      if (isNaN(numStock) || stock === "") {
        errors.push("Stock must be a valid number");
      } else if (numStock < 0) {
        errors.push("Stock cannot be negative");
      }

      parsedList.push({
        title,
        description,
        price,
        category,
        brand,
        image,
        stock,
        isValid: errors.length === 0,
        errors,
      });
    }

    return parsedList;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      toast("Please upload a valid CSV file", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        toast("The uploaded CSV is empty or invalid", "error");
      } else {
        setProducts(parsed);
        toast(`Loaded ${parsed.length} rows from CSV`);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const validProducts = products.filter((p) => p.isValid);
    if (validProducts.length === 0) {
      toast("No valid products to import", "error");
      return;
    }

    setLoading(true);
    try {
      const endpoint = "/api/products/import";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: validProducts.map((p) => ({
            title: p.title,
            description: p.description,
            price: Number(p.price),
            category: p.category,
            brand: p.brand,
            image: p.image,
            stock: Number(p.stock),
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast(data.message || `Successfully imported ${validProducts.length} products!`);
        onSuccess();
        onClose();
      } else {
        toast(data.message || "Failed to import products", "error");
      }
    } catch {
      toast("An error occurred during import", "error");
    } finally {
      setLoading(false);
    }
  };

  const csvTemplateData =
    "title,description,price,category,brand,image,stock\n" +
    "Premium Wireless Headphones,Noise cancelling over-ear headphones,8999,Electronics,Sony,https://images.unsplash.com/photo-1505740420928-5e560c06d30e,45\n" +
    "Ergonomic Office Chair,Breathable mesh back with lumbar support,14500,Furniture,Hermes,https://images.unsplash.com/photo-1580481072645-022f9a6dbf27,12";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl transition-all sm:p-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="h-5.5 w-5.5 text-indigo-600" />
              Import Products Catalog
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {role === "seller"
                ? "Bulk import products as pending moderation approvals."
                : "Bulk import approved products directly to store catalog."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal content body */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {products.length === 0 ? (
            /* Upload file zone */
            <div className="space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all ${
                  dragActive
                    ? "border-indigo-600 bg-indigo-50/50"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-350"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-4">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-slate-700 text-center">
                  Drag and drop your CSV file here, or click to browse
                </p>
                <p className="text-xs text-slate-400 mt-1.5 text-center">
                  Supports .csv files only (Max 2MB)
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                  Expected CSV Layout format
                </h4>
                <p className="text-xs text-slate-650 leading-relaxed">
                  Your CSV must contain these headers in the exact order: <code className="bg-slate-200/60 px-1.5 py-0.5 rounded text-indigo-700 font-semibold text-[11px]">title, description, price, category, brand, image, stock</code>
                </p>
                <a
                  href={`data:text/csv;charset=utf-8,${encodeURIComponent(csvTemplateData)}`}
                  download="KTStore_Product_Template.csv"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  📥 Download Sample Template CSV
                </a>
              </div>
            </div>
          ) : (
            /* Table preview */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Total Parsed Rows: <strong className="text-slate-800">{products.length}</strong> | 
                  Valid: <strong className="text-emerald-600">{products.filter((p) => p.isValid).length}</strong> | 
                  Invalid: <strong className="text-rose-600">{products.filter((p) => !p.isValid).length}</strong>
                </span>
                <button
                  onClick={() => setProducts([])}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  Clear and Upload Another File
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-[300px]">
                <table className="w-full text-left text-xs text-slate-600 border-collapse">
                  <thead className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-150 bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Title</th>
                      <th className="px-4 py-3 font-semibold">Category</th>
                      <th className="px-4 py-3 font-semibold">Price</th>
                      <th className="px-4 py-3 font-semibold">Stock</th>
                      <th className="px-4 py-3 font-semibold">Validation status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((prod, idx) => (
                      <tr key={idx} className={prod.isValid ? "bg-white" : "bg-rose-50/30"}>
                        <td className="px-4 py-3 font-medium text-slate-800 max-w-[200px] truncate">
                          {prod.title || <em className="text-slate-400">Empty</em>}
                        </td>
                        <td className="px-4 py-3 capitalize">{prod.category}</td>
                        <td className="px-4 py-3">₹{prod.price || "0"}</td>
                        <td className="px-4 py-3">{prod.stock || "0"}</td>
                        <td className="px-4 py-3">
                          {prod.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Valid
                            </span>
                          ) : (
                            <span className="inline-flex flex-col gap-0.5">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Invalid
                              </span>
                              <span className="text-[9px] text-rose-500 max-w-[200px] leading-tight">
                                {prod.errors.join(", ")}
                              </span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 shrink-0">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-650 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          {products.length > 0 && (
            <button
              onClick={handleImport}
              disabled={loading || products.filter((p) => p.isValid).length === 0}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Importing...
                </>
              ) : (
                `Import ${products.filter((p) => p.isValid).length} Products`
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
