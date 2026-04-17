/**
 * Extracts a user-friendly error message from any error type.
 * Handles Error objects, strings, and unknown error types safely.
 * 
 * @param error - The error to extract message from
 * @returns A string message suitable for display
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === "string") {
    return error;
  }
  
  // For unknown error types, try to stringify safely
  try {
    return JSON.stringify(error);
  } catch {
    return "An unexpected error occurred";
  }
}
