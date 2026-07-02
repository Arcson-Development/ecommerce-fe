"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  discount?: number;
}

export function ProductGallery({
  images,
  productName,
  discount,
}: ProductGalleryProps) {
  const [active, setActive] = useState(0);

  const next = () => setActive((p) => (p + 1) % images.length);
  const prev = () =>
    setActive((p) => (p - 1 + images.length) % images.length);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="group relative aspect-square w-full overflow-hidden rounded-sm bg-gray-50">
        <motion.div
          key={active}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={images[active]}
            alt={`${productName} ${active + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            unoptimized
            priority
            loading="eager"
          />
        </motion.div>

        {discount && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.3,
              type: "spring",
              stiffness: 400,
              damping: 20,
            }}
            className="absolute left-4 top-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500 text-sm font-bold text-white shadow-md"
          >
            -{discount}%
          </motion.span>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-sm transition-all sm:h-20 sm:w-20 ${
                i === active
                  ? "ring-2 ring-zinc-900 ring-offset-2"
                  : "ring-1 ring-gray-200"
              }`}
              aria-label={`Lihat ${productName} gambar ${i + 1}`}
            >
              <Image
                src={src}
                alt={`${productName} thumbnail ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
                unoptimized
              />
            </motion.button>
          ))}
        </div>
      )}

      {/* Prev/Next navigation */}
      {images.length > 1 && (
        <div className="flex justify-end gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prev}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-zinc-700 transition-colors hover:border-zinc-700"
            aria-label="Gambar sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={next}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-zinc-700 transition-colors hover:border-zinc-700"
            aria-label="Gambar berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      )}
    </div>
  );
}
