"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatRupiah } from "@/lib/format-rupiah";
import type { Product } from "@/types/product";
import { toast } from "sonner";

interface ProductInfoProps {
  product: Product;
  variants: string[];
}

export function ProductInfo({ product, variants }: ProductInfoProps) {
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState(variants[0] ?? "");
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCart((s) => s.addItem);

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      for (let i = 0; i < qty; i++) {
        await addItem(product.productId || product.id, { variantId: product.id, price: product.price, name: product.name, image: product.image });
      }
      toast.success(
        `${qty} × ${product.name} ditambahkan ke keranjang`
      );
    } catch {
      toast.error("Gagal menambahkan ke keranjang");
    }
    setTimeout(() => setIsAdding(false), 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col gap-5"
    >
      {/* Name */}
      <h1 className="text-2xl font-medium text-zinc-900 sm:text-3xl">
        {product.name} - {product.unit.replace(" ", "")}
      </h1>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        {product.discount && (
          <span className="text-base text-zinc-400 line-through">
            {formatRupiah(product.originalPrice)}
          </span>
        )}
        <span
          className={`text-xl font-semibold ${
            product.discount ? "text-sale" : "text-zinc-900"
          }`}
        >
          {formatRupiah(product.price)}
        </span>
      </div>

      {/* Stock */}
      <p className="text-sm font-medium text-primary">Tersedia</p>

      {/* Variant selector */}
      {variants.length > 0 && (
        <div>
          <label
            htmlFor="variant"
            className="mb-2 block text-xs uppercase tracking-wide text-zinc-500"
          >
            Pilih Kategori
          </label>
          <select
            id="variant"
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
            className="w-full appearance-none rounded-sm border border-gray-300 bg-white px-3 py-2.5 text-sm text-zinc-800 transition-colors hover:border-gray-400 focus:border-zinc-900 focus:outline-none"
          >
            {variants.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Quantity + Add to cart */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-10 w-10 items-center justify-center border border-r-0 border-gray-300 bg-white text-zinc-700 transition-colors hover:bg-gray-50"
            aria-label="Kurangi jumlah"
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>
          <div className="flex h-10 w-12 items-center justify-center border-y border-gray-300 bg-white text-sm font-medium text-zinc-900">
            {qty}
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setQty((q) => q + 1)}
            className="flex h-10 w-10 items-center justify-center border border-l-0 border-gray-300 bg-white text-zinc-700 transition-colors hover:bg-gray-50"
            aria-label="Tambah jumlah"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleAdd}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-fg shadow-sm transition-colors hover:bg-primary-hover sm:flex-none sm:px-10"
        >
          <motion.span
            animate={
              isAdding
                ? { rotate: [0, -15, 15, 0], scale: [1, 1.3, 1] }
                : { rotate: 0, scale: 1 }
            }
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </motion.span>
          Tambahkan ke Keranjang
        </motion.button>
      </div>

      {/* Store */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mt-4 flex items-center gap-3"
      >
        <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />
        <span className="text-sm text-zinc-800">{product.store}</span>
      </motion.div>
    </motion.div>
  );
}
