"use client";

import { motion } from "framer-motion";
import { ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  current: number;
  total: number;
  onChange: (page: number) => void;
}



function getVisiblePages(current: number, total: number): (number | "...")[] {
  const pages: (number | "...")[] = [];
  
  if (total <= 9) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
    return pages;
  }
  
  // Selalu tampilkan 3 halaman pertama
  pages.push(1, 2, 3);
  
  if (current > 5) {
    pages.push("...");
  }
  
  // Tampilkan halaman di tengah (aktif +/- 1)
  const start = Math.max(4, current - 1);
  const end = Math.min(total - 3, current + 1);
  
  for (let i = start; i <= end; i++) {
    if (!pages.includes(i)) {
      pages.push(i);
    }
  }
  
  if (current < total - 4) {
    pages.push("...");
  }
  
  // Selalu tampilkan 3 halaman terakhir
  const lastPages = [total - 2, total - 1, total];
  lastPages.forEach(p => {
    if (!pages.includes(p)) {
      pages.push(p);
    }
  });
  
  return pages;
}

export function Pagination({ current, total, onChange }: PaginationProps) {
  const pages = getVisiblePages(current, total);

  return (
    <nav
      className="mx-auto flex max-w-7xl justify-center px-4 py-12 sm:px-6 lg:px-8"
      aria-label="Pagination"
    >
      <ul className="flex items-center gap-2">
        {pages.map((page, i) =>
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
