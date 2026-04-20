"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <title>Error - Frame & Sunglasses</title>
      </head>
      <body style={{ 
        margin: 0, 
        fontFamily: 'sans-serif', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        backgroundColor: '#F8FAFF'
      }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ color: '#1A1A2E', fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong</h1>
          <p style={{ color: '#64748B', marginBottom: '2rem' }}>We encountered a critical error. Please try refreshing.</p>
          <button
            onClick={() => reset()}
            style={{
              backgroundColor: '#000042',
              color: 'white',
              padding: '0.75rem 2rem',
              border: 'none',
              borderRadius: '0.75rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      </body>
    </html>
  );
}
