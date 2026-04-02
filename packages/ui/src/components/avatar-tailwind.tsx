import * as React from "react";

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Display name - initials are generated from the first two words */
  name: string;
  /** Optional image URL */
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap: Record<NonNullable<AvatarProps["size"]>, { frame: string; text: string }> = {
  sm: { frame: "h-7 w-7", text: "text-[0.7rem]" },
  md: { frame: "h-9 w-9", text: "text-[0.85rem]" },
  lg: { frame: "h-12 w-12", text: "text-[1.1rem]" },
  xl: { frame: "h-16 w-16", text: "text-[1.4rem]" }
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function Avatar({ name, src, size = "md", className = "", ...props }: AvatarProps) {
  const selected = sizeMap[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${selected.frame} shrink-0 rounded-full border border-borderSubtle bg-bgSurface object-cover ${className}`.trim()}
      />
    );
  }

  return (
    <span
      aria-label={name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-borderMedium bg-bgSurface font-semibold text-textPrimary ${selected.frame} ${selected.text} ${className}`.trim()}
      {...props}
    >
      {getInitials(name)}
    </span>
  );
}
