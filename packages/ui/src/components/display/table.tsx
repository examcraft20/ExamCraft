import * as React from "react";

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export function Table({ children, className = "", ...props }: TableProps) {
  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <table className={`w-full border-collapse text-left ${className}`.trim()} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = "", ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={`border-b border-white/5 bg-white/5 ${className}`.trim()} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = "", ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={`${className}`.trim()} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = "", ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={`border-b border-white/5 transition-colors hover:bg-white/5 group ${className}`.trim()} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className = "", ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ${className}`.trim()} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = "", ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-6 py-5 text-sm font-medium text-white ${className}`.trim()} {...props}>
      {children}
    </td>
  );
}
