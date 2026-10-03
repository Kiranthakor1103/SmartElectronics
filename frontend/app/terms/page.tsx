import Link from "next/link";
import { FileText, CheckCircle2, ShieldAlert, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | SmartElectronics",
  description: "SmartElectronics Customer Terms of Service, Warranty Rights, and Merchant Standards",
};

export default function TermsPage() {
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
            <FileText className="h-6 w-6 text-cyan-400" />
            <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
              User Agreement &amp; Store Terms
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Effective Date: September 2026 • Terms &amp; Conditions governing your use of SmartElectronics.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-10 space-y-8">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600" /> 1. Acceptance of Terms
            </h3>
            <p>
              By accessing, browsing, or purchasing products on SmartElectronics, you agree to be bound by these Terms of
              Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-6">
            <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600" /> 2. Ordering &amp; Pricing Policy
            </h3>
            <p>
              All prices listed on SmartElectronics are inclusive of applicable GST unless stated otherwise. We reserve
              the right to modify prices or correct technical typographical errors without prior notice. An order is
              confirmed once payment authorization is completed.
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-6">
            <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-blue-600" /> 3. 7-Day Defective Replacement Guarantee
            </h3>
            <p>
              Hardware devices purchased through SmartElectronics are backed by a 7-day replacement guarantee against
              manufacturing defects, damage in transit, or missing sealed accessories. Replacement requests can be
              initiated directly from your Order History page. Please review our{" "}
              <Link href="/warranty" className="text-blue-600 font-bold hover:underline">
                Brand Warranty Policy
              </Link>{" "}
              for complete details.
            </p>
          </section>

          <section className="space-y-2 border-t border-slate-100 pt-6">
            <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600" /> 4. Authorized Seller &amp; Merchant Standards
            </h3>
            <p>
              Merchants selling on SmartElectronics must maintain strict OEM authenticity standards, ship orders within
              24 hours with certified shockproof packaging, and supply genuine, sealed products with valid brand
              warranties. Violation of policies will result in immediate termination of merchant privileges.
            </p>
          </section>
        </div>

        {/* Back Link */}
        <div className="text-center pt-4">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-8 py-3.5 text-xs font-black text-white shadow-md hover:scale-105 transition-all"
          >
            Return to Electronics Catalog →
          </Link>
        </div>
      </div>
    </div>
  );
}
