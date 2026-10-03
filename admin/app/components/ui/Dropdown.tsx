"use client";

import { useState, useRef, useEffect, ReactNode, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronUp, Check } from "lucide-react";

export interface DropdownOption<T = string | number> {
  label: string;
  value: T;
  icon?: ReactNode;
  badge?: string;
  badgeClassName?: string;
  colorDot?: string;
}

export interface DropdownProps<T = string | number> {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  icon?: ReactNode;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  direction?: "auto" | "up" | "down";
  align?: "auto" | "left" | "right";
  usePortal?: boolean;
  minMenuWidth?: number;
}

export function CustomDropdown<T extends string | number>({
  options,
  value,
  onChange,
  label,
  icon,
  placeholder = "Select",
  className = "",
  buttonClassName = "",
  menuClassName = "",
  disabled = false,
  size = "md",
  direction = "auto",
  align = "auto",
  usePortal = true,
  minMenuWidth,
}: DropdownProps<T>) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    minWidth: number;
    openUpwards: boolean;
    maxHeight: number;
  }>({
    minWidth: 190,
    openUpwards: false,
    maxHeight: 280,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  // Compute position (upwards vs downwards, left vs right) based on viewport space
  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimatedMenuHeight = 240;

    let shouldOpenUp = false;
    if (direction === "up") {
      shouldOpenUp = true;
    } else if (direction === "down") {
      shouldOpenUp = false;
    } else {
      // Auto: Only open up if space below is too tight AND space above has more room
      shouldOpenUp = spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow;
    }

    const defaultMin = size === "sm" ? 70 : 180;
    const minW = minMenuWidth !== undefined ? minMenuWidth : Math.max(rect.width, defaultMin);
    let shouldAlignRight = false;
    if (align === "right") {
      shouldAlignRight = true;
    } else if (align === "left") {
      shouldAlignRight = false;
    } else {
      // Auto: Check if left-aligned menu will overflow viewport
      shouldAlignRight = rect.left + minW > viewportWidth - 16;
    }

    const availableHeight = shouldOpenUp
      ? Math.max(120, spaceAbove - 16)
      : Math.max(120, spaceBelow - 16);

    const calculatedCoords: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
      minWidth: number;
      openUpwards: boolean;
      maxHeight: number;
    } = {
      minWidth: minW,
      openUpwards: shouldOpenUp,
      maxHeight: Math.min(320, availableHeight),
    };

    if (shouldOpenUp) {
      calculatedCoords.bottom = viewportHeight - rect.top + 6;
    } else {
      calculatedCoords.top = rect.bottom + 6;
    }

    if (shouldAlignRight) {
      calculatedCoords.right = Math.max(12, viewportWidth - rect.right);
    } else {
      calculatedCoords.left = Math.max(12, rect.left);
    }

    setCoords(calculatedCoords);
  }, [direction, align]);

  // Handle outside clicks
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Update position on scroll or resize when open
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleReposition = () => updatePosition();
      window.addEventListener("scroll", handleReposition, true);
      window.addEventListener("resize", handleReposition);
      return () => {
        window.removeEventListener("scroll", handleReposition, true);
        window.removeEventListener("resize", handleReposition);
      };
    }
  }, [isOpen, updatePosition]);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen((prev) => !prev);
  };

  const sizeClasses =
    size === "sm"
      ? "px-2.5 py-1 text-xs rounded-lg gap-1.5"
      : "px-3.5 py-2 text-xs font-bold rounded-xl gap-2.5";

  const menuElement = isOpen ? (
    <div
      ref={menuRef}
      style={
        usePortal && mounted
          ? {
              position: "fixed",
              top: coords.top !== undefined ? `${coords.top}px` : undefined,
              bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
              left: coords.left !== undefined ? `${coords.left}px` : undefined,
              right: coords.right !== undefined ? `${coords.right}px` : undefined,
              minWidth: `${coords.minWidth}px`,
              maxHeight: `${coords.maxHeight}px`,
              zIndex: 99999,
            }
          : undefined
      }
      className={`${
        usePortal && mounted
          ? ""
          : `absolute ${coords.right !== undefined ? "right-0" : "left-0"} ${
              coords.openUpwards ? "bottom-full mb-1.5" : "top-full mt-1.5"
            } z-50`
      } w-max max-w-sm rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md p-1.5 shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150 ${menuClassName}`}
    >
      <div
        className="overflow-y-auto space-y-0.5 custom-scrollbar pr-0.5"
        style={{ maxHeight: `${coords.maxHeight - 12}px` }}
      >
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold transition-all cursor-pointer select-none ${
                isSelected
                  ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                {option.colorDot && (
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${option.colorDot}`}
                  />
                )}
                {option.icon && <span className="shrink-0">{option.icon}</span>}
                <span className="truncate">{option.label}</span>
                {option.badge && (
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                      option.badgeClassName || "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {option.badge}
                  </span>
                )}
              </div>
              {isSelected && (
                <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0 ml-2" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  ) : null;

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`flex items-center justify-between bg-white border border-slate-200 text-slate-800 hover:border-indigo-400 hover:bg-slate-50/80 transition-all shadow-2xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10 cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none ${sizeClasses} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.colorDot && (
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${selectedOption.colorDot}`}
            />
          )}
          {icon && <span className="text-indigo-600 shrink-0">{icon}</span>}
          {label && <span className="text-slate-400 font-semibold">{label}:</span>}
          <span className="truncate max-w-[150px] font-bold">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                selectedOption.badgeClassName || "bg-slate-100 text-slate-600"
              }`}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>

        {coords.openUpwards && isOpen ? (
          <ChevronUp
            className="h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-200 text-indigo-600"
          />
        ) : (
          <ChevronDown
            className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-indigo-600" : ""
            }`}
          />
        )}
      </button>

      {/* Render Popover via Portal if available to escape table overflow clipping */}
      {usePortal && mounted && typeof document !== "undefined"
        ? createPortal(menuElement, document.body)
        : menuElement}
    </div>
  );
}

export default CustomDropdown;
