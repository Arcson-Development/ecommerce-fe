"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";
import { MitraShell } from "@/components/mitra/MitraShell";
import { MitraSidebar } from "@/components/mitra/MitraSidebar";
import { formatRupiah } from "@/data/products";
import { merchantProductDetails } from "@/lib/merchant-data";

const CATEGORY_META: Record<string, { label: string; bg: string; text: string }> = {
  Makanan: { label: "Makanan", bg: "bg-zinc-100", text: "text-zinc-700" },
  Sayur: { label: "Sayur", bg: "bg-emerald-50", text: "text-emerald-700" },
  Dapur: { label: "Dapur", bg: "bg-amber-50", text: "text-amber-700" },
};

export default function MitraStockPage() {
  const router = useRouter();

  return (
    <MitraShell>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
        <MitraSidebar active="stock" />

        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">
              Akun Mitra
            </h1>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Dasbor
            </p>
          </div>

          {/* Title + actions */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-zinc-900">List Produk</h2>
            <div className="flex flex-wrap items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/mitra/products/new")}
                className="flex items-center gap-1.5 border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-800 transition-colors hover:border-zinc-700 hover:text-zinc-900"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                Tambahkan Produk
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 bg-zinc-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800"
              >
                <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.5} />
                Update Stok
              </motion.button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-sm border border-zinc-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    <th className="px-5 py-3">ID Produk</th>
                    <th className="px-5 py-3">Nama Produk</th>
                    <th className="px-5 py-3">Kategori</th>
                    <th className="px-5 py-3">Harga</th>
                    <th className="px-5 py-3">Variasi</th>
                    <th className="px-5 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {merchantProductDetails.map((p) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
                    >
                      <td className="px-5 py-4 font-mono font-semibold text-zinc-900">
                        #{p.code}
                      </td>
                      <td className="px-5 py-4 text-zinc-900">{p.name}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {p.categories.map((cat) => {
                            const meta = CATEGORY_META[cat] ?? {
                              label: cat,
                              bg: "bg-zinc-100",
                              text: "text-zinc-700",
                            };
                            return (
                              <span
                                key={cat}
                                className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-medium ${meta.bg} ${meta.text}`}
                              >
                                {meta.label}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-zinc-900">
                        {formatRupiah(p.price)}
                      </td>
                      <td className="px-5 py-4 text-xs text-zinc-600">
                        {p.categoryTypes} jenis, {p.categoryList} tipe
                      </td>
                      <td className="px-5 py-4 text-right">
                        <a
                          href={`/mitra/products/${p.id}`}
                          className="text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
                        >
                          Lihat Detail
                        </a>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MitraShell>
  );
}
