"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, Settings2, ImageIcon } from "lucide-react";
import { MitraShell } from "@/components/mitra/MitraShell";
import { MitraSidebar } from "@/components/mitra/MitraSidebar";
import { formatRupiah } from "@/lib/format-rupiah";
import { api } from "@/lib/api";
import { toast } from "sonner";

const API_HOST = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api").replace("/api", "");

function toAbsoluteUrl(path: string): string {
  if (path.startsWith("/uploads")) return `${API_HOST}${path}`;
  return path;
}

const CATEGORY_META: Record<string, { bg: string; text: string }> = {
  Makanan: { bg: "bg-zinc-100", text: "text-zinc-700" },
  Sayur: { bg: "bg-emerald-50", text: "text-emerald-700" },
  Dapur: { bg: "bg-amber-50", text: "text-amber-700" },
};

export default function MitraProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeThumb, setActiveThumb] = useState(0);

  async function loadProduct() {
    try {
      const data = await api.get(`/products/${params.id}`);
      setProduct(data);
    } catch (e) {
      console.error("Failed to load product", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  if (loading) {
    return (
      <MitraShell>
        <div className="py-16 text-center">
          <p className="text-zinc-500">Memuat produk...</p>
        </div>
      </MitraShell>
    );
  }

  if (!product) {
    return (
      <MitraShell>
        <div className="py-16 text-center">
          <h1 className="text-xl font-semibold text-zinc-900">
            Produk tidak ditemukan
          </h1>
          <button
            onClick={() => router.push("/mitra/products")}
            className="mt-6 bg-zinc-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white"
          >
            Kembali
          </button>
        </div>
      </MitraShell>
    );
  }

  const images = (product.images?.length ? product.images : ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80']).map(toAbsoluteUrl);
  const mainImage = images[activeThumb] || images[0];

  return (
    <MitraShell>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
        <MitraSidebar active="stock" />

        <div className="space-y-4">
          <button
            onClick={() => router.push("/mitra/products")}
            className="flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-zinc-900"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
            Kembali ke List Produk
          </button>

          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">
              Akun Mitra
            </h1>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Dasbor
            </p>
          </div>

          <div className="rounded-sm border border-zinc-200 bg-white">
            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
              {/* Image gallery */}
              <div className="space-y-3">
                <div className="relative aspect-square w-full overflow-hidden bg-zinc-100">
                  <Image
                    src={mainImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    unoptimized
                    priority
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(0, 4).map((thumb: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setActiveThumb(i)}
                        className={`relative aspect-square overflow-hidden border-2 transition-colors ${
                          activeThumb === i
                            ? "border-zinc-900"
                            : "border-transparent hover:border-zinc-300"
                        }`}
                      >
                        <Image
                          src={thumb}
                          alt={`thumb ${i + 1}`}
                          fill
                          sizes="80px"
                          className="object-cover"
                          unoptimized
                        />
                      </button>
                    ))}
                </div>
              </div>

              {/* Info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900 sm:text-2xl">
                    {product.name}
                  </h2>
                  <div className="mt-3 flex flex-wrap items-baseline gap-2">
                    {product.variants?.[0]?.originalPrice && (
                      <span className="text-sm text-zinc-400 line-through">
                        {formatRupiah(product.variants[0].originalPrice)}
                      </span>
                    )}
                    <span className="text-2xl font-semibold text-zinc-900">
                      {product.variants?.length ? formatRupiah(product.variants[0].price) : '-'}
                    </span>
                    {product.variants?.length > 1 && (
                      <span className="text-xs text-zinc-500">
                        + {product.variants.length - 1} varian lainnya
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Ketersediaan
                  </p>
                  <p className="mt-1 text-sm font-medium text-emerald-600">
                    {product.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) > 0 ? 'Tersedia' : 'Habis'}
                  </p>
                </div>

                {/* Category */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Kategori
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <span
                      className="inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium bg-zinc-100 text-zinc-700"
                    >
                      {product.category?.name || 'Umum'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Detail Produk
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                    {product.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 border-t border-zinc-200 pt-4">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-800 transition-colors hover:border-zinc-700 hover:text-zinc-900"
                  >
                    <Settings2 className="h-3.5 w-3.5" strokeWidth={2} />
                    Edit Produk
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-800 transition-colors hover:border-zinc-700 hover:text-zinc-900"
                  >
                    <ImageIcon className="h-3.5 w-3.5" strokeWidth={2} />
                    Kelola Foto
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Variants */}
            <div className="border-t border-zinc-200 px-6 py-5">
              <h3 className="text-sm font-semibold text-zinc-900">
                Variasi Lainnya
              </h3>
              <div className="mt-3 space-y-2">
                {product.variants.map((variant: any) => (
                  <VariantStockRow key={variant.id} variant={variant} onStockUpdated={loadProduct} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MitraShell>
  );
}

function VariantStockRow({ variant, onStockUpdated }: { variant: any; onStockUpdated: () => void }) {
  const [editing, setEditing] = useState(false);
  const [stockInput, setStockInput] = useState(String(variant.stock || 0));
  const [updating, setUpdating] = useState(false);

  const handleSave = async () => {
    setUpdating(true);
    try {
      await api.put(`/products/mitra/variant/${variant.id}/stock`, { stock: parseInt(stockInput) || 0 });
      setEditing(false);
      onStockUpdated();
    } catch (e: any) {
      toast.error("Gagal update stok: " + (e?.message || "Unknown error"));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 border border-zinc-200 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-zinc-900">{variant.name}</p>
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="text-sm font-semibold text-zinc-900">{formatRupiah(variant.price)}</span>
          {variant.originalPrice && (
            <span className="text-xs text-zinc-400 line-through">{formatRupiah(variant.originalPrice)}</span>
          )}
          {variant.discount && (
            <span className="text-xs font-semibold text-rose-500">-{variant.discount}%</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {editing ? (
          <>
            <input
              type="number"
              min="0"
              value={stockInput}
              onChange={(e) => setStockInput(e.target.value)}
              className="w-20 border border-zinc-300 px-2 py-1 text-sm text-center"
              autoFocus
            />
            <button
              onClick={handleSave}
              disabled={updating}
              className="bg-zinc-900 px-3 py-1 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {updating ? "..." : "Simpan"}
            </button>
            <button
              onClick={() => { setEditing(false); setStockInput(String(variant.stock || 0)); }}
              className="text-xs text-zinc-500 hover:text-zinc-900"
            >
              Batal
            </button>
          </>
        ) : (
          <>
            {variant.stock > 0 ? (
              <p className="text-xs font-medium text-emerald-600">{variant.stock} Tersisa</p>
            ) : (
              <p className="text-xs font-medium text-zinc-500">Tidak Ada Dalam Stok</p>
            )}
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
            >
              Atur Stok
            </button>
          </>
        )}
      </div>
    </div>
  );
}
