"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          backgroundColor: "#000000",
          color: "#ededed",
          fontFamily:
            '"Inter", "Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: "560px",
            width: "100%",
            textAlign: "center",
          }}
        >
          {/* Error icon */}
          <div
            style={{
              width: "64px",
              height: "64px",
              margin: "0 auto 24px",
              borderRadius: "16px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
            }}
          >
            ⚠
          </div>

          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginBottom: "12px",
            }}
          >
            Something went wrong
          </h1>

          <p
            style={{
              color: "#a1a1aa",
              fontSize: "1rem",
              lineHeight: 1.6,
              marginBottom: "32px",
            }}
          >
            An unexpected error occurred. Our team has been notified. Please try
            again or return to the home page.
          </p>

          {/* Error detail */}
          {(error.message || error.digest) && (
            <div
              style={{
                padding: "16px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                fontFamily: "monospace",
                fontSize: "0.75rem",
                color: "#71717a",
                marginBottom: "32px",
                textAlign: "left",
                wordBreak: "break-all",
              }}
            >
              {error.message && <div>{error.message}</div>}
              {error.digest && (
                <div style={{ marginTop: "8px", color: "rgba(239,68,68,0.6)" }}>
                  Digest: {error.digest}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div
            style={{ display: "flex", gap: "12px", justifyContent: "center" }}
          >
            <button
              onClick={() => reset()}
              style={{
                padding: "12px 24px",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#000000",
                border: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
            <a
              href="/"
              style={{
                padding: "12px 24px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.05)",
                color: "#ededed",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                fontWeight: 600,
                fontSize: "0.875rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
