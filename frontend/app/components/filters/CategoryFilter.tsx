"use client";

import React, { useState } from "react";
import { Filter, Tag, Check, ChevronDown, ChevronUp } from "lucide-react";

export interface CategoryFilterProps {
  category: string;
  subCategory?: string;
  categories: string[];
  availableSubCategories: string[];
  onSelectCategory: (category: string) => void;
  onSelectSubCategory: (subCategory: string) => void;
}

export function CategoryFilter({
  category,
  subCategory,
  categories,
  availableSubCategories,
  onSelectCategory,
  onSelectSubCategory,
}: CategoryFilterProps) {
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [subCategoriesOpen, setSubCategoriesOpen] = useState(true);

  const isAllCategory = !category || category.toLowerCase() === "all";

  return (
    <div className="space-y-0.5">
      {/* ── Main Category Section ── */}
      <div className="border-b border-slate-100 last:border-none">
        <button
          type="button"
          onClick={() => setCategoriesOpen((v) => !v)}
          className="flex w-full items-center justify-between py-3 text-left group"
          aria-expanded={categoriesOpen}
        >
          <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 group-hover:text-blue-600 transition">
            <Filter className="h-3 w-3 text-blue-600" />
            Categories
          </span>
          {categoriesOpen ? (
            <ChevronUp className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 transition" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 transition" />
          )}
        </button>

        {categoriesOpen && (
          <div className="pb-3.5 space-y-0.5 max-h-52 overflow-y-auto custom-scrollbar pr-1">
            {/* All Categories Option */}
            <label className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                  isAllCategory
                    ? "border-blue-600 bg-blue-600"
                    : "border-slate-300 bg-white group-hover:border-blue-400"
                }`}
              >
                {isAllCategory && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
              </span>
              <button
                type="button"
                onClick={() => onSelectCategory("all")}
                className={`text-xs font-semibold w-full text-left transition ${
                  isAllCategory ? "text-blue-700 font-extrabold" : "text-slate-700 hover:text-blue-700"
                }`}
              >
                All Electronics
              </button>
            </label>

            {/* Individual Category List */}
            {categories.map((cat) => {
              const isActive = category.toLowerCase() === cat.toLowerCase();
              return (
                <label key={cat} className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                      isActive
                        ? "border-blue-600 bg-blue-600"
                        : "border-slate-300 bg-white group-hover:border-blue-400"
                    }`}
                  >
                    {isActive && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectCategory(isActive ? "all" : cat)}
                    className={`text-xs font-semibold w-full text-left transition ${
                      isActive ? "text-blue-700 font-extrabold" : "text-slate-700 hover:text-blue-700"
                    }`}
                  >
                    {cat}
                  </button>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Sub-Categories Section (Visible when specific category is active) ── */}
      {!isAllCategory && availableSubCategories.length > 0 && (
        <div className="border-b border-slate-100 last:border-none">
          <button
            type="button"
            onClick={() => setSubCategoriesOpen((v) => !v)}
            className="flex w-full items-center justify-between py-3 text-left group"
            aria-expanded={subCategoriesOpen}
          >
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 group-hover:text-blue-600 transition">
              <Tag className="h-3 w-3 text-blue-600" />
              Sub-Category
            </span>
            {subCategoriesOpen ? (
              <ChevronUp className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 transition" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 transition" />
            )}
          </button>

          {subCategoriesOpen && (
            <div className="pb-3.5 space-y-0.5 max-h-44 overflow-y-auto custom-scrollbar pr-1">
              {/* All Subcategories Option */}
              <label className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${
                    !subCategory || subCategory === "all"
                      ? "border-blue-600 bg-blue-600"
                      : "border-slate-300 bg-white group-hover:border-blue-400"
                  }`}
                >
                  {(!subCategory || subCategory === "all") && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => onSelectSubCategory("all")}
                  className="text-xs font-semibold text-slate-700 hover:text-blue-700 w-full text-left"
                >
                  All {category}
                </button>
              </label>

              {/* Subcategories items */}
              {availableSubCategories.map((sub) => {
                const isActive = subCategory?.toLowerCase() === sub.toLowerCase();
                return (
                  <label key={sub} className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${
                        isActive
                          ? "border-blue-600 bg-blue-600"
                          : "border-slate-300 bg-white group-hover:border-blue-400"
                      }`}
                    >
                      {isActive && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectSubCategory(isActive ? "all" : sub)}
                      className={`text-xs font-semibold w-full text-left transition ${
                        isActive ? "text-blue-700 font-extrabold" : "text-slate-700 hover:text-blue-700"
                      }`}
                    >
                      {sub}
                    </button>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CategoryFilter;
