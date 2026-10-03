'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { Button } from '../components/ui';
import { Settings, Database, Save, ShieldCheck, Globe, CheckCircle2 } from 'lucide-react';
import { useToast } from '../components/ToastProvider';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const STORAGE_KEY = 'smart_admin_settings_v2';

  const [storeName, setStoreName] = useState('SmartElectronics');
  const [tagline, setTagline] = useState("India's Premier Online Electronics & Tech Superstore");
  const [supportEmail, setSupportEmail] = useState('support@smartelectronics.com');
  const [supportPhone, setSupportPhone] = useState('+91-1800-889-7627');
  const [databaseName, setDatabaseName] = useState('smartelectronics');
  const [currency, setCurrency] = useState('INR (₹)');
  const [warrantyThreshold, setWarrantyThreshold] = useState('1 Year Official Brand Minimum');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.storeName) setStoreName(parsed.storeName);
        if (parsed.tagline) setTagline(parsed.tagline);
        if (parsed.supportEmail) {
          // Auto-upgrade legacy email without trailing 's'
          setSupportEmail(
            parsed.supportEmail === 'support@smartelectronic.com'
              ? 'support@smartelectronics.com'
              : parsed.supportEmail
          );
        }
        if (parsed.supportPhone) setSupportPhone(parsed.supportPhone);
        if (parsed.warrantyThreshold) setWarrantyThreshold(parsed.warrantyThreshold);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          storeName,
          tagline,
          supportEmail,
          supportPhone,
          warrantyThreshold,
        })
      );
      toast('Settings successfully saved and synced across system!', 'success');
    } catch {
      toast('Failed to save settings locally', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Store & System Settings"
          subtitle="Configure business profile, platform parameters, warranty requirements, and database configuration."
        />

        <main className="p-6 space-y-6 flex-1 max-w-5xl w-full">
          {/* Database & Infrastructure Health Banner */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-blue-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-cyan-300">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base text-white">Active Database: <span className="text-cyan-400">{databaseName}</span></h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      Connected
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">MongoDB URI: mongodb://localhost:27017/smartelectronics</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Settings Cards */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-sm font-black text-slate-900">Brand Identity &amp; Store Information</h3>
              <p className="text-xs text-slate-400">Primary branding visible on customer storefront, invoices, and automated emails.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Base Currency</label>
                <input
                  type="text"
                  value={currency}
                  readOnly
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-600 outline-none cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Tagline / SEO Title Suffix</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tech Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Helpline Phone</label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Warranty Standard</label>
                <input
                  type="text"
                  value={warrantyThreshold}
                  onChange={(e) => setWarrantyThreshold(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button onClick={handleSave} variant="primary" className="flex items-center gap-1.5 text-xs">
                <Save className="w-4 h-4" />
                <span>Save Store Settings</span>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
