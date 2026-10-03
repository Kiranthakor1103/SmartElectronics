import { Loader, AdminTableSkeleton } from "@/app/components/ui/Loader";

export default function AdminProductsLoading() {
  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-7 w-48 rounded-xl bg-slate-200 animate-pulse mb-2" />
          <div className="h-4 w-72 rounded bg-slate-100 animate-pulse" />
        </div>
      </div>

      <Loader
        size="md"
        label="Loading catalog inventory..."
        sublabel="Querying products, brands, and stock levels"
      />

      <AdminTableSkeleton rows={7} cols={6} />
    </div>
  );
}
