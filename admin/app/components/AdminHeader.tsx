'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ShieldCheck, ExternalLink, ChevronRight, Sparkles, Home, Bell, Zap, CheckCheck, Clock } from 'lucide-react';
import { useSidebar } from './SidebarContext';
import { ApiClient } from '../lib/apiClient';

interface SectionMeta {
  title: string;
  defaultHref: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
}

const sectionConfigMap: Record<string, SectionMeta> = {
  'Analytics & Main': { title: 'Analytics & Main', defaultHref: '/dashboard' },
  'Catalog & Hardware': { title: 'Catalog & Hardware', defaultHref: '/products' },
  'Sales & Logistics': { title: 'Sales & Logistics', defaultHref: '/orders' },
  'Marketing & Promos': { title: 'Marketing & Promos', defaultHref: '/promocodes' },
  'System & Security': { title: 'System & Security', defaultHref: '/settings' },
};

const routeSectionMap: Record<string, string> = {
  '/dashboard': 'Analytics & Main',
  '/reports': 'Analytics & Main',
  '/products': 'Catalog & Hardware',
  '/categories': 'Catalog & Hardware',
  '/sub-categories': 'Catalog & Hardware',
  '/brands': 'Catalog & Hardware',
  '/variants': 'Catalog & Hardware',
  '/inventory': 'Catalog & Hardware',
  '/orders': 'Sales & Logistics',
  '/returns': 'Sales & Logistics',
  '/users': 'Sales & Logistics',
  '/sellers': 'Sales & Logistics',
  '/promocodes': 'Marketing & Promos',
  '/offers': 'Marketing & Promos',
  '/banners': 'Marketing & Promos',
  '/reviews': 'Marketing & Promos',
  '/notifications': 'Marketing & Promos',
  '/admin-users': 'System & Security',
  '/settings': 'System & Security',
};

const moduleNameMap: Record<string, string> = {
  '/products': 'Products',
  '/categories': 'Categories',
  '/sub-categories': 'Sub Categories',
  '/brands': 'Brands',
  '/variants': 'Product Variants',
  '/inventory': 'Inventory',
  '/orders': 'Orders',
  '/returns': 'Returns & RMA',
  '/users': 'Customers',
  '/sellers': 'Vendors & Merchants',
  '/promocodes': 'Coupons',
  '/offers': 'Offers & Deals',
  '/banners': 'Banners & Ads',
  '/reviews': 'Reviews & Ratings',
  '/notifications': 'Notification Templates',
  '/admin-users': 'Admin Users',
  '/settings': 'Store Settings',
  '/reports': 'Reports & Analytics',
  '/dashboard': 'Dashboard',
};

export default function AdminHeader({ title, subtitle, breadcrumbs }: AdminHeaderProps) {
  const { toggleMobile } = useSidebar();
  const pathname = usePathname();

  const [notifsOpen, setNotifsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await ApiClient.get<{ count: number; unreadCount: number; data: any[] }>(
        '/notifications/list?role=admin'
      );
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
        setNotifications(list);
        setUnreadCount((res as any).unreadCount || list.filter((n: any) => !n.read).length);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Fast responsive polling
    const timer = setInterval(fetchNotifications, 10000);

    // Refetch on tab focus
    const handleFocus = () => fetchNotifications();
    window.addEventListener('focus', handleFocus);

    // Cross-Tab BroadcastChannel
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('smart_electronics_notifications');
        bc.onmessage = (event) => {
          if (event.data?.type === 'NOTIFICATION_BROADCAST' || event.data?.type === 'REFRESH_NOTIFICATIONS') {
            fetchNotifications();
          }
        };
      } catch {}
    }

    // Live Server-Sent Events (SSE) Stream
    let es: EventSource | null = null;
    if (typeof window !== 'undefined' && 'EventSource' in window) {
      try {
        es = new EventSource('/api/notifications/stream');
        es.addEventListener('NOTIFICATION_BROADCAST', (e) => {
          try {
            const payload = JSON.parse(e.data);
            if (payload.role === 'admin' || payload.role === 'all') {
              fetchNotifications();
            }
          } catch {}
        });
      } catch {}
    }

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', handleFocus);
      if (bc) bc.close();
      if (es) es.close();
    };
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await ApiClient.request(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await ApiClient.request('/notifications/read-all', {
        method: 'PATCH',
        body: JSON.stringify({ role: 'admin' }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  // Generate intelligent breadcrumbs if not explicitly passed
  const breadcrumbItems = React.useMemo<BreadcrumbItem[]>(() => {
    if (breadcrumbs && breadcrumbs.length > 0) {
      return breadcrumbs;
    }

    const items: BreadcrumbItem[] = [
      { label: 'SmartElectronics', href: '/dashboard' },
    ];

    // Find section from matching base route
    const matchingRouteKey = Object.keys(routeSectionMap).find((route) =>
      pathname === route || (route !== '/dashboard' && pathname.startsWith(route))
    );
    const sectionName = matchingRouteKey ? routeSectionMap[matchingRouteKey] : 'Analytics & Main';
    const sectionMeta = sectionConfigMap[sectionName] || { title: sectionName, defaultHref: '/dashboard' };

    items.push({
      label: sectionMeta.title,
      href: sectionMeta.defaultHref,
    });

    // Check if this is a subroute of a module (e.g., /products/new, /products/123/edit, /promocodes/new)
    if (matchingRouteKey && pathname !== matchingRouteKey && pathname.startsWith(matchingRouteKey + '/')) {
      const parentModuleTitle = moduleNameMap[matchingRouteKey] || matchingRouteKey.replace('/', '');
      items.push({
        label: parentModuleTitle,
        href: matchingRouteKey,
      });
    }

    // Active leaf (current page)
    items.push({
      label: title,
    });

    return items;
  }, [breadcrumbs, pathname, title]);

  return (
    <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200/90 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={toggleMobile}
          aria-label="Toggle navigation menu"
          className="p-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition lg:hidden cursor-pointer shrink-0 border border-slate-200"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          {/* Breadcrumb Trail with Full Interactive Linking */}
          <nav aria-label="Breadcrumb" className="hidden sm:block mb-1">
            <ol className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 flex-wrap">
              {breadcrumbItems.map((item, index) => {
                const isLast = index === breadcrumbItems.length - 1;
                return (
                  <li key={`${item.label}-${index}`} className="flex items-center gap-1.5 min-w-0">
                    {index > 0 && (
                      <ChevronRight className="w-3 h-3 text-slate-300 shrink-0 select-none" aria-hidden="true" />
                    )}
                    {isLast || !item.href ? (
                      <span
                        className="text-blue-600 font-extrabold tracking-tight truncate max-w-[200px] md:max-w-[340px]"
                        aria-current="page"
                      >
                        {item.label}
                      </span>
                    ) : (
                      <Link
                        href={item.href}
                        className="group flex items-center gap-1 font-semibold text-slate-500 hover:text-blue-600 hover:underline underline-offset-2 transition-colors cursor-pointer shrink-0"
                      >
                        {index === 0 && (
                          <Home className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                        )}
                        <span>{item.label}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          <h1 className="text-base sm:text-lg lg:text-xl font-black text-slate-950 tracking-tight truncate flex items-center gap-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium mt-0.5 truncate hidden md:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifsOpen(!notifsOpen)}
            className={`relative p-2 rounded-xl border transition-all cursor-pointer ${
              notifsOpen
                ? 'bg-blue-50 border-blue-300 text-blue-600 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            aria-label="Open administrative notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-white text-[9px] font-black shadow-xs animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Popover */}
          {notifsOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotifsOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden animate-fade-in text-slate-900">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Admin Alerts</h4>
                      <p className="text-[10px] text-slate-400 font-bold">
                        {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All alerts read'}
                      </p>
                    </div>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-black text-blue-600 hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs font-medium">
                      No administrative alerts at this time
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => handleMarkAsRead(notif._id)}
                        className={`p-3.5 hover:bg-slate-50 transition cursor-pointer flex items-start gap-3 ${
                          !notif.read ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Zap className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-[9px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                                {notif.badge || 'ALERT'}
                              </span>
                              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-1 py-0.2 rounded">
                                {notif.channel === 'email' ? '✉️ EMAIL' : notif.channel === 'push' ? '🌐 PUSH' : notif.channel === 'sms' ? '💬 SMS' : '🔔 IN-APP'}
                              </span>
                            </div>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">
                            {notif.message}
                          </p>
                          {notif.actionUrl && (
                            <Link
                              href={notif.actionUrl}
                              onClick={() => setNotifsOpen(false)}
                              className="inline-flex items-center gap-1 text-[10px] font-black text-blue-600 hover:underline pt-0.5"
                            >
                              <span>{notif.actionLabel || 'View Details'}</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                  <Link
                    href="/notifications"
                    onClick={() => setNotifsOpen(false)}
                    className="text-[11px] font-black text-blue-600 hover:underline flex items-center justify-center gap-1"
                  >
                    <span>Notification Templates Studio</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Customer Store Link */}
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black transition-all shadow-xs shadow-blue-500/20 active:scale-95"
        >
          <span className="hidden sm:inline">Live Tech Store</span>
          <span className="sm:hidden">Store</span>
          <ExternalLink className="w-3.5 h-3.5 text-cyan-200 group-hover:translate-x-0.5 transition-transform" />
        </a>

        {/* Security Badge */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200/90 px-3 py-1.5 rounded-xl shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Role Guard Active</span>
        </div>
      </div>
    </header>
  );
}
