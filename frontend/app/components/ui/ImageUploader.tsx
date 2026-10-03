'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  UploadCloud,
  Link as LinkIcon,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  FileImage,
} from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
  helperText?: string;
}

export default function ImageUploader({
  value,
  onChange,
  error,
  label = 'Product Image',
  required = false,
  helperText = 'Upload a high-resolution image from your computer or paste an external URL',
}: ImageUploaderProps) {
  const [mode, setMode] = useState<'file' | 'url'>('file');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const uploadFile = async (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setUploadError('Invalid format. Please select a PNG, JPG, WebP, GIF, or SVG image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB limit. Please select a smaller image.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    setFileName(file.name);
    setFileSize(formatFileSize(file.size));
    setPreviewError(false);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('token') || localStorage.getItem('authToken')
          : null;

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success && data.url) {
        onChange(data.url);
      } else {
        setUploadError(data.message || 'Failed to upload image to server.');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Network error while uploading image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void uploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      void uploadFile(file);
    }
  };

  const handleClear = () => {
    onChange('');
    setFileName(null);
    setFileSize(null);
    setUploadError(null);
    setPreviewError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isLocalUpload = value?.startsWith('/uploads/');

  return (
    <div className="space-y-3">
      {/* Top Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <label className="font-bold text-slate-800 text-xs flex items-center gap-1">
            <span>{label}</span>
            {required && <span className="text-rose-500 font-black">*</span>}
          </label>
          {helperText && <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>}
        </div>

        {/* Mode Switcher Tabs */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode('file')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'file'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'url'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Web URL</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* MODE 1: Direct File Upload Zone */}
      {mode === 'file' && (
        <div>
          {!value ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                  : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/60 bg-slate-50/30'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-xs">
                {isUploading ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-slate-800">
                  {isUploading ? (
                    <span className="text-indigo-600 font-extrabold animate-pulse">Uploading image to server...</span>
                  ) : (
                    <>
                      <span className="text-indigo-600 font-extrabold hover:underline">Click to browse from your device</span> or drag and drop
                    </>
                  )}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">
                  Supports PNG, JPG, JPEG, WebP, GIF, or SVG (Max 10MB)
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold">
                <FileImage className="w-3 h-3 text-slate-400" />
                <span>Stores securely on server uploads</span>
              </div>
            </div>
          ) : (
            /* Uploaded Preview Card */
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 shadow-xs">
                {!previewError ? (
                  <Image
                    src={value}
                    alt="Uploaded preview"
                    fill
                    unoptimized={value.startsWith('data:') || value.startsWith('/uploads/')}
                    className="object-contain p-1"
                    onError={() => setPreviewError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-[10px]">
                    <AlertCircle className="w-5 h-5 text-rose-400 mb-1" />
                    <span>Failed to load</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3" />
                    {isLocalUpload ? 'Uploaded to Server' : 'Active Image'}
                  </span>
                  {fileSize && (
                    <span className="text-[10px] font-semibold text-slate-400">{fileSize}</span>
                  )}
                </div>

                <p className="text-xs font-bold text-slate-800 truncate mt-1">
                  {fileName || value.split('/').pop() || 'product-image.jpg'}
                </p>
                <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5 max-w-sm">
                  {value}
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Replace File
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition"
                  >
                    <X className="w-3 h-3" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: Web URL Input */}
      {mode === 'url' && (
        <div className="space-y-3">
          <div className="relative">
            <input
              type="url"
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                setPreviewError(false);
              }}
              placeholder="https://images.unsplash.com/photo-... or https://..."
              className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 pr-10 text-slate-900 outline-none transition font-medium text-xs ${
                error
                  ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                  : 'border-slate-200 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10'
              }`}
            />
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Preview for URL Mode */}
          {value && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 flex items-center gap-3.5">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 shadow-xs">
                {!previewError ? (
                  <Image
                    src={value}
                    alt="Web URL preview"
                    fill
                    unoptimized
                    className="object-contain p-1"
                    onError={() => setPreviewError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-rose-500 text-[9px] text-center p-1 font-bold">
                    <AlertCircle className="w-4 h-4 mb-0.5" />
                    Invalid URL
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 text-xs">
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                  <Eye className="w-3 h-3 text-indigo-500" />
                  <span>External Image URL Preview</span>
                </div>
                <p className="font-mono text-[11px] text-slate-600 truncate mt-0.5">{value}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Errors */}
      {(uploadError || error) && (
        <p className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
          <span>{uploadError || error}</span>
        </p>
      )}
    </div>
  );
}
