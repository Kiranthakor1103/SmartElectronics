'use client';

import { useState, useEffect, useRef } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { ApiClient } from '../lib/apiClient';
import { useToast } from '../components/ToastProvider';
import { StatCard, Loader, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmptyState } from '../components/ui';
import type { BadgeVariant } from '../components/ui/Badge';
import {
  BarChart3,
  TrendingUp,
  IndianRupee,
  ShoppingBag,
  ShieldCheck,
  Download,
  Users,
  Package,
  RefreshCcw,
  ArrowUpRight,
  Zap,
  Star,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  Printer,
  Check,
} from 'lucide-react';

interface Metrics {
  totalRevenue?: number;
  totalOrders?: number;
  totalProducts?: number;
  totalUsers?: number;
}

export default function AdminReportsPage() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExportDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setExportDropdownOpen(false);
      }
    }
    if (exportDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [exportDropdownOpen]);

  async function loadData() {
    setLoading(true);
    try {
      const [metricsRes, ordersRes, productsRes] = await Promise.all([
        ApiClient.get('/admin/metrics'),
        ApiClient.get('/admin/orders'),
        ApiClient.get('/admin/products?page=1&limit=200'),
      ]);

      if (metricsRes?.success) setMetrics(metricsRes.data);
      if (ordersRes?.success) {
        const orderList = ordersRes.data || [];
        setOrders(Array.isArray(orderList) ? orderList : []);
      }
      if (productsRes?.success) {
        const prodList = productsRes.data?.products || productsRes.data || [];
        setProducts(Array.isArray(prodList) ? prodList : []);
      }
    } catch {
      toast('Failed to load reports data', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  // Build category revenue breakdown from orders + products
  const categoryBreakdown = (() => {
    const catMap: Record<string, { revenue: number; units: number }> = {};
    orders.forEach((order: any) => {
      (order.items || []).forEach((item: any) => {
        const matchProd = products.find((p: any) => p._id === (item.productId?._id || item.productId));
        const cat = matchProd?.category || item.category || 'Other';
        if (!catMap[cat]) catMap[cat] = { revenue: 0, units: 0 };
        catMap[cat].revenue += (item.price || 0) * (item.quantity || 1);
        catMap[cat].units += item.quantity || 1;
      });
    });

    const total = Object.values(catMap).reduce((s, v) => s + v.revenue, 0) || 1;
    return Object.entries(catMap)
      .map(([cat, v]) => ({
        category: cat,
        revenue: v.revenue,
        unitsSold: v.units,
        share: total > 0 ? `${Math.round((v.revenue / total) * 100)}%` : '0%',
        pct: total > 0 ? Math.round((v.revenue / total) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  })();

  // Order status breakdown
  const statusBreakdown = (() => {
    const map: Record<string, number> = {};
    orders.forEach((o: any) => {
      const s = o.status || 'unknown';
      map[s] = (map[s] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  })();

  // Revenue formatted
  const totalRev = metrics?.totalRevenue ?? orders.reduce((s: number, o: any) => s + (o.amount || 0), 0);
  const avgOrderValue = orders.length > 0 ? Math.round(totalRev / orders.length) : 0;

  function downloadBlob(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function getDateSlug() {
    return new Date().toISOString().split('T')[0];
  }

  // --- BACKEND DOWNLOAD API HANDLERS ---
  async function handlePDFDownload() {
    setDownloading('pdf');
    toast('Requesting executive PDF report from server API...', 'info');
    try {
      const ok = await ApiClient.downloadFile(
        '/admin/reports/export?format=pdf',
        `SmartElectronics-Analytics-Report-${getDateSlug()}.pdf`
      );
      if (ok) {
        toast('Executive PDF report downloaded from backend API', 'success');
        return;
      }
      throw new Error('Server download failed');
    } catch {
      // Graceful client fallback
      generatePDFReport();
    } finally {
      setDownloading(null);
    }
  }

  async function handleCategoryCSVDownload() {
    setDownloading('categories-csv');
    toast('Requesting category sales CSV from server API...', 'info');
    try {
      const ok = await ApiClient.downloadFile(
        '/admin/reports/export?format=csv&type=categories',
        `SmartElectronics-Category-Sales-${getDateSlug()}.csv`
      );
      if (ok) {
        toast('Category sales CSV downloaded from backend API', 'success');
        return;
      }
      throw new Error('Server download failed');
    } catch {
      // Graceful client fallback
      exportCategoryCSV();
    } finally {
      setDownloading(null);
    }
  }

  async function handleOrdersCSVDownload() {
    setDownloading('orders-csv');
    toast('Requesting orders ledger CSV from server API...', 'info');
    try {
      const ok = await ApiClient.downloadFile(
        '/admin/reports/export?format=csv&type=orders',
        `SmartElectronics-Orders-Ledger-${getDateSlug()}.csv`
      );
      if (ok) {
        toast('Orders ledger CSV downloaded from backend API', 'success');
        return;
      }
      throw new Error('Server download failed');
    } catch {
      // Graceful client fallback
      exportOrdersCSV();
    } finally {
      setDownloading(null);
    }
  }

  // 1. Export Category Revenue & Unit Breakdown (.csv)
  function exportCategoryCSV() {
    const rows = [
      ['SmartElectronics Management Console - Category Sales & Revenue Report'],
      [`Generated At: ${new Date().toLocaleString('en-IN')}`],
      [`Gross Revenue (INR): ${totalRev}`],
      [`Total Orders Recorded: ${metrics?.totalOrders ?? orders.length}`],
      [`Average Order Value (INR): ${avgOrderValue}`],
      [`Catalog Active Products: ${metrics?.totalProducts ?? products.length}`],
      [],
      ['Department / Category', 'Revenue (INR)', 'Units Sold', 'Market Share (%)'],
      ...categoryBreakdown.map((r) => [
        `"${r.category.replace(/"/g, '""')}"`,
        r.revenue,
        r.unitsSold,
        r.share,
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    downloadBlob(csv, `SmartElectronics-Category-Sales-${getDateSlug()}.csv`, 'text/csv');
    toast('Category sales report exported as CSV', 'success');
  }

  // 2. Export Detailed Customer Orders Ledger (.csv)
  function exportOrdersCSV() {
    const rows = [
      ['SmartElectronics Management Console - Customer Orders Ledger'],
      [`Generated At: ${new Date().toLocaleString('en-IN')}`],
      [`Total Orders Recorded: ${orders.length}`],
      [],
      [
        'Order ID',
        'Customer Name',
        'Customer Email',
        'Items Count',
        'Total Amount (INR)',
        'Order Status',
        'Payment Status',
        'Payment Method',
        'Order Date',
      ],
      ...orders.map((o) => [
        `"${o._id || o.id || ''}"`,
        `"${(o.customerName || o.shippingAddress?.fullName || 'Customer').replace(/"/g, '""')}"`,
        `"${(o.customerEmail || o.user?.email || '').replace(/"/g, '""')}"`,
        (o.items || []).reduce((acc: number, it: any) => acc + (it.quantity || 1), 0),
        o.amount || o.total || 0,
        `"${o.status || 'placed'}"`,
        `"${o.paymentStatus || 'pending'}"`,
        `"${o.paymentMethod || 'COD'}"`,
        `"${o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN') : ''}"`,
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    downloadBlob(csv, `SmartElectronics-Orders-Ledger-${getDateSlug()}.csv`, 'text/csv');
    toast('Orders ledger exported as CSV', 'success');
  }

  // 3. Export / Print Executive Visual PDF Report (.pdf)
  function generatePDFReport() {
    const formattedDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const categoryRowsHtml = categoryBreakdown.map((c) => `
      <tr>
        <td style="padding: 9px 12px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${c.category}</td>
        <td style="padding: 9px 12px; font-weight: 700; text-align: right; border-bottom: 1px solid #e2e8f0;">₹${c.revenue.toLocaleString('en-IN')}</td>
        <td style="padding: 9px 12px; text-align: center; border-bottom: 1px solid #e2e8f0;">${c.unitsSold}</td>
        <td style="padding: 9px 12px; text-align: right; font-weight: 700; color: #4f46e5; border-bottom: 1px solid #e2e8f0;">${c.share}</td>
      </tr>
    `).join('');

    const statusRowsHtml = statusBreakdown.map(([status, count]) => {
      const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
      return `
        <tr>
          <td style="padding: 8px 12px; text-transform: uppercase; font-size: 10.5px; font-weight: 700; border-bottom: 1px solid #e2e8f0;">${status}</td>
          <td style="padding: 8px 12px; text-align: right; font-weight: 700; border-bottom: 1px solid #e2e8f0;">${count}</td>
          <td style="padding: 8px 12px; text-align: right; color: #64748b; border-bottom: 1px solid #e2e8f0;">${pct}%</td>
        </tr>
      `;
    }).join('');

    const recentOrders = orders.slice(0, 10);
    const recentOrdersHtml = recentOrders.map((o) => `
      <tr>
        <td style="padding: 8px 12px; font-family: monospace; font-size: 11px; border-bottom: 1px solid #e2e8f0;">${String(o._id || o.id).slice(-8).toUpperCase()}</td>
        <td style="padding: 8px 12px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">${o.customerName || o.shippingAddress?.fullName || 'Customer'}</td>
        <td style="padding: 8px 12px; text-align: center; border-bottom: 1px solid #e2e8f0;">${(o.items || []).length}</td>
        <td style="padding: 8px 12px; text-align: right; font-weight: 700; border-bottom: 1px solid #e2e8f0;">₹${Number(o.amount || o.total || 0).toLocaleString('en-IN')}</td>
        <td style="padding: 8px 12px; text-transform: uppercase; font-size: 10px; font-weight: 700; border-bottom: 1px solid #e2e8f0;">${o.status || 'placed'}</td>
        <td style="padding: 8px 12px; font-size: 11px; color: #64748b; border-bottom: 1px solid #e2e8f0;">${o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : 'Recent'}</td>
      </tr>
    `).join('');

    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>SmartElectronics Sales & Analytics Report - ${getDateSlug()}</title>
        <style>
          @page { size: A4; margin: 12mm; }
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 24px;
            font-size: 12px;
            line-height: 1.5;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .brand-title {
            font-size: 22px;
            font-weight: 900;
            color: #1e3a8a;
            letter-spacing: -0.5px;
          }
          .brand-subtitle {
            font-size: 12px;
            color: #64748b;
            font-weight: 500;
            margin-top: 2px;
          }
          .badge {
            display: inline-block;
            background: #eff6ff;
            color: #2563eb;
            border: 1px solid #bfdbfe;
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            margin-top: 5px;
          }
          .meta-box {
            text-align: right;
            font-size: 11px;
            color: #64748b;
          }
          .kpis {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 24px;
          }
          .kpi-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 12px 14px;
          }
          .kpi-title {
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 700;
            margin-bottom: 4px;
          }
          .kpi-value {
            font-size: 18px;
            font-weight: 900;
            color: #0f172a;
          }
          .kpi-sub {
            font-size: 10px;
            color: #94a3b8;
            margin-top: 2px;
          }
          .section-title {
            font-size: 13px;
            font-weight: 800;
            color: #1e293b;
            margin-top: 20px;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-left: 4px solid #2563eb;
            padding-left: 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 11px;
          }
          th {
            background: #f1f5f9;
            color: #475569;
            font-weight: 700;
            text-align: left;
            padding: 8px 12px;
            border-bottom: 1px solid #cbd5e1;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 16px;
          }
          .footer {
            border-top: 1px solid #e2e8f0;
            padding-top: 12px;
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #94a3b8;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand-title">SmartElectronics ⚡ Admin</div>
            <div class="brand-subtitle">Executive Sales, Revenue &amp; Department Performance Audit</div>
            <span class="badge">Official Business Report</span>
          </div>
          <div class="meta-box">
            <div><strong>Generated:</strong> ${formattedDate}</div>
            <div><strong>Environment:</strong> Production Management Console</div>
            <div><strong>Currency:</strong> Indian Rupee (INR ₹)</div>
          </div>
        </div>

        <div class="kpis">
          <div class="kpi-card">
            <div class="kpi-title">Gross Revenue</div>
            <div class="kpi-value" style="color: #059669;">₹${totalRev.toLocaleString('en-IN')}</div>
            <div class="kpi-sub">From completed sales</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Total Orders</div>
            <div class="kpi-value">${metrics?.totalOrders ?? orders.length}</div>
            <div class="kpi-sub">All-time customer purchases</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Avg. Order Value</div>
            <div class="kpi-value">₹${avgOrderValue.toLocaleString('en-IN')}</div>
            <div class="kpi-sub">Per completed transaction</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Active Products</div>
            <div class="kpi-value">${metrics?.totalProducts ?? products.length}</div>
            <div class="kpi-sub">Live catalog SKUs</div>
          </div>
        </div>

        <div class="grid-2">
          <div>
            <div class="section-title">Department Revenue Breakdown</div>
            <table>
              <thead>
                <tr>
                  <th>Department</th>
                  <th style="text-align: right;">Revenue (₹)</th>
                  <th style="text-align: center;">Units</th>
                  <th style="text-align: right;">Share</th>
                </tr>
              </thead>
              <tbody>
                ${categoryRowsHtml || '<tr><td colspan="4" style="text-align: center; padding: 12px; color: #94a3b8;">No revenue records found</td></tr>'}
              </tbody>
            </table>
          </div>

          <div>
            <div class="section-title">Order Status Split</div>
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th style="text-align: right;">Orders</th>
                  <th style="text-align: right;">Share</th>
                </tr>
              </thead>
              <tbody>
                ${statusRowsHtml || '<tr><td colspan="3" style="text-align: center; padding: 12px; color: #94a3b8;">No orders found</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

        ${recentOrders.length > 0 ? `
          <div class="section-title">Recent Order Transactions</div>
          <table>
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Customer</th>
                <th style="text-align: center;">Items</th>
                <th style="text-align: right;">Amount (₹)</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${recentOrdersHtml}
            </tbody>
          </table>
        ` : ''}

        <div class="footer">
          <div>SmartElectronics Retail Ltd. • Confidential Financial Audit</div>
          <div>Page 1 of 1 • System Generated</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    // Create an invisible iframe for seamless print-to-PDF
    const printIframe = document.createElement('iframe');
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = '0';
    document.body.appendChild(printIframe);

    const iframeDoc = printIframe.contentDocument || printIframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(printHtml);
      iframeDoc.close();

      setTimeout(() => {
        try {
          printIframe.contentWindow?.focus();
          printIframe.contentWindow?.print();
        } catch {
          const win = window.open('', '_blank');
          if (win) {
            win.document.write(printHtml);
            win.document.close();
          }
        }
        setTimeout(() => {
          if (document.body.contains(printIframe)) {
            document.body.removeChild(printIframe);
          }
        }, 60000);
      }, 400);

      toast('Opening PDF print preview. Select "Save as PDF" to save file.', 'success');
    }
  }

  const statusColor: Record<string, BadgeVariant> = {
    delivered: 'success',
    paid: 'success',
    shipped: 'indigo',
    processing: 'indigo',
    pending: 'warning',
    cancelled: 'danger',
    failed: 'danger',
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Sales & Analytics Reports"
          subtitle="Live financial breakdown, departmental performance, and electronics order metrics"
        />

        <main className="p-4 sm:p-6 space-y-6 flex-1 max-w-7xl w-full">

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Live data — updated in real time from store orders</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer"
                title="Refresh live metrics from database"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                Refresh
              </button>

              {/* Export Dropdown Menu with PDF and CSV Options */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setExportDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition shadow-sm shadow-blue-500/25 active:scale-[0.98] cursor-pointer"
                  aria-expanded={exportDropdownOpen}
                  aria-haspopup="true"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Report</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${exportDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {exportDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Export &amp; Download</p>
                      <p className="text-xs text-slate-600 font-semibold mt-0.5">Select your preferred export format</p>
                    </div>

                    <div className="py-1 space-y-1">
                      {/* Option 1: PDF Download via Backend API */}
                      <button
                        type="button"
                        disabled={downloading !== null}
                        onClick={() => {
                          setExportDropdownOpen(false);
                          handlePDFDownload();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-rose-50/80 transition group cursor-pointer disabled:opacity-50"
                      >
                        <div className="h-8 w-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-800 group-hover:text-rose-600">
                              {downloading === 'pdf' ? 'Generating PDF...' : 'Export as PDF'}
                            </p>
                            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">.PDF</span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">Executive visual summary via Server API</p>
                        </div>
                      </button>

                      {/* Option 2: Category Breakdown CSV via Backend API */}
                      <button
                        type="button"
                        disabled={downloading !== null}
                        onClick={() => {
                          setExportDropdownOpen(false);
                          handleCategoryCSVDownload();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-emerald-50/80 transition group cursor-pointer disabled:opacity-50"
                      >
                        <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                          <FileSpreadsheet className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-600">
                              {downloading === 'categories-csv' ? 'Exporting CSV...' : 'Category Sales CSV'}
                            </p>
                            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">.CSV</span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">Department revenue &amp; units via Server API</p>
                        </div>
                      </button>

                      {/* Option 3: Orders Ledger CSV via Backend API */}
                      <button
                        type="button"
                        disabled={downloading !== null}
                        onClick={() => {
                          setExportDropdownOpen(false);
                          handleOrdersCSVDownload();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-blue-50/80 transition group cursor-pointer disabled:opacity-50"
                      >
                        <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                          <Download className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600">
                              {downloading === 'orders-csv' ? 'Exporting CSV...' : 'Orders Ledger CSV'}
                            </p>
                            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">.CSV</span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">All customer purchase records via Server API</p>
                        </div>
                      </button>

                      {/* Option 4: Direct Browser Print */}
                      <button
                        type="button"
                        onClick={() => {
                          setExportDropdownOpen(false);
                          window.print();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-slate-100 transition group border-t border-slate-100 mt-1 pt-2 cursor-pointer"
                      >
                        <div className="h-7 w-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                          <Printer className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700">Print Dashboard</p>
                          <p className="text-[10px] text-slate-400">Direct page print via browser</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <Loader size="lg" label="Loading live analytics..." sublabel="Crunching revenue data from SmartElectronics orders" />
          ) : (
            <>
              {/* KPI Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <StatCard
                  title="Gross Revenue"
                  value={`₹${(totalRev).toLocaleString('en-IN')}`}
                  icon={<IndianRupee className="w-5 h-5" />}
                  accentColor="emerald"
                  subtitle="From completed sales"
                />
                <StatCard
                  title="Total Orders"
                  value={metrics?.totalOrders ?? orders.length}
                  icon={<ShoppingBag className="w-5 h-5" />}
                  accentColor="indigo"
                  subtitle="All-time customer purchases"
                />
                <StatCard
                  title="Avg. Order Value"
                  value={`₹${avgOrderValue.toLocaleString('en-IN')}`}
                  icon={<TrendingUp className="w-5 h-5" />}
                  accentColor="violet"
                  subtitle="Per transaction"
                />
                <StatCard
                  title="Active Products"
                  value={metrics?.totalProducts ?? products.length}
                  icon={<Package className="w-5 h-5" />}
                  accentColor="amber"
                  subtitle="Live in catalog"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Category Breakdown Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Category Revenue Breakdown</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Revenue by electronics department</p>
                    </div>
                  </div>

                  {categoryBreakdown.length === 0 ? (
                    <div className="p-10 text-center text-sm text-slate-400">
                      No order revenue data yet. Place some orders to see analytics.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Department</TableHead>
                          <TableHead>Revenue</TableHead>
                          <TableHead>Units</TableHead>
                          <TableHead>Share</TableHead>
                          <TableHead>Bar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoryBreakdown.map((row) => (
                          <TableRow key={row.category}>
                            <TableCell>
                              <span className="font-semibold text-slate-800 text-xs">{row.category}</span>
                            </TableCell>
                            <TableCell>
                              <span className="font-black text-slate-900 text-sm">
                                ₹{row.revenue.toLocaleString('en-IN')}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-slate-700">{row.unitsSold}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="indigo" size="sm">{row.share}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700"
                                  style={{ width: `${row.pct}%` }}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>

                {/* Order Status + Top Stats */}
                <div className="space-y-5">
                  {/* Order Status Card */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Order Status Split</h3>
                    {statusBreakdown.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No orders yet</p>
                    ) : (
                      <div className="space-y-3">
                        {statusBreakdown.map(([status, count]) => {
                          const pct = Math.round((count / orders.length) * 100);
                          return (
                            <div key={status}>
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1.5">
                                  <Badge
                                    variant={(statusColor[status.toLowerCase()]) || 'neutral'}
                                    size="sm"
                                    dot
                                  >
                                    {status}
                                  </Badge>
                                </div>
                                <span className="text-xs font-black text-slate-800">{count} <span className="text-slate-400 font-medium">({pct}%)</span></span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ${
                                    status === 'delivered' || status === 'paid'
                                      ? 'bg-emerald-500'
                                      : status === 'cancelled' || status === 'failed'
                                      ? 'bg-rose-500'
                                      : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Quick KPIs */}
                  <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-800 rounded-2xl p-5 text-white space-y-3 shadow-lg shadow-blue-500/20">
                    <h3 className="text-xs font-black uppercase tracking-wider text-blue-200">Store KPIs</h3>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-200 font-semibold">Total Customers</span>
                        <span className="text-sm font-black">{metrics?.totalUsers ?? '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-200 font-semibold">Catalog Products</span>
                        <span className="text-sm font-black">{metrics?.totalProducts ?? products.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-200 font-semibold">Fulfillment Rate</span>
                        <span className="text-sm font-black text-emerald-300">
                          {orders.length > 0
                            ? `${Math.round(
                                (orders.filter((o: any) => ['delivered', 'paid', 'shipped'].includes(o.status)).length /
                                  orders.length) * 100
                              )}%`
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-200 font-semibold">Cancellation Rate</span>
                        <span className="text-sm font-black text-rose-300">
                          {orders.length > 0
                            ? `${Math.round(
                                (orders.filter((o: any) => ['cancelled', 'failed'].includes(o.status)).length /
                                  orders.length) * 100
                              )}%`
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
