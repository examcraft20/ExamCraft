"use client";

import * as Sentry from "@sentry/nextjs";

export default function SentryExamplePage() {
  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Page Not Found</h1>
        <p>This page is only available in development mode.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
      <h1>Sentry Test Page</h1>
      <p>Click the button below to trigger a test error and verify your Sentry setup.</p>
      
      <button
        onClick={() => {
          console.log("Triggering Sentry test error...");
          throw new Error("Sentry Test Error: " + new Date().toISOString());
        }}
        style={{
          padding: "0.8rem 1.5rem",
          background: "#633ce0",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        Trigger Client error
      </button>

      <button
        onClick={async () => {
          console.log("Capturing message...");
          Sentry.captureMessage("Sentry Test Message: " + new Date().toISOString());
          alert("Message sent to Sentry!");
        }}
        style={{
          padding: "0.8rem 1.5rem",
          background: "#2d2d2d",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        Capture Message
      </button>
    </div>
  );
}
