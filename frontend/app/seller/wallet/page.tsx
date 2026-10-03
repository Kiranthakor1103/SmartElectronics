"use client";

import { useEffect, useState, useCallback } from "react";
import { Landmark, ArrowUpRight, CheckCircle2, AlertCircle, History } from "lucide-react";
import { useToast } from "@/app/components/ToastProvider";

interface Payout {
  _id: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed";
  bankAccount: string;
  bankIfsc: string;
  createdAt: string;
}

interface SubOrderRecord {
  deliveryStatus?: string;
  payoutStatus?: string;
  netPayout?: number;
}

export default function SellerWalletPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  
  const [balances, setBalances] = useState({
    totalEarnings: 0,
    unsettled: 0,
    processing: 0,
    settled: 0,
  });

  const loadWalletData = useCallback(async () => {
    try {
      const [ordersRes, payoutsRes] = await Promise.all([
        fetch("/api/seller/orders"),
        fetch("/api/seller/payouts"),
      ]);

      let ordersList: SubOrderRecord[] = [];
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        ordersList = ordersData.orders || [];
      }

      if (payoutsRes.ok) {
        const payoutsData = await payoutsRes.json();
        setPayouts(payoutsData.payouts || []);
      }

      // Compute wallet balance breakdown from actual suborders
      let total = 0;
      let pending = 0;
      let proc = 0;
      let paid = 0;

      ordersList.forEach((order: SubOrderRecord) => {
        if (order.deliveryStatus === "delivered" && typeof order.netPayout === "number") {
          total += order.netPayout;
          if (order.payoutStatus === "pending") {
            pending += order.netPayout;
          } else if (order.payoutStatus === "processing") {
            proc += order.netPayout;
          } else if (order.payoutStatus === "paid") {
            paid += order.netPayout;
          }
        }
      });

      setBalances({
        totalEarnings: total,
        unsettled: pending,
        processing: proc,
        settled: paid,
      });
    } catch {
      toast("Failed to load wallet statistics", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadWalletData();
  }, [loadWalletData]);

  const handleRequestPayout = async () => {
    if (balances.unsettled <= 0) {
      toast("You do not have any pending earnings eligible for settlement", "error");
      return;
    }

    setRequesting(true);
    try {
      const res = await fetch("/api/seller/payouts/request", {
        method: "POST",
      });

      const data = await res.json();
      if (res.ok) {
        toast("Bank settlement request submitted!", "success");
        void loadWalletData();
      } else {
        toast(data.message || "Failed to process settlement", "error");
      }
    } catch {
      toast("An error occurred during submission", "error");
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-650" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">Finances & Wallet</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Track platform earnings, review payouts, and request settlements to your verified bank account.
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Available for Settlement */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-indigo-50/30 p-6 shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Landmark className="h-24 w-24 text-indigo-400" />
          </div>
          <span className="text-sm font-semibold text-indigo-600">Available for Payout</span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-black text-indigo-700">₹{balances.unsettled.toLocaleString("en-IN")}</span>
          </div>
          <p className="mt-1.5 text-xs text-indigo-550">Settlable earnings from delivered orders</p>
          <button
            onClick={handleRequestPayout}
            disabled={requesting || balances.unsettled <= 0}
            className="mt-6 w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-bold text-white transition active:scale-95 disabled:opacity-50 shadow-md shadow-indigo-600/10"
          >
            <ArrowUpRight className="h-4.5 w-4.5" />
            {requesting ? "Requesting Settlement…" : "Request Bank Settlement"}
          </button>
        </div>

        {/* Card 2: Processing Settlement */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-sm font-semibold text-slate-500">Processing Balance</span>
          <div className="mt-4">
            <span className="text-4xl font-black text-slate-800">₹{balances.processing.toLocaleString("en-IN")}</span>
            <p className="mt-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">Awaiting bank verification</p>
          </div>
        </div>

        {/* Card 3: Already Settled */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-sm font-semibold text-slate-500">Settled to Bank</span>
          <div className="mt-4">
            <span className="text-4xl font-black text-slate-800">₹{balances.settled.toLocaleString("en-IN")}</span>
            <p className="mt-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">Paid to account</p>
          </div>
        </div>
      </div>

      {/* Settlement History */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <History className="h-5 w-5 text-indigo-650" />
          <h2 className="text-lg font-bold text-slate-800">Settlement Requests</h2>
        </div>

        {payouts.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-8 text-center">No settlement logs recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="pb-3 font-semibold">Request Date</th>
                  <th className="pb-3 font-semibold">Payout ID</th>
                  <th className="pb-3 font-semibold">Bank Account</th>
                  <th className="pb-3 font-semibold">IFSC Code</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payouts.map((pay) => (
                  <tr key={pay._id}>
                    <td className="py-3.5 font-medium text-slate-700">
                      {new Date(pay.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 font-mono text-xs text-slate-500">{pay._id.toUpperCase()}</td>
                    <td className="py-3.5 font-mono text-xs">•••• {pay.bankAccount.slice(-4)}</td>
                    <td className="py-3.5 font-mono text-xs">{pay.bankIfsc}</td>
                    <td className="py-3.5 text-slate-800 font-semibold">₹{pay.amount.toLocaleString("en-IN")}</td>
                    <td className="py-3.5">
                      {pay.status === "completed" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> Completed
                        </span>
                      ) : pay.status === "processing" || pay.status === "pending" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 animate-pulse">
                          <AlertCircle className="h-3 w-3" /> {pay.status === "pending" ? "Pending Approval" : "Processing"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                          <AlertCircle className="h-3 w-3" /> Rejected
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
