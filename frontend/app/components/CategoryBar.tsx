'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Smartphone,
  Laptop,
  Tv,
  Headphones,
  Watch,
  Cpu,
  Gamepad2,
  Zap,
  Wind,
  Coffee,
  Camera,
  Layers,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  LayoutGrid,
  Search,
  X,
  Flame,
  Check,
} from 'lucide-react';

export interface CategoryItem {
  name: string;
  slug?: string;
  href?: string;
  icon?: string;
  badge?: string;
  color?: string;
  image?: string;
  subCategories?: string[];
}

interface CategoryBarProps {
  categories?: CategoryItem[];
}

export const DEPARTMENT_SUBCATEGORIES: Record<string, string[]> = {
  'Mobile & Tablets': ['Smartphones', 'Mobile Accessories', 'Feature Phones', 'Tablets', 'iPads'],
  'Laptops & Computers': ['Laptops', 'Gaming Laptops', 'All-in-One PCs', 'Monitors', 'Mini PCs'],
  'TVs & Entertainment': ['OLED TVs', 'QLED TVs', 'LED TVs', 'Smart TVs', 'Set Top Boxes'],
  'Audio Devices': ['Headphones', 'Soundbars', 'Wireless Earbuds', 'Neckbands', 'Bluetooth Speakers'],
  'Smart Devices': ['Smart Watches', 'Smart Bands', 'Smart Home Devices', 'Smart Cameras', 'Smart Lights'],
  'Computer Accessories': ['Keyboards', 'Mouse', 'Webcams', 'Printers', 'SSD'],
  'Gaming Zone': ['Gaming Consoles', 'PlayStation', 'Xbox', 'Gaming Controllers', 'VR Headsets'],
  'Power & Charging': ['Power Banks', 'Fast Chargers', 'Mobile Chargers', 'USB Cables', 'Extension Boards'],
  'Home Appliances': ['Air Conditioners', 'Refrigerators', 'Washing Machines', 'Geysers', 'Vacuum Cleaners'],
  'Kitchen Appliances': ['Mixer Grinder', 'Air Fryers', 'Coffee Machines', 'Pop-up Toasters', 'Rice Cookers'],
  'Cameras & Security': ['Mirrorless Cameras', 'DSLR Cameras', 'Action Cameras', 'CCTV Cameras', 'Video Doorbells'],
};

const ELECTRONICS_CATEGORIES: CategoryItem[] = [
  { name: 'Mobile & Tablets', href: '/products?category=Mobile+%26+Tablets' },
  { name: 'Laptops & Computers', href: '/products?category=Laptops+%26+Computers' },
  { name: 'TVs & Entertainment', href: '/products?category=TVs+%26+Entertainment' },
  { name: 'Audio Devices', href: '/products?category=Audio+Devices' },
  { name: 'Smart Devices', href: '/products?category=Smart+Devices' },
  { name: 'Computer Accessories', href: '/products?category=Computer+Accessories' },
  { name: 'Gaming Zone', href: '/products?category=Gaming+Zone' },
  { name: 'Power & Charging', href: '/products?category=Power+%26+Charging' },
  { name: 'Home Appliances', href: '/products?category=Home+Appliances' },
  { name: 'Kitchen Appliances', href: '/products?category=Kitchen+Appliances' },
  { name: 'Cameras & Security', href: '/products?category=Cameras+%26+Security' },
];

const categoryIcons: Record<string, React.ElementType> = {
  smartphone: Smartphone,
  mobile: Smartphone,
  laptop: Laptop,
  computers: Laptop,
  tv: Tv,
  headphones: Headphones,
  audio: Headphones,
  watch: Watch,
  smart: Watch,
  cpu: Cpu,
  computer: Cpu,
  gamepad2: Gamepad2,
  gamepad: Gamepad2,
  gaming: Gamepad2,
  zap: Zap,
  power: Zap,
  wind: Wind,
  appliances: Wind,
  coffee: Coffee,
  kitchen: Coffee,
  camera: Camera,
  security: Camera,
  layers: Layers,
};

function getCategoryIcon(name: string, iconProp?: string): React.ElementType {
  if (iconProp) {
    const directKey = iconProp.toLowerCase().trim();
    if (categoryIcons[directKey]) return categoryIcons[directKey];
  }
  const key = name.toLowerCase().trim();
  for (const [k, Icon] of Object.entries(categoryIcons)) {
    if (key.includes(k)) return Icon;
  }
  return Layers;
}

const categoryThemeColors: Record<
  string,
  { gradient: string; activeRing: string; activeBg: string; text: string; lightBg: string }
> = {
  'mobile & tablets': {
    gradient: 'from-blue-600 to-cyan-500',
    activeRing: 'ring-blue-500/30 border-blue-500',
    activeBg: 'bg-blue-50/90 text-blue-700',
    text: 'text-blue-600',
    lightBg: 'bg-blue-100/70 text-blue-700',
  },
  'laptops & computers': {
    gradient: 'from-indigo-600 to-violet-600',
    activeRing: 'ring-indigo-500/30 border-indigo-500',
    activeBg: 'bg-indigo-50/90 text-indigo-700',
    text: 'text-indigo-600',
    lightBg: 'bg-indigo-100/70 text-indigo-700',
  },
  'tvs & entertainment': {
    gradient: 'from-rose-500 to-pink-600',
    activeRing: 'ring-rose-500/30 border-rose-500',
    activeBg: 'bg-rose-50/90 text-rose-700',
    text: 'text-rose-600',
    lightBg: 'bg-rose-100/70 text-rose-700',
  },
  'audio devices': {
    gradient: 'from-violet-600 to-purple-600',
    activeRing: 'ring-violet-500/30 border-violet-500',
    activeBg: 'bg-violet-50/90 text-violet-700',
    text: 'text-violet-600',
    lightBg: 'bg-violet-100/70 text-violet-700',
  },
  'smart devices': {
    gradient: 'from-emerald-500 to-teal-600',
    activeRing: 'ring-emerald-500/30 border-emerald-500',
    activeBg: 'bg-emerald-50/90 text-emerald-700',
    text: 'text-emerald-600',
    lightBg: 'bg-emerald-100/70 text-emerald-700',
  },
  'computer accessories': {
    gradient: 'from-sky-500 to-blue-600',
    activeRing: 'ring-sky-500/30 border-sky-500',
    activeBg: 'bg-sky-50/90 text-sky-700',
    text: 'text-sky-600',
    lightBg: 'bg-sky-100/70 text-sky-700',
  },
  'gaming zone': {
    gradient: 'from-amber-500 to-rose-600',
    activeRing: 'ring-amber-500/30 border-amber-500',
    activeBg: 'bg-amber-50/90 text-amber-800',
    text: 'text-amber-600',
    lightBg: 'bg-amber-100/70 text-amber-700',
  },
  'power & charging': {
    gradient: 'from-amber-500 to-orange-500',
    activeRing: 'ring-amber-500/30 border-amber-500',
    activeBg: 'bg-amber-50/90 text-amber-800',
    text: 'text-amber-600',
    lightBg: 'bg-amber-100/70 text-amber-700',
  },
  'home appliances': {
    gradient: 'from-teal-500 to-emerald-600',
    activeRing: 'ring-teal-500/30 border-teal-500',
    activeBg: 'bg-teal-50/90 text-teal-800',
    text: 'text-teal-600',
    lightBg: 'bg-teal-100/70 text-teal-700',
  },
  'kitchen appliances': {
    gradient: 'from-orange-500 to-amber-600',
    activeRing: 'ring-orange-500/30 border-orange-500',
    activeBg: 'bg-orange-50/90 text-orange-800',
    text: 'text-orange-600',
    lightBg: 'bg-orange-100/70 text-orange-700',
  },
  'cameras & security': {
    gradient: 'from-indigo-600 to-blue-700',
    activeRing: 'ring-indigo-500/30 border-indigo-500',
    activeBg: 'bg-indigo-50/90 text-indigo-700',
    text: 'text-indigo-600',
    lightBg: 'bg-indigo-100/70 text-indigo-700',
  },
};

function getTheme(name: string) {
  const key = name.toLowerCase().trim();
  if (categoryThemeColors[key]) return categoryThemeColors[key];
  for (const [k, v] of Object.entries(categoryThemeColors)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return {
    gradient: 'from-blue-600 to-indigo-600',
    activeRing: 'ring-indigo-500/30 border-indigo-500',
    activeBg: 'bg-indigo-50/90 text-indigo-700',
    text: 'text-indigo-600',
    lightBg: 'bg-indigo-100/70 text-indigo-700',
  };
}

function CategoryBarInner({ categories }: CategoryBarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentCategoryParam = searchParams.get('category') || '';
  const currentSubCategoryParam = searchParams.get('subCategory') || '';

  const list = useMemo(() => {
    return categories && categories.length > 0 ? categories : ELECTRONICS_CATEGORIES;
  }, [categories]);

  // Track active category and hover
  const [pinnedCat, setPinnedCat] = useState<string>(
    currentCategoryParam || list[0]?.name || 'Mobile & Tablets'
  );
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const [megaMenuOpen, setMegaMenuOpen] = useState<boolean>(false);
  const [megaSearch, setMegaSearch] = useState<string>('');

  // Horizontal scroll state & refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);
  const megaMenuRef = useRef<HTMLDivElement>(null);

  // Sync category param with pinned category
  useEffect(() => {
    if (currentCategoryParam) {
      setPinnedCat(currentCategoryParam);
    }
  }, [currentCategoryParam]);

  // Check scroll positions
  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
    }
    window.addEventListener('resize', checkScroll);
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [list]);

  // Close mega menu on outside click or escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setMegaMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMegaMenuOpen(false);
    };
    if (megaMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [megaMenuOpen]);

  // Scroll carousel smoothly
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === 'left' ? -340 : 340;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  // Determine active category for subcategories bar
  const activeCategory = hoveredCat || pinnedCat || list[0]?.name || 'Mobile & Tablets';

  // Find category item to check for dynamic subCategories
  const currentCategoryObj = useMemo(() => {
    return list.find(
      (c) => c.name.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [list, activeCategory]);

  const subCategories: string[] = useMemo(() => {
    if (
      currentCategoryObj?.subCategories &&
      currentCategoryObj.subCategories.length > 0
    ) {
      return currentCategoryObj.subCategories;
    }
    return DEPARTMENT_SUBCATEGORIES[activeCategory] || [
      'Smartphones',
      'Gaming Laptops',
      'OLED TVs',
      'Wireless Earbuds',
      'Smart Watches',
    ];
  }, [currentCategoryObj, activeCategory]);

  const activeTheme = getTheme(activeCategory);

  // Filtered categories for mega menu
  const filteredDepartments = useMemo(() => {
    if (!megaSearch.trim()) return list;
    const q = megaSearch.toLowerCase().trim();
    return list.filter((cat) => {
      const nameMatch = cat.name.toLowerCase().includes(q);
      const subs =
        cat.subCategories || DEPARTMENT_SUBCATEGORIES[cat.name] || [];
      const subMatch = subs.some((s) => s.toLowerCase().includes(q));
      return nameMatch || subMatch;
    });
  }, [list, megaSearch]);

  const handleCategorySelect = (
    categoryName: string,
    e?: React.MouseEvent,
    el?: HTMLElement | null
  ) => {
    setPinnedCat(categoryName);
    setMegaMenuOpen(false);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  return (
    <section
      ref={megaMenuRef}
      className="bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-2xs sticky top-[68px] z-40 transition-all select-none"
      onMouseLeave={() => setHoveredCat(null)}
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        {/* ── Primary Categories Row with Carousel & Mega Menu Toggle ── */}
        <div className="relative flex items-center gap-2 py-2">
          {/* Mega Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMegaMenuOpen((prev) => !prev)}
            aria-expanded={megaMenuOpen}
            aria-label="Browse all departments"
            className={`group flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black transition-all shrink-0 shadow-2xs ${
              megaMenuOpen
                ? 'bg-slate-950 text-white shadow-md'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-indigo-600 text-white group-hover:scale-105 transition-transform">
              <LayoutGrid className="h-3 w-3" />
            </div>
            <span className="hidden sm:inline">Departments</span>
            <span className="sm:hidden">All</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                megaMenuOpen ? 'rotate-180 text-cyan-400' : 'text-slate-400'
              }`}
            />
          </button>

          {/* Thin subtle divider */}
          <div className="h-6 w-px bg-slate-200 shrink-0 hidden sm:block" />

          {/* Carousel Viewport Container */}
          <div className="relative flex-1 overflow-hidden">
            {/* Left Edge Fade & Scroll Button */}
            <div
              className={`absolute left-0 top-0 bottom-0 z-10 flex items-center transition-opacity duration-200 ${
                canScrollLeft ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="w-10 h-full bg-gradient-to-r from-white via-white/90 to-transparent pointer-events-none" />
              <button
                type="button"
                onClick={() => scrollCarousel('left')}
                aria-label="Scroll left"
                className="absolute left-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 border border-slate-200 text-slate-700 shadow-md hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Categories Strip (zero OS scrollbar via hide-scrollbar) */}
            <div
              ref={scrollRef}
              className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar scroll-smooth py-0.5 px-1"
            >
              {list.map((cat) => {
                const isSelected =
                  activeCategory.toLowerCase() === cat.name.toLowerCase();
                const IconComponent = getCategoryIcon(cat.name, cat.icon);
                const theme = getTheme(cat.name);
                const href =
                  cat.href || `/products?category=${encodeURIComponent(cat.name)}`;

                return (
                  <div
                    key={cat.name}
                    className="shrink-0"
                    onMouseEnter={() => setHoveredCat(cat.name)}
                  >
                    <Link
                      href={href}
                      onClick={(e) =>
                        handleCategorySelect(cat.name, e, e.currentTarget)
                      }
                      className={`group flex items-center gap-2 rounded-xl px-2.5 py-1.5 transition-all text-xs border ${
                        isSelected
                          ? `bg-white ${theme.activeRing} ring-2 shadow-xs`
                          : 'border-slate-200/80 bg-slate-50/60 text-slate-700 hover:border-indigo-300 hover:bg-white hover:text-indigo-700 hover:shadow-2xs'
                      }`}
                    >
                      {/* Icon Badge */}
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-lg transition-all shadow-2xs ${
                          isSelected
                            ? `bg-gradient-to-tr ${theme.gradient} text-white shadow-sm`
                            : `${theme.lightBg} group-hover:scale-110`
                        }`}
                      >
                        <IconComponent className="h-3.5 w-3.5" />
                      </div>

                      {/* Category Title */}
                      <span
                        className={`text-[11.5px] font-black tracking-tight whitespace-nowrap ${
                          isSelected
                            ? theme.text
                            : 'text-slate-700 group-hover:text-slate-900'
                        }`}
                      >
                        {cat.name}
                      </span>

                      {/* Active Indicator Pip */}
                      {isSelected && (
                        <span
                          className={`h-1.5 w-1.5 rounded-full bg-gradient-to-tr ${theme.gradient} shadow-xs`}
                        />
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Right Edge Fade & Scroll Button */}
            <div
              className={`absolute right-0 top-0 bottom-0 z-10 flex items-center justify-end transition-opacity duration-200 ${
                canScrollRight ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="w-10 h-full bg-gradient-to-l from-white via-white/90 to-transparent pointer-events-none" />
              <button
                type="button"
                onClick={() => scrollCarousel('right')}
                aria-label="Scroll right"
                className="absolute right-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 border border-slate-200 text-slate-700 shadow-md hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all active:scale-95"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Secondary Subcategory Navigation Rail ── */}
        <div className="border-t border-slate-100 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar flex-1 min-w-0">
            {/* Active Category Indicator Badge */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${activeTheme.lightBg}`}
              >
                <Sparkles className="h-3 w-3" />
                <span>Trending in {activeCategory}:</span>
              </span>
            </div>

            {/* Subcategory Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-0.5">
              {/* All in department shortcut chip */}
              <Link
                href={`/products?category=${encodeURIComponent(activeCategory)}`}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold whitespace-nowrap transition-all shadow-2xs ${
                  !currentSubCategoryParam &&
                  currentCategoryParam.toLowerCase() === activeCategory.toLowerCase()
                    ? `bg-slate-900 border-slate-900 text-white shadow-xs`
                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/70 hover:text-indigo-700'
                }`}
              >
                <span>All {activeCategory}</span>
              </Link>

              {subCategories.map((sub) => {
                const isCurrentSub =
                  currentSubCategoryParam.toLowerCase() === sub.toLowerCase() &&
                  currentCategoryParam.toLowerCase() === activeCategory.toLowerCase();

                return (
                  <Link
                    key={sub}
                    href={`/products?category=${encodeURIComponent(
                      activeCategory
                    )}&subCategory=${encodeURIComponent(sub)}`}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold whitespace-nowrap transition-all shadow-2xs ${
                      isCurrentSub
                        ? `bg-gradient-to-r ${activeTheme.gradient} border-transparent text-white shadow-xs`
                        : 'bg-white border-slate-200/90 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/80 hover:text-indigo-800'
                    }`}
                  >
                    <span>{sub}</span>
                    <ChevronRight className="h-2.5 w-2.5 opacity-50" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Direct "Explore All" Action */}
          <Link
            href={`/products?category=${encodeURIComponent(activeCategory)}`}
            className={`group text-[11px] font-extrabold ${activeTheme.text} hover:opacity-80 transition-all shrink-0 inline-flex items-center gap-1 ml-auto pl-2`}
          >
            <span>Explore all in {activeCategory}</span>
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ── Modern Tech Mega Menu Dropdown / Popover ── */}
      {megaMenuOpen && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white/98 backdrop-blur-2xl border-b border-slate-200 shadow-2xl animate-fade-in">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
            {/* Header & Quick Search Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-indigo-600" />
                  All Electronics &amp; Tech Departments
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Browse {list.length} categories with guaranteed brand warranties and verified specs
                </p>
              </div>

              {/* Quick Filter Box */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter departments or subcategories..."
                  value={megaSearch}
                  onChange={(e) => setMegaSearch(e.target.value)}
                  className="w-full rounded-xl bg-slate-100 border border-slate-200 py-1.5 pl-9 pr-8 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
                {megaSearch && (
                  <button
                    type="button"
                    onClick={() => setMegaSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Departments Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {filteredDepartments.map((cat) => {
                const IconComponent = getCategoryIcon(cat.name, cat.icon);
                const theme = getTheme(cat.name);
                const subs =
                  cat.subCategories ||
                  DEPARTMENT_SUBCATEGORIES[cat.name] ||
                  [];
                const isSelected =
                  pinnedCat.toLowerCase() === cat.name.toLowerCase();

                return (
                  <div
                    key={cat.name}
                    className={`rounded-2xl p-3.5 border transition-all hover:shadow-md ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/40'
                        : 'border-slate-100 bg-slate-50/50 hover:border-indigo-200 hover:bg-white'
                    }`}
                  >
                    {/* Header with Icon */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <Link
                        href={`/products?category=${encodeURIComponent(cat.name)}`}
                        onClick={() => {
                          setPinnedCat(cat.name);
                          setMegaMenuOpen(false);
                        }}
                        className="flex items-center gap-2 group/title"
                      >
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr ${theme.gradient} text-white shadow-2xs group-hover/title:scale-105 transition-transform`}
                        >
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-black text-slate-900 group-hover/title:text-indigo-600 transition-colors">
                          {cat.name}
                        </span>
                      </Link>

                      <Link
                        href={`/products?category=${encodeURIComponent(cat.name)}`}
                        onClick={() => {
                          setPinnedCat(cat.name);
                          setMegaMenuOpen(false);
                        }}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        View All
                      </Link>
                    </div>

                    {/* Subcategories List */}
                    <div className="flex flex-wrap gap-1">
                      {subs.slice(0, 5).map((sub) => (
                        <Link
                          key={sub}
                          href={`/products?category=${encodeURIComponent(
                            cat.name
                          )}&subCategory=${encodeURIComponent(sub)}`}
                          onClick={() => {
                            setPinnedCat(cat.name);
                            setMegaMenuOpen(false);
                          }}
                          className="text-[10.5px] font-semibold text-slate-600 hover:text-indigo-700 bg-white hover:bg-indigo-50 px-2 py-0.5 rounded-md border border-slate-200/60 transition-colors"
                        >
                          {sub}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mega Menu Footer Banner */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 text-slate-600 font-semibold">
                <Link
                  href="/deals"
                  onClick={() => setMegaMenuOpen(false)}
                  className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-bold"
                >
                  <Flame className="h-3.5 w-3.5" />
                  <span>Mega Tech Deals</span>
                </Link>
                <Link
                  href="/products?sort=newest"
                  onClick={() => setMegaMenuOpen(false)}
                  className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-bold"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>New Arrivals 2026</span>
                </Link>
              </div>

              <button
                type="button"
                onClick={() => setMegaMenuOpen(false)}
                className="text-[11px] font-extrabold text-slate-500 hover:text-slate-800 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Close Menu (Esc)
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function CategoryBar(props: CategoryBarProps) {
  return (
    <Suspense
      fallback={
        <div className="h-20 w-full bg-white border-b border-slate-200 animate-pulse" />
      }
    >
      <CategoryBarInner {...props} />
    </Suspense>
  );
}
