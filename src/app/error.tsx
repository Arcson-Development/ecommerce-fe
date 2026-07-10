"use client";

import { useEffect } from "react";

// Segment-level error boundary. Catches render/runtime errors in any route
// and shows a friendly fallback instead of a blank white screen.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-2xl">
        ⚠️
      </div>
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">
          Halaman gagal dimuat
        </h2>
        <p className="mt-1 max-w-sm text-sm text-zinc-500">
          Terjadi kendala saat menampilkan halaman ini. Kamu bisa coba lagi atau
          kembali ke beranda.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-sm bg-zinc-900 px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-zinc-800"
        >
          Coba Lagi
        </button>
        <a
          href="/"
          className="rounded-sm border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-zinc-700 transition-colors hover:border-zinc-700 hover:text-zinc-900"
        >
          Ke Beranda
        </a>
      </div>
    </div>
  );
}
