"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/types/product";
import { formatRupiah } from "@/lib/format-rupiah";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    try {
      await addItem(product.productId || product.id, { variantId: product.id, price: product.price, name: product.name, image: product.image });
      toast.success(`${product.name} ditambahkan ke keranjang`);
    } catch {
      console.error("Failed to add item to cart");
      toast.error("Gagal menambahkan ke keranjang");
    }
    setTimeout(() => setIsAdding(false), 600);
  };

  const productSlug = `/product/${product.productId || product.id}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: 0.5,
        delay: (index % 4) * 0.08,
        ease: "easeOut",
      }}
      whileHover={{ y: -4 }}
      className="flex w-full flex-col items-center"
    >
      {/* Image with discount badge */}
      <Link
        href={productSlug}
        className="relative aspect-square w-full overflow-hidden rounded-sm bg-gray-50"
      >
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
            viewport={{ once: true, amount: 0.1 }}
            transition={{
              delay: 0.3 + (index % 4) * 0.08,
              type: "spring",
              stiffness: 400,
              damping: 20,
            }}
            className="absolute left-3 top-3 flex h-12 w-12 items-center justify-center rounded-full bg-sale text-xs font-bold text-white shadow-sm"
          >
            -{product.discount}%
          </motion.span>
        )}
      </Link>

      {/* Info */}
      <div className="mt-3 flex w-full flex-col items-center text-center">
        <Link href={productSlug}>
          <h2 className="text-sm font-medium text-zinc-900 hover:underline">
            {product.name}
          </h2>
        </Link>

        <div className="mt-1 flex items-center gap-2 text-sm">
          {product.discount && (
            <span className="text-xs text-zinc-400 line-through">
              {formatRupiah(product.originalPrice)}
            </span>
          )}
          <span
            className={
              product.discount
                ? "text-base font-bold text-sale"
                : "font-semibold text-zinc-900"
            }
          >
            {formatRupiah(product.price)}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-zinc-600">
          <span
            className="h-2 w-2 shrink-0 rounded-full bg-zinc-300"
            role="presentation"
            aria-hidden="true"
          />
          <span>{product.store}</span>
        </div>

        {/* Add to cart button */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2.5 text-xs font-semibold text-primary-fg shadow-sm transition-colors hover:bg-primary-hover active:scale-95"
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
        </button>
      </div>
    </motion.article>
  );
}

