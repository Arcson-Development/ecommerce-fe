"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

/**
 * Render QR code LOKAL (client-side) — tidak kirim payload QRIS ke server pihak ketiga.
 * Privacy: payload QRIS (nominal + merchant) TIDAK boleh bocor ke api.qrserver.com dll.
 */
export default function QrDisplay({ data, size = 360 }: { data: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!data || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, data, { width: size, margin: 2 })
      .catch((e) => setError(e?.message || "Gagal render QR"));
  }, [data, size]);

  if (error) {
    return <p className="text-red-500 text-sm">QR gagal dirender: {error}</p>;
  }
  return <canvas ref={canvasRef} className="rounded-lg shadow" />;
}
