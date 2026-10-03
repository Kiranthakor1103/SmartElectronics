import { Loader } from "@/app/components/ui/Loader";

export default function SellerLoading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Loader
        size="lg"
        label="Loading Merchant Portal..."
        sublabel="Verifying seller permissions and store statistics"
      />
    </div>
  );
}
