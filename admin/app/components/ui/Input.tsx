"use client";

import { forwardRef, InputHTMLAttributes, ReactNode } from "react";
import { Search, X } from "lucide-react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  requiredBadge?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      requiredBadge,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <label htmlFor={inputId} className="flex items-center gap-1">
              <span>{label}</span>
              {(requiredBadge || props.required) && (
                <span className="text-rose-500 font-black">*</span>
              )}
            </label>
          </div>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-xl border bg-slate-50/70 py-2 text-xs font-semibold text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-4 ${
              leftIcon ? "pl-10" : "pl-3.5"
            } ${rightIcon ? "pr-10" : "pr-3.5"} ${
              error
                ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/10"
                : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10"
            } ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 text-slate-400 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-[11px] font-bold text-rose-600 animate-fade-in">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  className = "",
  ...props
}: SearchInputProps) {
  const handleClear = () => {
    onChange("");
    if (onClear) onClear();
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-9 text-xs font-semibold text-slate-900 placeholder-slate-400 transition-all focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
        {...props}
      />

      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export default Input;
