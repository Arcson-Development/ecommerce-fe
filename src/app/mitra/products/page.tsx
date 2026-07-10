"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { MitraShell } from "@/components/mitra/MitraShell";
import { MitraSidebar } from "@/components/mitra/MitraSidebar";
import { formatRupiah } from "@/lib/format-rupiah";
import { api } from "@/lib/api";

export default function MitraStockPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    try {
      const data = await api.get("/products/mitra/my-products");
      setProducts(data || []);
    } catch (e) {
      console.error("Failed to load products", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <MitraShell>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
        <MitraSidebar active="stock" />

        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">
              Stok Produk
            </h1>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Kelola produk toko
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
            </div>
          </div>

          {/* Table */}
          <div className="rounded-sm border border-zinc-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    <th className="px-5 py-3">Nama Produk</th>
                    <th className="px-5 py-3">Varian</th>
                    <th className="px-5 py-3">Harga Mulai</th>
                    <th className="px-5 py-3">Total Stok</th>
                    <th className="px-5 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-sm text-zinc-500">
                        Memuat produk...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-sm text-zinc-500">
                        Belum ada produk. Mulai tambahkan produk!
                      </td>
                    </tr>
                  ) : (
                    products.map((p: any) => {
                      const minPrice = p.variants?.length
                        ? Math.min(...p.variants.map((v: any) => v.price))
                        : 0;
                      const totalStock = p.variants?.length
                        ? p.variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)
                        : 0;
                      return (
                        <motion.tr
                          key={p.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
                        >
                          <td className="px-5 py-4">
                            <p className="font-medium text-zinc-900">{p.name}</p>
                            <p className="text-xs text-zinc-500">{p.unit}</p>
                          </td>
                          <td className="px-5 py-4 text-xs text-zinc-600">
                            {p.variants?.length || 0} varian
                          </td>
                          <td className="px-5 py-4 font-semibold text-zinc-900">
                            {formatRupiah(minPrice)}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-xs font-medium ${totalStock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                              {totalStock > 0 ? `${totalStock} tersedia` : 'Habis'}
                            </span>
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MitraShell>
  );
}
