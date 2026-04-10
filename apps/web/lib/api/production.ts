"use client";

import { env } from "../env";

export async function productionApiRequest<TResponse>(
  path: string,
  options: RequestInit & {
    accessToken?: string;
    institutionId?: string;
  } = {}
): Promise<TResponse> {
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  if (options.institutionId) {
    headers.set("x-institution-id", options.institutionId);
  } else if (typeof window !== 'undefined') {
    const storedId = localStorage.getItem('examcraft_institution_id');
    if (storedId) {
      headers.set("x-institution-id", storedId);
    }
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
