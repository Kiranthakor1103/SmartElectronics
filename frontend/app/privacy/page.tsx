import Link from "next/link";
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | SmartElectronics",
  description: "SmartElectronics Privacy Policy, Consumer Data Protection, and SSL Security Standards",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-mesh text-slate-900 pb-20">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white border-b border-slate-800 py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 hover:text-white transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-6 w-6 text-cyan-400" />
            <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
              Legal &amp; Data Security
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Last updated: September 2026 • Your personal data security is our top priority.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-10 space-y-8">
        {/* Banner Box */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 rounded-3xl p-6 text-white shadow-xl flex items-start gap-4">
          <Lock className="h-8 w-8 shrink-0 text-amber-300 mt-1" />
          <div>
            <h2 className="text-lg font-black">256-Bit SSL Encrypted Vault Protection</h2>
            <p className="text-xs text-blue-100 mt-1 leading-relaxed">
              At SmartElectronics, we adhere to strict international privacy standards. Your personal credentials, payment
              methods, warranty records, and delivery addresses are encrypted and stored in secure cloud data vaults.
            </p>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-600" /> 1. Information We Collect
            </h3>
            <p>
              When you register, place an order, or browse SmartElectronics, we collect necessary account details
              including your name, email address, phone number, shipping address, and encrypted payment tokens (processed
              via Stripe).
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-6">
            <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" /> 2. How We Use Your Information
            </h3>
            <p>
              Your data is exclusively used to process electronics orders, facilitate express deliveries, provide order
              status updates via email, issue GST tax invoices for warranty verification, prevent fraudulent checkouts,
              and personalize your shopping recommendations. We do not sell or lease your personal information to third
              parties.
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-6">
            <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" /> 3. Payment Processing &amp; Security
            </h3>
            <p>
              All card transactions are handled directly through certified payment gateways (Stripe PCI-DSS Level 1
              compliant). SmartElectronics servers never store raw credit card numbers, CVVs, or banking passwords.
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-6">
            <h3 className="text-base font-black text-slate-950">4. Your Rights &amp; Data Choices</h3>
            <p>
              You have the right to access, update, or delete your account information at any time through your Profile
              dashboard or by contacting our 24/7 support team at{" "}
              <a
                href="mailto:support@smartelectronics.com"
                className="text-blue-600 font-bold hover:underline"
              >
                support@smartelectronics.com
              </a>
              .
            </p>
          </section>
        </div>

        {/* Back Link */}
        <div className="text-center pt-4">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-8 py-3.5 text-xs font-black text-white shadow-md hover:scale-105 transition-all"
          >
            Have Questions? Contact Tech Support →
          </Link>
        </div>
      </div>
    </div>
  );
}
