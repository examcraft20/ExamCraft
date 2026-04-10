"use client";

import { env } from "../env";
import { productionApiRequest } from "./production";

export async function apiRequest<TResponse>(
  path: string,
  options: RequestInit & {
    accessToken?: string;
    institutionId?: string;
  } = {}
): Promise<TResponse> {
  if (env.demoMode) {
    const { demoApiRequest } = await import("./mock");
    return demoApiRequest<TResponse>(path, options);
  }

  return productionApiRequest<TResponse>(path, options);
}
