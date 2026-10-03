import { Loader } from "./Loader";

export function Spinner({
  label,
  size = "md",
  fullPage = false,
}: {
  label?: string;
  size?: "sm" | "md" | "lg" | "xl";
  fullPage?: boolean;
}) {
  return <Loader label={label} size={size} fullPage={fullPage} />;
}

export { Loader } from "./Loader";
