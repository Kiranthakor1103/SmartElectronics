'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { ApiClient } from '../lib/apiClient';
import { useToast } from '../components/ToastProvider';
import {
  Bell,
  Plus,
  Zap,
  Package,
  Ticket,
  Boxes,
  ShieldCheck,
  Send,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Smartphone,
  Mail,
  Radio,
  Layers,
  X,
  Copy,
  Clock,
  ChevronRight,
} from 'lucide-react';

export interface NotificationTemplateItem {
  _id?: string;
  name: string;
  code: string;
  category: 'marketing' | 'orders' | 'inventory' | 'security' | 'system';
  channel: 'in_app' | 'email' | 'push' | 'sms';
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  badge?: string;
  themeColor: 'blue' | 'cyan' | 'indigo' | 'emerald' | 'amber' | 'rose';
  icon: string;
  active: boolean;
  isDefault: boolean;
  sentCount: number;
  lastSentAt?: string;
  createdAt?: string;
}

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; glow: string; badgeBg: string }> = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    glow: 'from-blue-600 to-indigo-600',
    badgeBg: 'bg-blue-500/15 text-blue-700 border-blue-200',
  },
  cyan: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-600',
    border: 'border-cyan-200',
    glow: 'from-cyan-500 to-blue-600',
    badgeBg: 'bg-cyan-500/15 text-cyan-700 border-cyan-200',
  },
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    border: 'border-indigo-200',
    glow: 'from-indigo-600 to-purple-600',
    badgeBg: 'bg-indigo-500/15 text-indigo-700 border-indigo-200',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    glow: 'from-emerald-500 to-teal-600',
    badgeBg: 'bg-emerald-500/15 text-emerald-700 border-emerald-200',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-200',
    glow: 'from-amber-500 to-orange-600',
    badgeBg: 'bg-amber-500/15 text-amber-700 border-amber-200',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    border: 'border-rose-200',
    glow: 'from-rose-500 to-red-600',
    badgeBg: 'bg-rose-500/15 text-rose-700 border-rose-200',
  },
};

export default function NotificationTemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<NotificationTemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeChannel, setActiveChannel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'in_app' | 'toast' | 'email'>('in_app');

  // Form State
  const [formData, setFormData] = useState<NotificationTemplateItem>({
    name: '',
    code: '',
    category: 'marketing',
    channel: 'in_app',
    title: '',
    message: '',
    actionLabel: 'View Details',
    actionUrl: '/products',
    badge: 'TECH DROP',
    themeColor: 'cyan',
    icon: 'Zap',
    active: true,
    isDefault: false,
    sentCount: 0,
  });

  // Fetch Templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get<{ count: number; data: NotificationTemplateItem[] }>(
        '/notifications/templates'
      );
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
        setTemplates(list);
      }
    } catch {
      toast('Failed to load notification templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Filtered list
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchCat = activeCategory === 'all' || t.category === activeCategory;
      const matchChan = activeChannel === 'all' || t.channel === activeChannel;
      const matchSearch =
        !searchQuery.trim() ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchChan && matchSearch;
    });
  }, [templates, activeCategory, activeChannel, searchQuery]);

  // Open Modal for Create
  const handleOpenCreate = () => {
    setEditingTemplateId(null);
    setFormData({
      name: '',
      code: '',
      category: 'marketing',
      channel: 'in_app',
      title: '',
      message: '',
      actionLabel: 'Explore Tech Drop',
      actionUrl: '/products?deal=flash',
      badge: 'HOT DROP',
      themeColor: 'cyan',
      icon: 'Zap',
      active: true,
      isDefault: false,
      sentCount: 0,
    });
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (t: NotificationTemplateItem) => {
    setEditingTemplateId(t._id || null);
    setFormData({ ...t });
    setIsModalOpen(true);
  };

  // Submit Template (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.title.trim() || !formData.message.trim()) {
      toast('Please fill in Template Name, Title, and Message.', 'error');
      return;
    }

    try {
      if (editingTemplateId) {
        const res = await ApiClient.put(`/notifications/templates/${editingTemplateId}`, formData);
        if (res.success) {
          toast('Notification template updated successfully!', 'success');
          setIsModalOpen(false);
          fetchTemplates();
        } else {
          toast(res.message || 'Failed to update template', 'error');
        }
      } else {
        const res = await ApiClient.post('/notifications/templates', formData);
        if (res.success) {
          toast('New notification template created successfully!', 'success');
          setIsModalOpen(false);
          fetchTemplates();
        } else {
          toast(res.message || 'Failed to create template', 'error');
        }
      }
    } catch {
      toast('Network error saving template', 'error');
    }
  };

  // Delete Template
  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this notification template?')) return;

    try {
      const res = await ApiClient.delete(`/notifications/templates/${id}`);
      if (res.success) {
        toast('Template deleted successfully', 'success');
        fetchTemplates();
      } else {
        toast(res.message || 'Could not delete template', 'error');
      }
    } catch {
      toast('Error deleting template', 'error');
    }
  };

  // Quick Broadcast
  const handleBroadcast = async (template: NotificationTemplateItem) => {
    try {
      const res = await ApiClient.post('/notifications/broadcast', {
        templateId: template._id,
        targetRole: template.category === 'orders' || template.category === 'inventory' ? 'admin' : 'customer',
        channel: template.channel || 'in_app',
      });
      if (res.success) {
        toast(`⚡ Broadcast dispatched live via ${(template.channel || 'in_app').toUpperCase()} for "${template.name}"!`, 'success');
        fetchTemplates();
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          try {
            const bc = new BroadcastChannel('smart_electronics_notifications');
            bc.postMessage({ type: 'NOTIFICATION_BROADCAST', templateId: template._id, channel: template.channel });
            bc.close();
          } catch {}
        }
      } else {
        toast(res.message || 'Broadcast failed', 'error');
      }
    } catch {
      toast('Error sending broadcast', 'error');
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Package':
        return <Package className="w-4 h-4" />;
      case 'Ticket':
        return <Ticket className="w-4 h-4" />;
      case 'Boxes':
        return <Boxes className="w-4 h-4" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4" />;
      case 'AlertCircle':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Notification Templates Studio"
          subtitle="Create, customize, and broadcast high-impact notifications matched to SmartElectronics theme."
        />

        <main className="p-6 space-y-6 flex-1 max-w-7xl w-full">
          {/* Top Banner with SmartElectronics Theme Glow */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 md:p-8 text-white shadow-xl border border-slate-800">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-cyan-500/20 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-cyan-300 text-xs font-black uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Interactive Notification Engine</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
                  Multi-Channel Notification Templates
                </h2>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
                  Design branded tech drop alerts, VIP voucher announcements, tracking updates, and critical stock
                  notifications. Preview templates in real-time across In-App, Toast, and VIP Email formats.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleOpenCreate}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-black shadow-lg shadow-blue-500/30 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Notification Template</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Templates</p>
                <p className="text-xl font-black text-white mt-0.5">{templates.length}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Broadcasts</p>
                <p className="text-xl font-black text-cyan-400 mt-0.5">
                  {templates.filter((t) => t.active).length}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Dispatches</p>
                <p className="text-xl font-black text-emerald-400 mt-0.5">
                  {templates.reduce((acc, t) => acc + (t.sentCount || 0), 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Theme Channels</p>
                <p className="text-xl font-black text-purple-400 mt-0.5">In-App • Email • SMS</p>
              </div>
            </div>
          </div>

          {/* Search and Category/Channel Filter Strip */}
          <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'All Categories' },
                  { id: 'marketing', label: 'Marketing & Drops ⚡' },
                  { id: 'orders', label: 'Orders & Logistics 📦' },
                  { id: 'inventory', label: 'Restock & Inventory ⚠️' },
                  { id: 'security', label: 'Security & Shield 🛡️' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      activeCategory === tab.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white font-semibold"
                />
              </div>
            </div>

            {/* Delivery Channel Filters */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 mr-1">Channel:</span>
              {[
                { id: 'all', label: 'All Channels' },
                { id: 'in_app', label: '🔔 In-App Bell' },
                { id: 'email', label: '✉️ Email Blast' },
                { id: 'push', label: '🌐 Web Push' },
                { id: 'sms', label: '💬 SMS Alert' },
              ].map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition cursor-pointer ${
                    activeChannel === ch.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  {ch.label}
                </button>
              ))}
            </div>
          </div>

          {/* Template Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-3xl bg-white border border-slate-200/80 animate-pulse p-6" />
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Bell className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-slate-900">No Notification Templates Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                Create a new template to broadcast exclusive tech drops, flash discounts, or order updates to your users.
              </p>
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create Template</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => {
                const colorTheme = COLOR_MAP[template.themeColor] || COLOR_MAP.blue;

                return (
                  <div
                    key={template._id || template.code}
                    className="group bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    {/* Header */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorTheme.bg} ${colorTheme.text} border ${colorTheme.border}`}
                          >
                            {getIcon(template.icon)}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition">
                              {template.name}
                            </h4>
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                              {template.code}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {template.channel === 'email' ? '✉️ EMAIL' : template.channel === 'push' ? '🌐 PUSH' : template.channel === 'sms' ? '💬 SMS' : '🔔 IN-APP'}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${colorTheme.badgeBg}`}
                          >
                            {template.badge || template.category}
                          </span>
                        </div>
                      </div>

                      {/* Notification Message Preview */}
                      <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1.5">
                        <p className="text-xs font-black text-slate-900 leading-snug line-clamp-2">
                          {template.title}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed font-medium">
                          {template.message}
                        </p>
                      </div>

                      {/* Action & Stats Strip */}
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                          <span>Sent: {template.sentCount.toLocaleString()} times</span>
                        </div>
                        <span className="text-xs font-extrabold text-blue-600 flex items-center gap-1">
                          {template.actionLabel}
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>

                    {/* Bottom Actions Bar */}
                    <div className="px-6 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleBroadcast(template)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black shadow-2xs hover:from-blue-700 hover:to-indigo-700 transition cursor-pointer"
                        title="Broadcast notification to users"
                      >
                        <Send className="w-3 h-3" />
                        <span>Dispatch Broadcast</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(template)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white transition cursor-pointer border border-transparent hover:border-slate-200"
                          title="Edit Template"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {!template.isDefault && (
                          <button
                            onClick={() => handleDelete(template._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete Template"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ── CREATE / EDIT TEMPLATE MODAL WITH LIVE THEME-MATCHED PREVIEW ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {editingTemplateId ? 'Edit Notification Template' : 'Create Notification Template'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Configure copy, theme styling, target channels, and preview live across devices.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Two-Column Form & Live Preview */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (7 Cols): Form Controls */}
              <form id="template-form" onSubmit={handleSubmit} className="lg:col-span-7 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Template Name */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      Template Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. RTX 4090 Flash Drop"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-600"
                      required
                    />
                  </div>

                  {/* Template Code */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      Identifier Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. RTX_4090_DROP"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono font-bold text-slate-900 uppercase outline-none focus:bg-white focus:border-blue-600"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Category */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 outline-none cursor-pointer"
                    >
                      <option value="marketing">Marketing ⚡</option>
                      <option value="orders">Orders 📦</option>
                      <option value="inventory">Inventory ⚠️</option>
                      <option value="security">Security 🛡️</option>
                      <option value="system">System ⚙️</option>
                    </select>
                  </div>

                  {/* Channel */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Channel</label>
                    <select
                      value={formData.channel}
                      onChange={(e) => setFormData({ ...formData, channel: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 outline-none cursor-pointer"
                    >
                      <option value="in_app">In-App Bell Alert</option>
                      <option value="email">VIP Email Dispatch</option>
                      <option value="push">Mobile Push Notification</option>
                      <option value="sms">SMS Text Alert</option>
                    </select>
                  </div>

                  {/* Theme Color */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Theme Accent</label>
                    <select
                      value={formData.themeColor}
                      onChange={(e) => setFormData({ ...formData, themeColor: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 outline-none cursor-pointer capitalize"
                    >
                      <option value="cyan">Cyber Cyan</option>
                      <option value="blue">Electric Blue</option>
                      <option value="indigo">Deep Indigo</option>
                      <option value="emerald">Emerald Success</option>
                      <option value="amber">Amber Alert</option>
                      <option value="rose">Rose Coral</option>
                    </select>
                  </div>
                </div>

                {/* Badge & Icon */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Badge Tag</label>
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value.toUpperCase() })}
                      placeholder="e.g. FLASH DROP / VIP ONLY"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold uppercase text-slate-900 outline-none focus:bg-white focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Icon Symbol</label>
                    <select
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 outline-none cursor-pointer"
                    >
                      <option value="Zap">⚡ Zap (Electric / Drop)</option>
                      <option value="Package">📦 Package (Delivery / Order)</option>
                      <option value="Ticket">🏷️ Ticket (Promo / Voucher)</option>
                      <option value="Boxes">📦 Boxes (Stock / Restock)</option>
                      <option value="ShieldCheck">🛡️ ShieldCheck (Security)</option>
                      <option value="AlertCircle">⚠️ AlertCircle (Important)</option>
                    </select>
                  </div>
                </div>

                {/* Notification Title */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Notification Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. ⚡ VIP Tech Drop: Sony Bravia OLED 65-inch Now Live!"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-600"
                    required
                  />
                </div>

                {/* Notification Message */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Message Body <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Write the notification message. Use placeholders like {customer_name}, {discount_code} if needed."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium outline-none focus:bg-white focus:border-blue-600 leading-relaxed resize-none"
                    required
                  />
                </div>

                {/* Action CTA Button & Link */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Action Button Text</label>
                    <input
                      type="text"
                      value={formData.actionLabel}
                      onChange={(e) => setFormData({ ...formData, actionLabel: e.target.value })}
                      placeholder="e.g. Claim 25% Off / Track Order"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Action Target URL</label>
                    <input
                      type="text"
                      value={formData.actionUrl}
                      onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                      placeholder="e.g. /products?deal=flash"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-mono text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-600"
                    />
                  </div>
                </div>
              </form>

              {/* Right Column (5 Cols): Live Theme-Matched Interactive Preview */}
              <div className="lg:col-span-5 bg-slate-900 text-slate-100 rounded-3xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                      <Eye className="w-4 h-4" />
                      <span>Live Theme Preview</span>
                    </div>

                    <div className="flex rounded-lg bg-slate-800 p-0.5 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setPreviewTab('in_app')}
                        className={`px-2 py-1 rounded-md transition ${
                          previewTab === 'in_app' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        In-App Bell
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewTab('toast')}
                        className={`px-2 py-1 rounded-md transition ${
                          previewTab === 'toast' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Toast Banner
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewTab('email')}
                        className={`px-2 py-1 rounded-md transition ${
                          previewTab === 'email' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        VIP Email
                      </button>
                    </div>
                  </div>

                  {/* PREVIEW 1: IN-APP BELL DROPDOWN CARD */}
                  {previewTab === 'in_app' && (
                    <div className="space-y-3">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Header Dropdown Preview (Matches SmartElectronics Theme)
                      </p>

                      <div className="bg-white rounded-2xl p-4 text-slate-900 border border-slate-200 shadow-xl space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                COLOR_MAP[formData.themeColor]?.bg || 'bg-blue-50'
                              } ${COLOR_MAP[formData.themeColor]?.text || 'text-blue-600'}`}
                            >
                              {getIcon(formData.icon)}
                            </div>
                            <div>
                              <span
                                className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                                  COLOR_MAP[formData.themeColor]?.badgeBg || 'bg-blue-50 text-blue-700'
                                }`}
                              >
                                {formData.badge || 'ALERT'}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold">Just now</span>
                        </div>

                        <p className="text-xs font-black text-slate-900 leading-snug">
                          {formData.title || 'Notification Title Preview'}
                        </p>

                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                          {formData.message || 'Notification body text will appear here with live preview.'}
                        </p>

                        {formData.actionLabel && (
                          <div className="pt-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-blue-600 hover:text-blue-700 cursor-pointer">
                              <span>{formData.actionLabel}</span>
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* PREVIEW 2: STOREFRONT TOAST BANNER */}
                  {previewTab === 'toast' && (
                    <div className="space-y-3">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Storefront Toast Alert (Bottom Corner)
                      </p>

                      <div className="rounded-2xl p-4 bg-slate-950 border border-blue-500/40 shadow-2xl space-y-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-cyan-500/20 blur-xl pointer-events-none" />

                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center">
                            {getIcon(formData.icon)}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
                            SmartElectronics Alert ⚡
                          </span>
                        </div>

                        <p className="text-xs font-black text-white leading-snug">
                          {formData.title || 'Notification Title Preview'}
                        </p>
                        <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                          {formData.message || 'Notification body text here.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* PREVIEW 3: VIP EMAIL PREVIEW */}
                  {previewTab === 'email' && (
                    <div className="space-y-3">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        VIP Email Dispatch (Desktop &amp; Mobile Clients)
                      </p>

                      <div className="bg-white rounded-2xl overflow-hidden text-slate-900 border border-slate-200 shadow-xl">
                        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-4 text-center">
                          <span className="text-xs font-black tracking-tight text-white flex items-center justify-center gap-1">
                            Smart<span className="text-cyan-400">Electronics</span> ⚡
                          </span>
                          <p className="text-[10px] text-cyan-200 font-extrabold uppercase mt-0.5 tracking-wider">
                            {formData.badge || 'TECH DROP DISPATCH'}
                          </p>
                        </div>
                        <div className="p-4 space-y-2">
                          <h4 className="text-xs font-black text-slate-900">
                            {formData.title || 'VIP Email Headline Preview'}
                          </h4>
                          <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                            {formData.message || 'Email announcement body copy.'}
                          </p>
                          <div className="pt-2 text-center">
                            <span className="inline-block px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black shadow-md shadow-blue-500/25">
                              {formData.actionLabel || 'Shop Now'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400 font-medium flex items-center justify-between">
                  <span>Channel: {formData.channel.toUpperCase()}</span>
                  <span>Theme: {formData.themeColor.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  form="template-form"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-md shadow-blue-500/20 transition cursor-pointer"
                >
                  {editingTemplateId ? 'Save Changes' : 'Create & Save Template'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
