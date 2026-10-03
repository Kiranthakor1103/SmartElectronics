"use client";

import { useEffect, useState } from "react";
import { Check, X, ShieldAlert, Sparkles, Building, Landmark } from "lucide-react";
import { useToast } from "@/app/components/ToastProvider";

interface Seller {
  _id: string;
  companyName: string;
  gstNumber: string;
  panNumber: string;
  bankAccount: string;
  bankIfsc: string;
  kycStatus: "pending" | "approved" | "rejected";
  userId?: {
    name: string;
    email: string;
  };
}

export default function AdminSellersPage() {
  const { toast } = useToast();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSellers = async () => {
    try {
      const res = await fetch("/api/admin/sellers");
      if (res.ok) {
        const data = await res.json();
        setSellers(data.sellers || []);
      }
    } catch (err) {
      toast("Failed to load seller applications", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSellers();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/admin/sellers/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast(`KYC Status updated to ${newStatus}`);
        setSellers((prev) =>
          prev.map((s) => (s._id === id ? { ...s, kycStatus: newStatus } : s))
        );
      } else {
        const data = await res.json();
        toast(data.message || "Failed to update KYC status", "error");
      }
    } catch (err) {
      toast("An error occurred updating KYC status", "error");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">Merchant KYC Reviews</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Verify corporate GSTIN tax filings, PAN records, bank accounts, and approve merchant applications.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
        </div>
      ) : sellers.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 border-dashed bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 mb-4">
            <Building className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No onboarding applications</h3>
          <p className="mt-1.5 text-sm text-slate-500 max-w-sm mx-auto">
            No users have applied for a merchant account yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 font-semibold">Company Info</th>
                <th className="px-6 py-4 font-semibold">Corporate Tax Details</th>
                <th className="px-6 py-4 font-semibold">Settlement Bank</th>
                <th className="px-6 py-4 font-semibold">KYC Verification</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sellers.map((seller) => (
                <tr key={seller._id} className="hover:bg-slate-50/30 transition-colors">
                  {/* Company Info */}
                  <td className="px-6 py-4">
                    <div>
                      <span className="font-bold text-slate-800 block text-sm">{seller.companyName}</span>
                      {seller.userId && (
                        <span className="text-xs text-slate-400 font-medium block mt-0.5">
                          Applicant: {seller.userId.name} ({seller.userId.email})
                        </span>
                      )}
                    </div>
                  </td>
                  {/* Tax Filings */}
                  <td className="px-6 py-4 font-mono text-xs text-slate-600">
                    <div>GST: {seller.gstNumber}</div>
                    <div className="mt-1">PAN: {seller.panNumber}</div>
                  </td>
                  {/* Bank settlement */}
                  <td className="px-6 py-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <Landmark className="h-3.5 w-3.5 text-slate-400" />
                      Ac: {seller.bankAccount}
                    </div>
                    <div className="mt-1 text-slate-400 font-mono">IFSC: {seller.bankIfsc}</div>
                  </td>
                  {/* KYC Status badge */}
                  <td className="px-6 py-4">
                    {seller.kycStatus === "approved" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 text-xs font-semibold">
                        Approved
                      </span>
                    )}
                    {seller.kycStatus === "pending" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 text-xs font-semibold animate-pulse">
                        Pending Moderation
                      </span>
                    )}
                    {seller.kycStatus === "rejected" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-0.5 text-xs font-semibold">
                        Rejected
                      </span>
                    )}
                  </td>
                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    {seller.kycStatus === "pending" ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleUpdateStatus(seller._id, "approved")}
                          className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-555 text-white transition active:scale-95 shadow-md shadow-emerald-600/10"
                          title="Approve Application"
                        >
                          <Check className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(seller._id, "rejected")}
                          className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-rose-600 hover:bg-rose-555 text-white transition active:scale-95 shadow-md shadow-rose-600/10"
                          title="Reject Application"
                        >
                          <X className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Review Complete</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
