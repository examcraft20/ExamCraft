import * as React from "react";
import { color } from "../themes/tokens";

export interface AvatarProps {
  /** Display name — initials are generated from first two words */
  name: string;
  /** Optional image url */
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  style?: React.CSSProperties;
}

const sizeMap = { sm: 28, md: 36, lg: 48, xl: 64 };
const fontSizeMap = { sm: "0.7rem", md: "0.85rem", lg: "1.1rem", xl: "1.4rem" };

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function Avatar({ name, src, size = "md", style }: AvatarProps) {
  const px = sizeMap[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{
          width: px,
          height: px,
          borderRadius: "50%",
          objectFit: "cover",
          border: `1px solid ${color.borderSubtle}`,
          background: color.bgSurface,
          flexShrink: 0,
          ...style,
        }}
      />
    );
  }

  return (
    <span
      aria-label={name}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: px,
        height: px,
        borderRadius: "50%",
        background: color.bgSurface,
        color: color.textPrimary,
        fontSize: fontSizeMap[size],
        fontWeight: 600,
        flexShrink: 0,
        border: `1px solid ${color.borderMedium}`,
        ...style,
      }}
    >
      {getInitials(name)}
    </span>
  );
}
