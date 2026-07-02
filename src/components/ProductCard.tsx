"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/types/product";
import { formatRupiah } from "@/data/products";
import { useCart } from "@/lib/cart";

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem(product.id);
    setTimeout(() => setIsAdding(false), 600);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay: (index % 4) * 0.08,
        ease: "easeOut",
      }}
      whileHover={{ y: -4 }}
      className="group flex flex-col items-center"
    >
      {/* Image with discount badge */}
      <div className="relative aspect-square w-full overflow-hidden rounded-sm bg-gray-50">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
            unoptimized
            priority={index < 4}
            loading={index < 4 ? "eager" : "lazy"}
          />
        </motion.div>

        {product.discount && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.3 + (index % 4) * 0.08,
              type: "spring",
              stiffness: 400,
              damping: 20,
            }}
            className="absolute left-3 top-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white shadow-sm"
          >
            -{product.discount}%
          </motion.span>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 flex w-full flex-col items-center text-center">
        <h3 className="text-sm font-medium text-zinc-900">
          {product.name} - {product.unit}
        </h3>

        <div className="mt-1 flex items-center gap-2 text-sm">
          {product.discount && (
            <span className="text-zinc-400 line-through">
              {formatRupiah(product.originalPrice)}
            </span>
          )}
          <span
            className={
              product.discount
                ? "font-semibold text-zinc-900"
                : "text-zinc-900"
            }
          >
            {formatRupiah(product.price)}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-zinc-600">
          <span className="h-2 w-2 shrink-0 rounded-full bg-zinc-300" />
          <span>{product.store}</span>
        </div>

        {/* Add to cart button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleAddToCart}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2.5 text-xs font-medium text-zinc-800 transition-colors hover:border-zinc-700 hover:text-zinc-900"
        >
          <motion.span
            animate={
              isAdding
                ? { rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }
                : { rotate: 0, scale: 1 }
            }
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          </motion.span>
          Tambahkan ke Keranjang
          <span className="sr-only"> {product.name}</span>
        </motion.button>
      </div>
    </motion.article>
  );
}
