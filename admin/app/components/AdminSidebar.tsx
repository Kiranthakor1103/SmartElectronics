'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  Store,
  LogOut,
  Ticket,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FolderTree,
  Layers,
  Award,
  Boxes,
  Warehouse,
  Star,
  Image as ImageIcon,
  Percent,
  RotateCcw,
  BarChart3,
  Settings,
  ShieldCheck,
  Zap,
  Search,
  Truck,
  Sparkles,
  Bell,
} from 'lucide-react';
import { useSidebar } from './SidebarContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  icon: React.ElementType;
  items: NavItem[];
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobileOpen, closeMobile, isCollapsed, toggleCollapse } = useSidebar();
  const [filterQuery, setFilterQuery] = useState('');

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('user');
      document.cookie = 'adminToken=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'token=; path=/; max-age=0; SameSite=Lax';
      window.dispatchEvent(new Event('auth-change'));
    }
    closeMobile();
    router.push('/login');
  };

  const navSections: NavSection[] = [
    {
      title: 'Analytics & Main',
      icon: BarChart3,
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
      ],
    },
    {
      title: 'Catalog & Hardware',
      icon: FolderTree,
      items: [
        { name: 'Products', href: '/products', icon: Package },
        { name: 'Categories', href: '/categories', icon: FolderTree },
        { name: 'Sub Categories', href: '/sub-categories', icon: Layers },
        { name: 'Brands', href: '/brands', icon: Award },
        { name: 'Product Variants', href: '/variants', icon: Boxes },
        { name: 'Inventory', href: '/inventory', icon: Warehouse },
      ],
    },
    {
      title: 'Sales & Logistics',
      icon: Truck,
      items: [
        { name: 'Orders', href: '/orders', icon: ShoppingBag },
        { name: 'Returns & RMA', href: '/returns', icon: RotateCcw },
        { name: 'Customers', href: '/users', icon: Users },
        { name: 'Vendors & Merchants', href: '/sellers', icon: Store },
      ],
    },
    {
      title: 'Marketing & Promos',
      icon: Sparkles,
      items: [
        { name: 'Coupons', href: '/promocodes', icon: Ticket },
        { name: 'Offers & Deals', href: '/offers', icon: Percent },
        { name: 'Banners & Ads', href: '/banners', icon: ImageIcon },
        { name: 'Reviews & Ratings', href: '/reviews', icon: Star },
        { name: 'Notification Templates', href: '/notifications', icon: Bell },
      ],
    },
    {
      title: 'System & Security',
      icon: ShieldCheck,
      items: [
        { name: 'Admin Users', href: '/admin-users', icon: ShieldCheck },
        { name: 'Store Settings', href: '/settings', icon: Settings },
      ],
    },
  ];

  // All sections are expanded by default in light theme for 100% visibility
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Analytics & Main': true,
    'Catalog & Hardware': true,
    'Sales & Logistics': true,
    'Marketing & Promos': true,
    'System & Security': true,
  });

  // Automatically force open the section that contains the current active route
  useEffect(() => {
    const activeSection = navSections.find((sec) =>
      sec.items.some(
        (item) => pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
      )
    );
    if (activeSection) {
      setOpenSections((prev) => ({
        ...prev,
        [activeSection.title]: true,
      }));
    }
  }, [pathname]);

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Filter sections if search query is present
  const filteredSections = useMemo(() => {
    if (!filterQuery.trim()) return navSections;
    const q = filterQuery.toLowerCase().trim();
    return navSections
      .map((sec) => ({
        ...sec,
        items: sec.items.filter(
          (item) => item.name.toLowerCase().includes(q) || sec.title.toLowerCase().includes(q)
        ),
      }))
      .filter((sec) => sec.items.length > 0);
  }, [navSections, filterQuery]);

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          onClick={closeMobile}
          aria-hidden="true"
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300 animate-in fade-in"
        />
      )}

      {/* Main Sidebar Element (Clean, Modern Executive Light Theme) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col justify-between bg-white text-slate-800 border-r border-slate-200/90 p-3.5 select-none shrink-0 shadow-lg lg:shadow-xs transition-all duration-300 ease-in-out lg:static lg:min-h-screen ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'w-72 lg:w-72 max-w-[85vw]'}`}
      >
        <div className="space-y-3 flex flex-col min-h-0 flex-1">
          {/* Top Brand & Controls */}
          <div
            className={`pb-3 border-b border-slate-100 shrink-0 ${
              isCollapsed
                ? 'flex items-center justify-between lg:flex-col lg:items-center lg:gap-2.5'
                : 'flex items-center justify-between gap-2'
            }`}
          >
            <Link
              href="/dashboard"
              onClick={closeMobile}
              className={`flex items-center gap-2.5 min-w-0 transition-opacity hover:opacity-90 ${
                isCollapsed ? 'lg:justify-center' : 'flex-1'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-600/30 shrink-0">
                <Zap className="w-5 h-5 text-cyan-200 fill-current" />
              </div>

              <div className={`min-w-0 ${isCollapsed ? 'lg:hidden' : ''}`}>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm tracking-tight text-slate-950 whitespace-nowrap">
                    Smart<span className="text-blue-600">Electronics</span>
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/90 px-1.5 py-0.5 rounded-md shrink-0">
                    ADMIN
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 truncate">Management Console</p>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={closeMobile}
              aria-label="Close Navigation Menu"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition lg:hidden cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop Collapse Toggle */}
            <button
              type="button"
              onClick={toggleCollapse}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className={`hidden lg:flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200/80 text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition cursor-pointer shrink-0 ${
                isCollapsed ? 'w-8 h-8' : 'w-7 h-7'
              }`}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Quick Search Filter for Modules (Light theme input) */}
          {(!isCollapsed || isMobileOpen) && (
            <div className="relative shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Search admin modules..."
                className="w-full bg-slate-50/90 border border-slate-200 rounded-xl pl-8.5 pr-7 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition font-semibold"
              />
              {filterQuery && (
                <button
                  onClick={() => setFilterQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Navigation Menu (High-Contrast Light Theme, 100% Visible) */}
          <nav className="space-y-3 overflow-y-auto custom-scrollbar pr-1 flex-1">
            {filteredSections.map((section, idx) => {
              const SectionIcon = section.icon;
              const isOpen = openSections[section.title] ?? true;
              const hasActiveChild = section.items.some(
                (item) => pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              );

              return (
                <div key={section.title} className="space-y-1">
                  {(!isCollapsed || isMobileOpen) ? (
                    /* Section Header Button */
                    <button
                      type="button"
                      onClick={() => toggleSection(section.title)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all cursor-pointer group select-none ${
                        hasActiveChild
                          ? 'bg-blue-50/80 text-blue-800 font-black'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <SectionIcon
                          className={`w-3.5 h-3.5 shrink-0 ${
                            hasActiveChild ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                        <span className="text-[10.5px] font-black uppercase tracking-wider transition-colors truncate">
                          {section.title}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full transition-colors ${
                            hasActiveChild
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                          }`}
                        >
                          {section.items.length}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {hasActiveChild && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                        )}
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
                            hasActiveChild ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                          } ${isOpen ? 'rotate-0' : '-rotate-90'}`}
                        />
                      </div>
                    </button>
                  ) : (
                    /* Divider in icon-collapsed mode */
                    idx > 0 && <div className="border-t border-slate-100 my-1.5" />
                  )}

                  {/* Section Links */}
                  <div
                    className={`space-y-1 transition-all duration-200 ease-in-out ${
                      !isCollapsed || isMobileOpen
                        ? isOpen
                          ? 'max-h-[500px] opacity-100'
                          : 'max-h-0 opacity-0 overflow-hidden pointer-events-none'
                        : 'block'
                    }`}
                  >
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href));

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMobile}
                          title={isCollapsed && !isMobileOpen ? item.name : undefined}
                          className={`group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all select-none ${
                            isCollapsed && !isMobileOpen ? 'lg:justify-center lg:px-2' : ''
                          } ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-600 text-white font-black shadow-md shadow-blue-600/25 ring-1 ring-blue-600/30'
                              : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/70'
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-transform ${
                              isActive
                                ? 'text-white scale-110'
                                : 'text-slate-400 group-hover:text-blue-600 group-hover:scale-105'
                            }`}
                          />
                          {(!isCollapsed || isMobileOpen) && (
                            <span className="truncate">{item.name}</span>
                          )}

                          {/* Active Indicator on Right */}
                          {isActive && (!isCollapsed || isMobileOpen) && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-2xs" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer Profile & Logout (Light Theme) */}
        <div className="space-y-2.5 pt-3 border-t border-slate-100 shrink-0">
          {(!isCollapsed || isMobileOpen) ? (
            <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
                SA
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-900 truncate">Super Admin</p>
                <p className="text-[10px] text-emerald-600 font-bold truncate flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  SmartElectronics Live
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div
                title="Super Admin (Active)"
                className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0"
              >
                SA
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            title={isCollapsed && !isMobileOpen ? 'Sign Out Admin' : undefined}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-black bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition cursor-pointer shadow-2xs ${
              isCollapsed && !isMobileOpen ? 'lg:px-2' : ''
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {(!isCollapsed || isMobileOpen) && <span>Sign Out Admin</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
