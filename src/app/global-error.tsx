"use client";

// Global error boundary — catches errors in the root layout / during
// initial render. Must be self-contained (no RootLayout, no providers).
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#fafafa",
          color: "#18181b",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
            Terjadi kesalahan
          </h1>
          <p style={{ fontSize: 14, color: "#71717a", marginBottom: 20 }}>
            Maaf, halaman tidak dapat dimuat. Coba muat ulang atau kembali ke
            beranda.
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button
              onClick={reset}
              style={{
                background: "#18181b",
                color: "white",
                border: "none",
                padding: "10px 18px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Coba Lagi
            </button>
            <a
              href="/"
              style={{
                background: "white",
                color: "#18181b",
                border: "1px solid #d4d4d8",
                padding: "10px 18px",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Ke Beranda
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
