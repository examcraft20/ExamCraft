"use client";

import { env } from "../env";

export async function apiRequest<TResponse>(
  path: string,
  options: RequestInit & {
    accessToken?: string;
    institutionId?: string;
  } = {},
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
  }

  const response = await fetch(`${env.apiUrl}${path}`, {
    ...options,
    headers,
  });

  const textResponse = await response.text();
  let responseBody: any;
  let isJson = false;

  try {
    responseBody = textResponse ? JSON.parse(textResponse) : {};
    isJson = true;
  } catch (err) {
    responseBody = { message: "Invalid JSON response from server" };
  }

  if (!response.ok) {
    const rawError = responseBody.message || responseBody.error;
    const errorMessage =
      rawError ||
      (isJson ? "The request failed." : `Upstream Server Error: ${response.status}`);

    throw new Error(
      Array.isArray(errorMessage) ? errorMessage.join(", ") : errorMessage
    );
  }

  return responseBody as TResponse;
}
