import { cookies } from "next/headers";
import { env } from "../env";

export async function serverApiRequest<TResponse>(
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

  // If no access token provided, resolve from Supabase session cookies
  let token = options.accessToken;
  if (!token) {
    try {
      const { createClient } = await import("../supabase-server");
      const supabase = await createClient();
      const { data: { session } } = await supabase.auth.getSession();
      token = session?.access_token;
    } catch {
      // Silently continue without auth — some server endpoints may be public
    }
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
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
