"use client";

import { useEffect, useState } from "react";
import { Landmark, CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/app/components/ToastProvider";

interface Payout {
  _id: string;
  sellerId: {
    _id: string;
    companyName: string;
  };
  amount: number;
  status: "pending" | "processing" | "completed" | "failed";
  bankAccount: string;
  bankIfsc: string;
  createdAt: string;
}

export default function AdminPayoutsPage() {
  const { toast } = useToast();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchPayouts = async () => {
    try {
      const res = await fetch("/api/admin/payouts");
      if (res.ok) {
        const data = await res.json();
        setPayouts(data.payouts || []);
      }
    } catch (err) {
      toast("Failed to load payout settlements", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPayouts();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/payouts/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        toast(`Payout settlement marked as ${newStatus}!`, "success");
        void fetchPayouts();
      } else {
        toast(data.message || "Failed to update status", "error");
      }
    } catch (err) {
      toast("An error occurred during update", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">Bank Payouts & Settlements</h1>
          <p className="mt-1.5 text-sm text-slate-555">
            Review settlement requests, verify vendor bank coordinates, and sign off on completed bank transfers.
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            void fetchPayouts();
          }}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition active:scale-95 shadow-sm"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-650" />
        </div>
      ) : payouts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 border-dashed bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 mb-4">
            <Landmark className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No payouts logged</h3>
          <p className="mt-1.5 text-sm text-slate-500 max-w-sm mx-auto">
            Once sellers request settlements, their transactions will appear here for audit review.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-105 bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 font-semibold">Request Date</th>
                <th className="px-6 py-4 font-semibold">Merchant</th>
                <th className="px-6 py-4 font-semibold">Bank details</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Approve / Reject Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payouts.map((pay) => (
                <tr key={pay._id} className="hover:bg-slate-50/30 transition-colors">
                  {/* Date */}
                  <td className="px-6 py-4 font-medium text-slate-600">
                    {new Date(pay.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  {/* Merchant */}
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {pay.sellerId?.companyName || "Unknown Seller"}
                  </td>
                  {/* Bank Details */}
                  <td className="px-6 py-4">
                    <p className="font-mono text-xs text-slate-700 font-medium">A/C: {pay.bankAccount}</p>
                    <p className="font-mono text-[10px] text-slate-400 mt-0.5">IFSC: {pay.bankIfsc}</p>
                  </td>
                  {/* Amount */}
                  <td className="px-6 py-4 font-extrabold text-slate-800">
                    ₹{pay.amount.toLocaleString("en-IN")}
                  </td>
                  {/* Status */}
                  <td className="px-6 py-4">
                    {pay.status === "completed" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> Completed
                      </span>
                    ) : pay.status === "processing" || pay.status === "pending" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                        <AlertCircle className="h-3 w-3 animate-pulse" /> {pay.status === "pending" ? "Pending Approval" : "Processing"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                        <XCircle className="h-3 w-3" /> Failed
                      </span>
                    )}
                  </td>
                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    {updatingId === pay._id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border border-slate-200 border-t-indigo-600 ml-auto mr-4" />
                    ) : pay.status === "completed" || pay.status === "failed" ? (
                      <span className="text-xs text-slate-400 font-semibold italic">Processed</span>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleUpdateStatus(pay._id, "completed")}
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-555 px-3 py-1.5 text-xs font-bold text-white transition active:scale-95 shadow-md shadow-emerald-600/10"
                        >
                          Approve Paid
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(pay._id, "failed")}
                          className="rounded-lg bg-rose-600 hover:bg-rose-555 px-3 py-1.5 text-xs font-bold text-white transition active:scale-95 shadow-md shadow-rose-600/10"
                        >
                          Reject
                        </button>
                      </div>
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
