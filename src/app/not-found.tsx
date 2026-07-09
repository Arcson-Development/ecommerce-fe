"use client";

import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <TopBar />
      <Header />
      
      <main className="flex flex-col items-center justify-center px-4 py-20">
        <div className="text-center">
          {/* 404 Number */}
          <h1 className="text-9xl font-bold text-zinc-200">404</h1>
          
          {/* Message */}
          <h2 className="mt-4 text-2xl font-semibold text-zinc-900">
            Halaman Tidak Ditemukan
          </h2>
          <p className="mt-2 text-zinc-500">
            Maaf, halaman yang Anda cari tidak tersedia atau sudah dipindahkan.
          </p>
          
          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-zinc-900 text-white font-medium rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Kembali ke Beranda
            </Link>
            <Link
              href="/account"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-zinc-900 font-medium rounded-lg border border-zinc-300 hover:bg-zinc-50 transition-colors"
            >
              Lihat Akun Saya
            </Link>
          </div>
          
          {/* Help */}
          <p className="mt-8 text-sm text-zinc-400">
            Butuh bantuan?{" "}
            <Link href="/" className="text-orange-600 hover:underline">
              Hubungi kami
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
