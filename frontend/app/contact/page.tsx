"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Send, CheckCircle2, ArrowLeft, Headphones, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState<{ success: boolean; text: string; ticketId?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setLoading(true);
    setResponseMsg(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setResponseMsg({
          success: true,
          text: data.message || "Message sent successfully!",
          ticketId: data.ticketId,
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setResponseMsg({
          success: false,
          text: data.message || "Failed to submit ticket. Please try again.",
        });
      }
    } catch (error) {
      console.error("[Contact Form Error]", error);
      setResponseMsg({
        success: false,
        text: "Could not connect to SmartElectronics support server. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh text-slate-900 pb-20">
      
      {/* Hero Banner Header */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white border-b border-slate-800 py-14 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 hover:text-white transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Headphones className="h-5 w-5 text-indigo-400" />
            <span className="text-xs font-black uppercase tracking-wider text-indigo-400">24/7 Priority Support</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            How can SmartElectronics help you today?
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl mx-auto">
            Have questions about a hardware order, warranty claim, or technical specifications? Send us a ticket and our tech support team will respond within 24 hours.
          </p>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Info Cards */}
        <div className="space-y-4 lg:col-span-1">
          
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-2xs mb-3">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">Email Support</h3>
            <p className="text-sm font-black text-slate-900">support@smartelectronics.com</p>
            <p className="text-[11px] text-slate-500">Mon – Sat • 24 hour average response</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-2xs mb-3">
              <Phone className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">Helpline Hotline</h3>
            <p className="text-sm font-black text-slate-900">+91-1800-889-7627</p>
            <p className="text-[11px] text-slate-500">Toll-free • Mon–Sun 9 AM – 9 PM IST</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-2xs mb-3">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">Headquarters</h3>
            <p className="text-xs font-extrabold text-slate-900">SmartElectronics Corporate Tech Hub</p>
            <p className="text-[11px] text-slate-500">Lunawada, Mahisagar - 387001, Gujarat, India</p>
          </div>

        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-black text-slate-950">Send a Support Ticket</h2>
            </div>

            {responseMsg && (
              <div
                className={`mb-6 rounded-2xl p-4 text-xs font-semibold flex items-start gap-3 ${
                  responseMsg.success
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border border-rose-200 text-rose-800"
                }`}
              >
                {responseMsg.success && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />}
                <div>
                  <p>{responseMsg.text}</p>
                  {responseMsg.ticketId && (
                    <p className="mt-1 text-[11px] font-bold text-emerald-900">
                      Ticket Reference ID: <span className="font-mono bg-emerald-100 px-2 py-0.5 rounded">{responseMsg.ticketId}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-extrabold text-slate-700 mb-1">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Kiran Thakor"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-extrabold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className="block text-xs font-extrabold text-slate-700 mb-1">
                  Subject / Inquiry Type
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Order Delivery Status / Refund Inquiry"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-extrabold text-slate-700 mb-1">
                  Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your request or question in detail..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 px-6 py-3.5 text-xs font-black text-white shadow-md hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>Submitting Ticket...</span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit Support Ticket</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
