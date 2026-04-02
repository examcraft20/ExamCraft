import * as React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

export function Skeleton({ width, height, rounded, className = "", style, ...props }: SkeletonProps) {
  return (
    <div
      className={`ui-skeleton bg-white/5 ${rounded ? "rounded-full" : "rounded-md"} ${className}`.trim()}
      style={{
        width: width ?? "100%",
        height: height,
        minHeight: height ? undefined : "1.5rem",
        ...style
      }}
      {...props}
    />
  );
}
