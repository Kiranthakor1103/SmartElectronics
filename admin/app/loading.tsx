import { Loader, AdminStatsSkeleton } from "@/app/components/ui/Loader";

export default function AdminRootLoading() {
  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-7 w-48 rounded-xl bg-slate-200 animate-pulse mb-2" />
          <div className="h-4 w-64 rounded bg-slate-100 animate-pulse" />
        </div>
      </div>

      <AdminStatsSkeleton />

      <div className="mt-8">
        <Loader
          size="lg"
          label="Loading Control Center..."
          sublabel="Aggregating platform revenue, orders, and merchant analytics"
        />
      </div>
    </div>
  );
}
