"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Package, Search, Store, Eye } from "lucide-react";
import { formatRupiah } from "@/lib/format-rupiah";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await api.get("/products");
      setProducts(data || []);
    } catch (e) {
      console.error("Failed to load products", e);
    } finally {
      setLoading(false);
    }
  }

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-sm text-zinc-500">
        Memuat data produk...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Master Produk</h1>
        <p className="text-sm text-zinc-500 mt-1">Lihat semua produk dari seluruh toko mitra</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Produk", value: products.length, color: "bg-zinc-900 text-white" },
          { label: "Total Varian", value: products.reduce((sum: number, p: any) => sum + (p.variants?.length || 0), 0), color: "bg-blue-500 text-white" },
          { label: "Total Toko", value: new Set(products.map((p: any) => p.storeId)).size, color: "bg-emerald-500 text-white" },
          { label: "Total Stok", value: products.reduce((sum: number, p: any) => sum + (p.variants?.reduce((s: number, v: any) => s + (v.stock || 0), 0) || 0), 0), color: "bg-amber-500 text-white" },
        ].map((item) => (
          <div key={item.label} className={`rounded-sm p-4 ${item.color}`}>
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-[10px] uppercase tracking-wider opacity-80 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-sm text-sm focus:border-zinc-900 focus:outline-none bg-white"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-zinc-500">
            {search ? "Tidak ada produk yang cocok." : "Belum ada produk."}
          </div>
        ) : (
          filtered.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="bg-white border border-zinc-200 rounded-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="h-40 bg-zinc-100 relative">
                {p.images?.[0] ? (
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-10 w-10 text-zinc-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className="bg-white/90 text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider text-zinc-600">
                    {p.category?.name || "Uncategorized"}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-zinc-900 text-sm truncate">{p.name}</h3>
                <p className="text-xs text-zinc-500 mt-1 truncate">{p.description || "Tidak ada deskripsi"}</p>

                {/* Store info */}
                {p.store && (
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-zinc-400 uppercase tracking-wider">
                    <Store className="h-3 w-3" />
                    <span>{p.store.name}</span>
                  </div>
                )}

                {/* Variants */}
                {p.variants && p.variants.length > 0 && (
                  <div className="mt-3 border-t border-zinc-100 pt-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                      Varian ({p.variants.length})
                    </p>
                    <div className="space-y-1">
                      {p.variants.slice(0, 3).map((v: any) => (
                        <div key={v.id} className="flex justify-between items-center text-xs">
                          <span className="text-zinc-600">{v.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-zinc-800">{formatRupiah(v.price)}</span>
                            <span className={`text-[10px] font-semibold ${
                              v.stock > 10 ? "text-emerald-600" :
                              v.stock > 0 ? "text-amber-600" : "text-rose-600"
                            }`}>
                              {v.stock} stok
                            </span>
                          </div>
                        </div>
                      ))}
                      {p.variants.length > 3 && (
                        <p className="text-[10px] text-zinc-400 italic">
                          +{p.variants.length - 3} varian lainnya
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
