"use client";

import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";

interface ProductBreadcrumbProps {
  items: string[];
}

export function ProductBreadcrumb({ items }: ProductBreadcrumbProps) {
  return (
    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-zinc-500">
        {items.map((item, i) => (
          <span key={item} className="flex items-center gap-1.5">
            {i > 0 && (
              <ChevronRight
                className="h-3.5 w-3.5 text-zinc-400"
                strokeWidth={2}
              />
            )}
            {i === items.length - 1 ? (
              <span className="font-medium text-zinc-900">{item}</span>
            ) : i === 0 ? (
              <Link
                href="/"
                className="transition-colors hover:text-orange-600"
              >
                {item}
              </Link>
            ) : (
              <span className="transition-colors hover:text-orange-600">
                {item}
              </span>
            )}
          </span>
        ))}
      </nav>

      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-zinc-700 transition-colors hover:border-zinc-700"
          aria-label="Produk sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-zinc-700 transition-colors hover:border-zinc-700"
          aria-label="Produk berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );
}
