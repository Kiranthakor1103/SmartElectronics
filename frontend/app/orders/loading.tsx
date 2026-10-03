import { Loader } from "@/app/components/ui/Loader";

export default function OrdersLoading() {
  return (
    <div className="min-h-[75vh] bg-slate-50/50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <div className="h-8 w-44 rounded-xl bg-slate-200 animate-pulse mb-2" />
          <div className="h-4 w-64 rounded bg-slate-100 animate-pulse" />
        </div>
        <Loader
          size="lg"
          label="Fetching your order history..."
          sublabel="Loading tracking info and delivery milestones"
        />
        <div className="space-y-4 mt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs animate-pulse space-y-4"
            >
              <div className="flex justify-between">
                <div className="h-4 w-36 rounded bg-slate-200" />
                <div className="h-4 w-20 rounded bg-indigo-100" />
              </div>
              <div className="flex gap-4">
                <div className="h-16 w-16 rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-3 w-1/3 rounded bg-slate-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
