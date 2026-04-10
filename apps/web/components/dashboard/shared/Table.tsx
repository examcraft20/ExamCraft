"use client";

import { ReactNode } from "react";

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, row: T) => ReactNode;
  width?: string;
}

interface TableProps<T> {
  title?: string;
  columns: TableColumn<T>[];
  data: T[];
  rowKey?: keyof T | ((row: T, idx: number) => string | number);
  emptyMessage?: string;
  actions?: (row: T) => ReactNode;
}

export function Table<T extends Record<string, any>>({
  title,
  columns,
  data,
  rowKey = "id",
  emptyMessage = "No data available",
  actions
}: TableProps<T>) {
  const getRowKey = (row: T, idx: number) => {
    if (typeof rowKey === "function") {
      return rowKey(row, idx);
    }
    return row[rowKey as keyof T] ?? idx;
  };

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
      )}

      {data.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-slate-400 text-sm">{emptyMessage}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                {columns.map((col) => (
                  <th
                    key={col.key as string}
                    className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400"
                    style={{ width: col.width }}
                  >
                    {col.label}
                  </th>
                ))}
                {actions && (
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr
                  key={getRowKey(row, idx)}
                  className="border-t border-white/5 hover:bg-white/[0.03] transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={`${getRowKey(row, idx)}-${col.key as string}`}
                      className="px-6 py-4 text-sm text-slate-200"
                      style={{ width: col.width }}
                    >
                      {col.render
                        ? col.render(row[col.key as keyof T], row)
                        : row[col.key as keyof T]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 text-sm">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
