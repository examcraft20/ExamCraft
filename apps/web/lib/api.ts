"use client";

import { env } from "./env";

export async function apiRequest<TResponse>(
  path: string,
  options: RequestInit & {
    accessToken?: string;
    institutionId?: string;
  } = {}
): Promise<TResponse> {
  const headers = new Headers(options.headers || {});

  headers.set("Content-Type", "application/json");

  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  if (options.institutionId) {
    headers.set("x-institution-id", options.institutionId);
  }

  const response = await fetch(`${env.apiUrl}${path}`, {
    ...options,
    headers
  });

  const responseBody = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage =
      responseBody.message ||
      responseBody.error ||
      "The request failed. Please try again.";

    throw new Error(Array.isArray(errorMessage) ? errorMessage.join(", ") : errorMessage);
  }

  return responseBody as TResponse;
}
