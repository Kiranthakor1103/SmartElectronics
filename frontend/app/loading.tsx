import { Loader } from "@/app/components/ui/Loader";

export default function RootLoading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Loader
        size="lg"
        label="Loading SmartElectronics..."
        sublabel="Connecting to tech superstore services"
      />
    </div>
  );
}
