import { ProductGridSkeleton, Loader } from "@/app/components/ui/Loader";

export default function DealsLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <Loader
            size="lg"
            label="Finding today's mega deals..."
            sublabel="Scanning top brands with verified discounts"
          />
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
