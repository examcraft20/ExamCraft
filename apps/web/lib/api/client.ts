"use client";

import { env } from "../env";
import { productionApiRequest } from "./production";

export async function apiRequest<TResponse>(
  path: string,
  options: RequestInit & {
    accessToken?: string;
    institutionId?: string;
  } = {},
): Promise<TResponse> {
  if (env.demoMode) {
    try {
      const { demoApiRequest } = await import("./mock");
      return demoApiRequest<TResponse>(path, options);
    } catch (error) {
      console.error("Failed to load demo API:", error);
      throw new Error("Demo mode is unavailable. Please try again later.");
    }
  }

  return productionApiRequest<TResponse>(path, options);
}
