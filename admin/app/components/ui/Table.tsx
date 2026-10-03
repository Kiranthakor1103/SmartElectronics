import { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function Table({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full text-left text-xs text-slate-700">{children}</table>
    </div>
  );
}

export function TableHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <thead
      className={`bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-wider border-b border-slate-200/80 ${className}`}
    >
      {children}
    </thead>
  );
}

export function TableBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <tbody className={`divide-y divide-slate-100 ${className}`}>{children}</tbody>;
}

export function TableRow({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={`hover:bg-slate-50/70 transition-colors ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableHead({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <th className={`p-4 font-black ${className}`}>{children}</th>;
}

export function TableCell({
  children,
  className = "",
  colSpan,
}: {
  children: ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td colSpan={colSpan} className={`p-4 ${className}`}>
      {children}
    </td>
  );
}

export function TableEmptyState({
  title = "No records found",
  description = "No items match your current filter criteria or search query.",
  icon,
  action,
  colSpan = 5,
}: {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  colSpan?: number;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-16 text-center">
        <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
            {icon || <Inbox className="w-6 h-6" />}
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800">{title}</h4>
            <p className="text-xs text-slate-400 mt-1">{description}</p>
          </div>
          {action && <div className="pt-2">{action}</div>}
        </div>
      </td>
    </tr>
  );
}
