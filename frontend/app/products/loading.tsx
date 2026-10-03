import { ProductGridSkeleton, Loader } from "@/app/components/ui/Loader";

export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header Skeleton */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="h-7 w-56 rounded-xl bg-slate-200 animate-pulse mb-2" />
            <div className="h-4 w-72 rounded bg-slate-100 animate-pulse" />
          </div>
          <div className="h-10 w-44 rounded-xl bg-slate-200 animate-pulse" />
        </div>

        {/* Themed Loader Banner */}
        <div className="mb-8">
          <Loader
            size="md"
            label="Loading authentic products..."
            sublabel="Applying active filters and discount rates"
          />
        </div>

        {/* 4-Column Product Grid Skeleton */}
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
