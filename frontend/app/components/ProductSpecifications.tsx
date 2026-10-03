'use client';

import React from 'react';
import {
  Tv,
  Laptop,
  Wind,
  Refrigerator,
  Flame,
  Smartphone,
  Headphones,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Layers,
} from 'lucide-react';

interface ProductSpecificationsProps {
  category: string;
  subCategory?: string;
  brand?: string;
  sku?: string;
  warranty?: string;
  specifications?: Record<string, any>;
}

export default function ProductSpecifications({
  category = '',
  subCategory = '',
  brand = '',
  sku = '',
  warranty = '1 Year Brand Warranty',
  specifications = {},
}: ProductSpecificationsProps) {
  const catLower = category.toLowerCase();
  const subLower = (subCategory || '').toLowerCase();

  // Helper to determine specific category template
  const isTV = catLower.includes('tv') || subLower.includes('tv');
  const isLaptop = catLower.includes('laptop') || catLower.includes('computer') || subLower.includes('laptop');
  const isAC = subLower.includes('air conditioner') || subLower.includes('ac') || catLower.includes('conditioner');
  const isFridge = subLower.includes('refrigerator') || subLower.includes('fridge');
  const isGeyser = subLower.includes('geyser') || subLower.includes('water heater');
  const isMobile = catLower.includes('mobile') || subLower.includes('phone') || subLower.includes('tablet') || subLower.includes('ipad');
  const isAudio = catLower.includes('audio') || subLower.includes('headphone') || subLower.includes('soundbar') || subLower.includes('earbud');

  // Compute icon and badge title
  const getCategoryHeader = () => {
    if (isTV) return { title: 'Television & Display Specifications', icon: Tv, theme: 'text-red-500 bg-red-50' };
    if (isLaptop) return { title: 'Computing & Hardware Specifications', icon: Laptop, theme: 'text-purple-500 bg-purple-50' };
    if (isAC) return { title: 'Air Conditioner Cooling Specifications', icon: Wind, theme: 'text-cyan-500 bg-cyan-50' };
    if (isFridge) return { title: 'Refrigerator Cooling & Storage Specifications', icon: Layers, theme: 'text-emerald-500 bg-emerald-50' };
    if (isGeyser) return { title: 'Water Geyser & Heating Specifications', icon: Flame, theme: 'text-amber-500 bg-amber-50' };
    if (isMobile) return { title: 'Smartphone & Mobile Device Specifications', icon: Smartphone, theme: 'text-blue-500 bg-blue-50' };
    if (isAudio) return { title: 'Acoustic & Audio Engine Specifications', icon: Headphones, theme: 'text-rose-500 bg-rose-50' };
    return { title: 'Technical Specifications & Performance Data', icon: Cpu, theme: 'text-indigo-500 bg-indigo-50' };
  };

  const header = getCategoryHeader();
  const IconComponent = header.icon;

  // Flatten or extract specifications
  const specEntries = Object.entries(specifications || {});

  return (
    <div className="mt-8 rounded-2xl border border-slate-200/90 bg-white p-6 md:p-8 shadow-sm">
      {/* Header with Electronics Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${header.theme} shadow-xs`}>
            <IconComponent className="h-5.5 w-5.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {header.title}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-700 border border-blue-200">
                <CheckCircle2 className="h-3 w-3" />
                Verified Specs
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Official manufacturer technical details and hardware parameters
            </p>
          </div>
        </div>

        {/* SKU & Brand Badge */}
        <div className="flex items-center gap-2.5 text-xs">
          {sku && (
            <div className="rounded-lg bg-slate-100 px-3 py-1.5 font-mono font-bold text-slate-700 border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-sans">SKU / MODEL</span>
              {sku}
            </div>
          )}
          {brand && (
            <div className="rounded-lg bg-slate-100 px-3 py-1.5 font-bold text-slate-700 border border-slate-200">
              <span className="text-[10px] text-slate-400 block">MANUFACTURER</span>
              {brand}
            </div>
          )}
        </div>
      </div>

      {/* Specifications Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200/80">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
            <tr>
              <th className="py-3 px-4 sm:px-6 w-1/3 sm:w-2/5">Technical Specification</th>
              <th className="py-3 px-4 sm:px-6">Manufacturer Configuration Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {specEntries.length > 0 ? (
              specEntries.map(([key, value], idx) => (
                <tr
                  key={key}
                  className={idx % 2 === 0 ? 'bg-white hover:bg-blue-50/30' : 'bg-slate-50/50 hover:bg-blue-50/30'}
                >
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-700">
                    {key}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="py-6 px-4 text-center text-slate-400 italic">
                  Standard manufacturer parameters apply. Contact support for additional hardware inquiries.
                </td>
              </tr>
            )}

            {/* Standard Global Hardware Guarantees */}
            <tr className="bg-blue-50/40">
              <td className="py-3.5 px-4 sm:px-6 font-bold text-blue-900 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                Brand Warranty
              </td>
              <td className="py-3.5 px-4 sm:px-6 font-black text-blue-950">
                {warranty}
              </td>
            </tr>
            <tr className="bg-white">
              <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-700">
                Quality Certification
              </td>
              <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">
                100% Genuine Guaranteed &amp; BIS Certified (India)
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Support and Service Footer Note */}
      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-500 bg-slate-50 rounded-xl p-3.5 border border-slate-100">
        <span>
          💡 <strong>Need Installation or Demo?</strong> Authorized brand technician installation is available across 19,000+ pin codes in India upon delivery.
        </span>
        <span className="text-blue-600 font-bold hover:underline cursor-pointer shrink-0">
          Download User Manual
        </span>
      </div>
    </div>
  );
}
