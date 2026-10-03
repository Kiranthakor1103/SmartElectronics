'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  itemName?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Confirmation',
  itemName,
  message,
  confirmText = 'Yes, Delete',
  cancelText = 'Cancel',
  loading = false,
}: DeleteConfirmModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const defaultMessage = itemName
    ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
    : 'Are you sure you want to delete this item? This action cannot be undone.';

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
        {/* Top Header Glow */}
        <div className="bg-gradient-to-b from-rose-50 to-transparent p-6 pb-2 text-center relative">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition disabled:opacity-30 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shadow-md shadow-rose-500/10">
            <Trash2 className="w-7 h-7" />
          </div>

          <h3 id="delete-modal-title" className="mt-4 text-lg font-black text-slate-900 tracking-tight">
            {title}
          </h3>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-4 text-center space-y-3">
          <p className="text-sm text-slate-500 leading-relaxed font-medium">
            {message || defaultMessage}
          </p>

          {itemName && (
            <div className="inline-block max-w-full truncate px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 font-mono">
              {itemName}
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-rose-600 bg-rose-50/80 border border-rose-100 py-1.5 px-3 rounded-xl">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>This permanent deletion cannot be recovered</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-6 pt-2 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            loading={loading}
            className="flex-1"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <span>{confirmText}</span>
          </Button>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
