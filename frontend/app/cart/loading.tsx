import { Loader } from "@/app/components/ui/Loader";

export default function CartLoading() {
  return (
    <div className="min-h-[70vh] bg-slate-50/50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <Loader
          size="lg"
          label="Preparing your shopping cart..."
          sublabel="Verifying prices, coupon codes, and item availability"
        />
      </div>
    </div>
  );
}
