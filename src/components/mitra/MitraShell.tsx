"use client";

import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import type { ReactNode } from "react";

/**
 * Layout untuk halaman Mitra Mode.
 * Mockup: pakai TopBar (min belanja) + Header (logo, akun, search) — tanpa CategoryNav.
 * Konten halaman di-wrap dengan sidebar di dalamnya.
 */
export function MitraShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <TopBar />
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
