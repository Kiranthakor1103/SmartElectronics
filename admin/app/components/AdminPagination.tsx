'use client';

import React from 'react';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { CustomDropdown } from './ui';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  itemName?: string;
  itemsPerPageOptions?: number[];
  onItemsPerPageChange?: (size: number) => void;
}

export default function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  itemName = 'records',
  itemsPerPageOptions = [5, 10],
  onItemsPerPageChange,
}: AdminPaginationProps) {
  if (totalItems <= 0) {
    return null;
  }

  const effectiveTotalPages = Math.max(1, totalPages);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(totalItems, currentPage * itemsPerPage);

  // Generate page numbers to show with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (effectiveTotalPages <= maxVisible) {
      for (let i = 1; i <= effectiveTotalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(effectiveTotalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < effectiveTotalPages - 2) pages.push('...');
      if (!pages.includes(effectiveTotalPages)) pages.push(effectiveTotalPages);
    }
    return pages;
  };

  return (
    <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50/50">
      {/* Record info summary & optional items per page */}
      <div className="flex items-center gap-3 text-slate-500 text-xs flex-wrap">
        <span>
          Showing <strong className="text-slate-900 font-bold">{startItem}</strong> to{' '}
          <strong className="text-slate-900 font-bold">{endItem}</strong> of{' '}
          <strong className="text-slate-900 font-bold">{totalItems}</strong> {itemName}
        </span>

        {itemsPerPageOptions && onItemsPerPageChange && (
          <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-3">
            <span className="text-[11px] text-slate-400 font-semibold">Rows:</span>
            <div className="w-[68px]">
              <CustomDropdown
                size="sm"
                options={itemsPerPageOptions.map((opt) => ({
                  label: String(opt),
                  value: opt,
                }))}
                value={itemsPerPage}
                onChange={(val) => onItemsPerPageChange(Number(val))}
                direction="auto"
                minMenuWidth={68}
                buttonClassName="!py-1 !px-2 !text-xs !font-bold !rounded-lg !border-slate-200 bg-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1.5 self-center sm:self-auto select-none">
        {/* Previous Page Button (<<) */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          title="Previous Page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Numbered Page Buttons */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400 font-bold">
                  …
                </span>
              );
            }

            const pageNum = Number(page);
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-white hover:text-blue-600 border border-slate-200 bg-white/60'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Page Button (>>) */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(effectiveTotalPages, currentPage + 1))}
          disabled={currentPage >= effectiveTotalPages}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
          title="Next Page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
