"use client";

import { motion } from "framer-motion";
import { ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  current: number;
  total: number;
  onChange: (page: number) => void;
}



// Show pages 1-4, ellipsis, 13-15
const visiblePages: (number | "...")[] = [1, 2, 3, 4, "...", 13, 14, 15];

export function Pagination({ current, total, onChange }: PaginationProps) {
  return (
    <nav
      className="mx-auto flex max-w-7xl justify-center px-4 py-12 sm:px-6 lg:px-8"
      aria-label="Pagination"
    >
      <ul className="flex items-center gap-2">
        {visiblePages.map((page, i) =>
          page === "..." ? (
            <li
              key={`ellipsis-${i}`}
              className="flex h-9 w-9 items-center justify-center text-zinc-400"
            >
              <MoreHorizontal className="h-4 w-4" />
            </li>
          ) : (
            <li key={page}>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => onChange(page)}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  current === page
                    ? "bg-zinc-900 text-white"
                    : "border border-gray-300 bg-white text-zinc-700 hover:border-zinc-700"
                }`}
                aria-current={current === page ? "page" : undefined}
                aria-label={`Halaman ${page}`}
              >
                {page}
              </motion.button>
            </li>
          )
        )}
        <li>
          <motion.button
            whileHover={{ scale: 1.08, x: 2 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => onChange(Math.min(current + 1, total))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-zinc-700 transition-colors hover:border-zinc-700"
            aria-label="Halaman berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </li>
      </ul>
    </nav>
  );
}
