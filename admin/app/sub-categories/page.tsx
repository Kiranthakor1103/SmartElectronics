'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import AdminPagination from '../components/AdminPagination';
import { ApiClient } from '../lib/apiClient';
import { useToast } from '../components/ToastProvider';
import {
  StatCard,
  Button,
  SearchInput,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  CustomDropdown,
} from '../components/ui';
import {
  Layers,
  Plus,
  FolderTree,
  Tag,
  CheckCircle2,
  ExternalLink,
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
  X,
  Filter,
} from 'lucide-react';

export interface SubCategoryItem {
  id: string;
  name: string;
  parent: string;
  slug: string;
  items: number;
  status: 'active' | 'inactive';
}

const DEFAULT_DEPARTMENTS = [
  'All Departments',
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
];

const INITIAL_SUB_CATEGORIES: SubCategoryItem[] = [
  // 1. Mobile & Tablets (Flagship: Smartphones, Mobile Accessories, Feature Phones, Tablets, iPads)
  { id: 'sub-1', name: 'Smartphones', parent: 'Mobile & Tablets', slug: 'smartphones', items: 1, status: 'active' },
  { id: 'sub-2', name: 'Mobile Accessories', parent: 'Mobile & Tablets', slug: 'mobile-accessories', items: 1, status: 'active' },
  { id: 'sub-3', name: 'Feature Phones', parent: 'Mobile & Tablets', slug: 'feature-phones', items: 1, status: 'active' },
  { id: 'sub-4', name: 'Tablets', parent: 'Mobile & Tablets', slug: 'tablets', items: 1, status: 'active' },
  { id: 'sub-5', name: 'iPads', parent: 'Mobile & Tablets', slug: 'ipads', items: 1, status: 'active' },
  { id: 'sub-6', name: 'Mobile Cases', parent: 'Mobile & Tablets', slug: 'mobile-cases', items: 0, status: 'active' },
  { id: 'sub-7', name: 'Screen Protectors', parent: 'Mobile & Tablets', slug: 'screen-protectors', items: 0, status: 'active' },

  // 2. Laptops & Computers (Flagship: Laptops, Gaming Laptops, All-in-One PCs, Monitors, Mini PCs)
  { id: 'sub-8', name: 'Laptops', parent: 'Laptops & Computers', slug: 'laptops', items: 1, status: 'active' },
  { id: 'sub-9', name: 'Gaming Laptops', parent: 'Laptops & Computers', slug: 'gaming-laptops', items: 1, status: 'active' },
  { id: 'sub-10', name: 'All-in-One PCs', parent: 'Laptops & Computers', slug: 'all-in-one-pcs', items: 1, status: 'active' },
  { id: 'sub-11', name: 'Monitors', parent: 'Laptops & Computers', slug: 'monitors', items: 1, status: 'active' },
  { id: 'sub-12', name: 'Mini PCs', parent: 'Laptops & Computers', slug: 'mini-pcs', items: 1, status: 'active' },
  { id: 'sub-13', name: 'Desktop PCs', parent: 'Laptops & Computers', slug: 'desktop-pcs', items: 0, status: 'active' },

  // 3. TVs & Entertainment (Flagship: OLED TVs, QLED TVs, LED TVs, Smart TVs, Set Top Boxes)
  { id: 'sub-14', name: 'OLED TVs', parent: 'TVs & Entertainment', slug: 'oled-tvs', items: 1, status: 'active' },
  { id: 'sub-15', name: 'QLED TVs', parent: 'TVs & Entertainment', slug: 'qled-tvs', items: 1, status: 'active' },
  { id: 'sub-16', name: 'LED TVs', parent: 'TVs & Entertainment', slug: 'led-tvs', items: 1, status: 'active' },
  { id: 'sub-17', name: 'Smart TVs', parent: 'TVs & Entertainment', slug: 'smart-tvs', items: 1, status: 'active' },
  { id: 'sub-18', name: 'Set Top Boxes', parent: 'TVs & Entertainment', slug: 'set-top-boxes', items: 1, status: 'active' },
  { id: 'sub-19', name: 'Android TVs', parent: 'TVs & Entertainment', slug: 'android-tvs', items: 0, status: 'active' },
  { id: 'sub-20', name: 'TV Wall Mounts', parent: 'TVs & Entertainment', slug: 'tv-wall-mounts', items: 0, status: 'active' },

  // 4. Audio Devices (Flagship: Headphones, Soundbars, Wireless Earbuds, Neckbands, Bluetooth Speakers)
  { id: 'sub-21', name: 'Headphones', parent: 'Audio Devices', slug: 'headphones', items: 1, status: 'active' },
  { id: 'sub-22', name: 'Soundbars', parent: 'Audio Devices', slug: 'soundbars', items: 1, status: 'active' },
  { id: 'sub-23', name: 'Wireless Earbuds', parent: 'Audio Devices', slug: 'wireless-earbuds', items: 1, status: 'active' },
  { id: 'sub-24', name: 'Neckbands', parent: 'Audio Devices', slug: 'neckbands', items: 1, status: 'active' },
  { id: 'sub-25', name: 'Bluetooth Speakers', parent: 'Audio Devices', slug: 'bluetooth-speakers', items: 1, status: 'active' },
  { id: 'sub-26', name: 'Home Theater Systems', parent: 'Audio Devices', slug: 'home-theaters', items: 0, status: 'active' },

  // 5. Smart Devices (Flagship: Smart Watches, Smart Bands, Smart Home Devices, Smart Cameras, Smart Lights)
  { id: 'sub-27', name: 'Smart Watches', parent: 'Smart Devices', slug: 'smart-watches', items: 1, status: 'active' },
  { id: 'sub-28', name: 'Smart Bands', parent: 'Smart Devices', slug: 'smart-bands', items: 1, status: 'active' },
  { id: 'sub-29', name: 'Smart Home Devices', parent: 'Smart Devices', slug: 'smart-home-devices', items: 1, status: 'active' },
  { id: 'sub-30', name: 'Smart Cameras', parent: 'Smart Devices', slug: 'smart-cameras', items: 1, status: 'active' },
  { id: 'sub-31', name: 'Smart Lights', parent: 'Smart Devices', slug: 'smart-lights', items: 1, status: 'active' },

  // 6. Computer Accessories (Flagship: Keyboards, Mouse, Webcams, Printers, SSD)
  { id: 'sub-32', name: 'Keyboards', parent: 'Computer Accessories', slug: 'keyboards', items: 1, status: 'active' },
  { id: 'sub-33', name: 'Mouse', parent: 'Computer Accessories', slug: 'mouse', items: 1, status: 'active' },
  { id: 'sub-34', name: 'Webcams', parent: 'Computer Accessories', slug: 'webcams', items: 1, status: 'active' },
  { id: 'sub-35', name: 'Printers', parent: 'Computer Accessories', slug: 'printers', items: 1, status: 'active' },
  { id: 'sub-36', name: 'SSD', parent: 'Computer Accessories', slug: 'ssd', items: 1, status: 'active' },
  { id: 'sub-37', name: 'RAM & Graphics Cards', parent: 'Computer Accessories', slug: 'ram-graphics', items: 0, status: 'active' },

  // 7. Gaming Zone (Flagship: Gaming Consoles, PlayStation, Xbox, Gaming Controllers, VR Headsets)
  { id: 'sub-38', name: 'Gaming Consoles', parent: 'Gaming Zone', slug: 'gaming-consoles', items: 1, status: 'active' },
  { id: 'sub-39', name: 'PlayStation', parent: 'Gaming Zone', slug: 'playstation', items: 1, status: 'active' },
  { id: 'sub-40', name: 'Xbox', parent: 'Gaming Zone', slug: 'xbox', items: 1, status: 'active' },
  { id: 'sub-41', name: 'Gaming Controllers', parent: 'Gaming Zone', slug: 'gaming-controllers', items: 1, status: 'active' },
  { id: 'sub-42', name: 'VR Headsets', parent: 'Gaming Zone', slug: 'vr-headsets', items: 1, status: 'active' },

  // 8. Power & Charging (Flagship: Power Banks, Fast Chargers, Mobile Chargers, USB Cables, Extension Boards)
  { id: 'sub-43', name: 'Power Banks', parent: 'Power & Charging', slug: 'power-banks', items: 1, status: 'active' },
  { id: 'sub-44', name: 'Fast Chargers', parent: 'Power & Charging', slug: 'fast-chargers', items: 1, status: 'active' },
  { id: 'sub-45', name: 'Mobile Chargers', parent: 'Power & Charging', slug: 'mobile-chargers', items: 1, status: 'active' },
  { id: 'sub-46', name: 'USB Cables', parent: 'Power & Charging', slug: 'usb-cables', items: 1, status: 'active' },
  { id: 'sub-47', name: 'Extension Boards', parent: 'Power & Charging', slug: 'extension-boards', items: 1, status: 'active' },

  // 9. Home Appliances (Flagship: Air Conditioners, Refrigerators, Washing Machines, Geysers, Vacuum Cleaners)
  { id: 'sub-48', name: 'Air Conditioners', parent: 'Home Appliances', slug: 'air-conditioners', items: 1, status: 'active' },
  { id: 'sub-49', name: 'Refrigerators', parent: 'Home Appliances', slug: 'refrigerators', items: 1, status: 'active' },
  { id: 'sub-50', name: 'Washing Machines', parent: 'Home Appliances', slug: 'washing-machines', items: 1, status: 'active' },
  { id: 'sub-51', name: 'Geysers', parent: 'Home Appliances', slug: 'geysers', items: 1, status: 'active' },
  { id: 'sub-52', name: 'Vacuum Cleaners', parent: 'Home Appliances', slug: 'vacuum-cleaners', items: 1, status: 'active' },

  // 10. Kitchen Appliances (Flagship: Mixer Grinder, Air Fryers, Coffee Machines, Pop-up Toasters, Rice Cookers)
  { id: 'sub-53', name: 'Mixer Grinder', parent: 'Kitchen Appliances', slug: 'mixer-grinder', items: 1, status: 'active' },
  { id: 'sub-54', name: 'Air Fryers', parent: 'Kitchen Appliances', slug: 'air-fryers', items: 1, status: 'active' },
  { id: 'sub-55', name: 'Coffee Machines', parent: 'Kitchen Appliances', slug: 'coffee-machines', items: 1, status: 'active' },
  { id: 'sub-56', name: 'Pop-up Toasters', parent: 'Kitchen Appliances', slug: 'pop-up-toasters', items: 1, status: 'active' },
  { id: 'sub-57', name: 'Rice Cookers', parent: 'Kitchen Appliances', slug: 'rice-cookers', items: 1, status: 'active' },

  // 11. Cameras & Security (Flagship: Mirrorless Cameras, DSLR Cameras, Action Cameras, CCTV Cameras, Video Doorbells)
  { id: 'sub-58', name: 'Mirrorless Cameras', parent: 'Cameras & Security', slug: 'mirrorless-cameras', items: 1, status: 'active' },
  { id: 'sub-59', name: 'DSLR Cameras', parent: 'Cameras & Security', slug: 'dslr-cameras', items: 1, status: 'active' },
  { id: 'sub-60', name: 'Action Cameras', parent: 'Cameras & Security', slug: 'action-cameras', items: 1, status: 'active' },
  { id: 'sub-61', name: 'CCTV Cameras', parent: 'Cameras & Security', slug: 'cctv-cameras', items: 1, status: 'active' },
  { id: 'sub-62', name: 'Video Doorbells', parent: 'Cameras & Security', slug: 'video-doorbells', items: 1, status: 'active' },
];

export default function AdminSubCategoriesPage() {
  const { toast } = useToast();
  const [subCategories, setSubCategories] = useState<SubCategoryItem[]>(INITIAL_SUB_CATEGORIES);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubParent, setNewSubParent] = useState('Mobile & Tablets');
  const [totalProductsCount, setTotalProductsCount] = useState(55);

  const isFetchingRef = useRef(false);

  // Dynamically sync real product counts per subcategory from backend
  useEffect(() => {
    async function loadProductCounts() {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      try {
        const res = await ApiClient.get('/admin/products?limit=100');
        if (res.success && Array.isArray(res.data?.products)) {
          const prods: any[] = res.data.products;
          setTotalProductsCount(res.data.total || prods.length);

          // Tally items per subCategory name (case insensitive)
          const counts: Record<string, number> = {};
          prods.forEach((p) => {
            const sub = (p.subCategory || '').trim().toLowerCase();
            if (sub) {
              counts[sub] = (counts[sub] || 0) + 1;
            }
          });

          setSubCategories((prev) =>
            prev.map((sub) => {
              const liveCount = counts[sub.name.trim().toLowerCase()];
              return liveCount !== undefined ? { ...sub, items: liveCount } : sub;
            })
          );
        }
      } catch {
        console.warn('Using baseline sub-category counts');
      } finally {
        isFetchingRef.current = false;
      }
    }
    loadProductCounts();
  }, []);

  const handleCreateSubCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newSubName.trim();
    if (!cleanName) {
      toast('Please enter a sub-category name', 'error');
      return;
    }

    const slug = cleanName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    const newSub: SubCategoryItem = {
      id: `sub-${Date.now()}`,
      name: cleanName,
      parent: newSubParent,
      slug,
      items: 0,
      status: 'active',
    };

    setSubCategories((prev) => [newSub, ...prev]);
    toast(`Sub-category "${cleanName}" created under ${newSubParent}!`, 'success');
    setNewSubName('');
    setIsModalOpen(false);
  };

  const filtered = useMemo(() => {
    return subCategories.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.parent.toLowerCase().includes(search.toLowerCase()) ||
        s.slug.includes(search.toLowerCase());

      const matchesDept =
        departmentFilter === 'All Departments' ||
        s.parent.toLowerCase() === departmentFilter.toLowerCase();

      return matchesSearch && matchesDept;
    });
  }, [subCategories, search, departmentFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedList = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Sub-Categories Directory"
          subtitle="Manage five distinct flagship sub-categories across the 11 electronic departments."
        />

        <main className="p-4 sm:p-6 space-y-6 flex-1 max-w-7xl w-full">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard
              title="Active Departments"
              value="11"
              icon={<FolderTree className="w-5 h-5 text-blue-600" />}
            />
            <StatCard
              title="Sub-Categories Configured"
              value={String(subCategories.length)}
              icon={<Layers className="w-5 h-5 text-indigo-600" />}
            />
            <StatCard
              title="Live Flagship SKUs"
              value={String(totalProductsCount)}
              icon={<Tag className="w-5 h-5 text-emerald-600" />}
            />
          </div>

          {/* Controls: Search, Parent Department Filter, and Create Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex flex-1 items-center gap-3 w-full sm:w-auto flex-wrap">
              <div className="w-full sm:w-72">
                <SearchInput
                  placeholder="Search sub-category or slug..."
                  value={search}
                  onChange={(val) => {
                    setSearch(val);
                    setCurrentPage(1);
                  }}
                  onClear={() => {
                    setSearch('');
                    setCurrentPage(1);
                  }}
                />
              </div>

              <CustomDropdown
                label="Department"
                icon={<Filter className="w-3.5 h-3.5" />}
                options={DEFAULT_DEPARTMENTS.map((dept) => ({
                  label: dept,
                  value: dept,
                }))}
                value={departmentFilter}
                onChange={(val) => {
                  setDepartmentFilter(val);
                  setCurrentPage(1);
                }}
              />
            </div>

            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 text-xs shrink-0 w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>Add Sub-Category</span>
            </Button>
          </div>

          {/* Sub-Categories Data Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sub-Category Name</TableHead>
                  <TableHead>Parent Department</TableHead>
                  <TableHead>URL Slug</TableHead>
                  <TableHead>Mapped Products</TableHead>
                  <TableHead>Storefront Navigation</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-slate-500 font-semibold text-xs">
                      No sub-categories match your filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedList.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">
                              {sub.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {sub.id}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {sub.parent}
                        </span>
                      </TableCell>

                      <TableCell>
                        <code className="text-[11px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          {sub.slug}
                        </code>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-black text-xs px-2 py-0.5 rounded-md ${
                              sub.items > 0
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {sub.items} {sub.items === 1 ? 'Product' : 'Products'}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Link
                          href={`http://localhost:3000/products?category=${encodeURIComponent(sub.parent)}&subCategory=${encodeURIComponent(sub.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <span>Browse Catalog</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </TableCell>

                      <TableCell>
                        <Badge variant="success">Active</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              itemsPerPage={pageSize}
              onPageChange={setCurrentPage}
              itemsPerPageOptions={[5, 10]}
              onItemsPerPageChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemName="sub-categories"
            />
          </div>
        </main>
      </div>

      {/* Quick Add Sub-Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Add New Sub-Category
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Sub-Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mechanical Keyboards, OLED Monitors..."
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                  Parent Department <span className="text-red-500">*</span>
                </label>
                <CustomDropdown
                  options={DEFAULT_DEPARTMENTS.filter((d) => d !== 'All Departments').map((dept) => ({
                    label: dept,
                    value: dept,
                  }))}
                  value={newSubParent}
                  onChange={(val) => setNewSubParent(val)}
                  direction="auto"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Sub-Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
