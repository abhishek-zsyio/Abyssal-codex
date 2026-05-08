"use client";

import * as React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#0a0a0a', color: '#ebdbb2', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
        <div style={{ padding: '2rem', border: '1px solid #fb4934', textAlign: 'center' }}>
          <h1 style={{ color: '#fb4934' }}>CRITICAL_SYSTEM_ERROR</h1>
          <p>{error?.message || "An unexpected error occurred"}</p>
          <button 
            onClick={() => reset()}
            style={{ marginTop: '2rem', padding: '1rem 2rem', backgroundColor: '#fb4934', color: '#0a0a0a', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            RETRY_SYNC
          </button>
        </div>
      </body>
    </html>
  );
}
