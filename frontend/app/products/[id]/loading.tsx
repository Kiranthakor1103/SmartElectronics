import { Loader } from "@/app/components/ui/Loader";

export default function ProductDetailLoading() {
  return (
    <div className="min-h-[80vh] bg-slate-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-sm animate-pulse mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Gallery Skeleton */}
            <div className="flex flex-col gap-4">
              <div className="h-80 sm:h-96 w-full rounded-2xl bg-slate-100 flex items-center justify-center">
                <Loader size="md" label="Loading product specifications..." />
              </div>
              <div className="flex gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 w-16 rounded-xl bg-slate-100" />
                ))}
              </div>
            </div>

            {/* Info Skeleton */}
            <div className="space-y-4">
              <div className="h-4 w-28 rounded bg-indigo-100" />
              <div className="h-8 w-3/4 rounded-xl bg-slate-200" />
              <div className="h-5 w-40 rounded bg-slate-100" />
              <div className="h-10 w-48 rounded-xl bg-slate-200 mt-6" />
              <div className="space-y-2 pt-4">
                <div className="h-4 w-full rounded bg-slate-100" />
                <div className="h-4 w-5/6 rounded bg-slate-100" />
                <div className="h-4 w-4/6 rounded bg-slate-100" />
              </div>
              <div className="flex gap-4 pt-6">
                <div className="h-12 flex-1 rounded-2xl bg-slate-200" />
                <div className="h-12 flex-1 rounded-2xl bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
