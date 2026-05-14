"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ 
        backgroundColor: '#0a0a0a', 
        color: '#ebdbb2', 
        height: '100vh', 
        margin: 0,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontFamily: 'monospace' 
      }}>
        <div style={{ padding: '2rem', border: '1px solid #fb4934', textAlign: 'center', maxWidth: '600px' }}>
          <h1 style={{ color: '#fb4934', margin: '0 0 1rem 0' }}>CRITICAL_SYSTEM_ERROR</h1>
          <div style={{ marginBottom: '2rem', opacity: 0.8, wordBreak: 'break-all' }}>
            <p>{error?.message || "An unexpected neural link failure occurred."}</p>
            {error?.digest && <p style={{ fontSize: '10px', opacity: 0.5 }}>Digest: {error.digest}</p>}
          </div>
          <button 
            onClick={() => reset()}
            style={{ 
              padding: '0.75rem 1.5rem', 
              backgroundColor: '#fb4934', 
              color: '#0a0a0a', 
              border: 'none', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
          >
            REBOOT_SESSION
          </button>
        </div>
      </body>
    </html>
  );
}
