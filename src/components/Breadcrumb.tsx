"use client";

import { motion } from "framer-motion";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { SortOption } from "@/types/product";

interface BreadcrumbProps {
  items: string[];
  total: number;
  showCount: number;
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
}

const sortLabels: Record<SortOption, string> = {
  newest: "Urutkan menurut yang terbaru",
  "price-asc": "Harga: Rendah ke Tinggi",
  "price-desc": "Harga: Tinggi ke Rendah",
  popular: "Paling Populer",
  rating: "Rating Tertinggi",
};

export function Breadcrumb({
  items,
  total,
  showCount,
  sortBy,
  onSortChange,
}: BreadcrumbProps) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-4 py-4 text-sm sm:flex-row sm:items-center sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-zinc-500">
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
            ) : (
              <a
                href="#"
                className="transition-colors hover:text-orange-600"
              >
                {item}
              </a>
            )}
          </span>
        ))}
      </nav>

      {/* Right side: result count + sort */}
      <div className="flex items-center gap-4">
        <p className="text-zinc-500">
          Menampilkan 1–{showCount} dari {total} hasil
        </p>
        <SortDropdown value={sortBy} onChange={onSortChange} />
      </div>
    </div>
  );
}

function SortDropdown({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (v: SortOption) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(!open)}
        className="flex min-w-[220px] items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-zinc-700 transition-colors hover:border-gray-400"
      >
        <span>{sortLabels[value]}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </motion.button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute right-0 z-20 mt-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
          >
            {(Object.keys(sortLabels) as SortOption[]).map((key) => (
              <li key={key}>
                <button
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                    key === value
                      ? "bg-orange-50 font-medium text-orange-700"
                      : "text-zinc-700"
                  }`}
                >
                  {sortLabels[key]}
                </button>
              </li>
            ))}
          </motion.ul>
        </>
      )}
    </div>
  );
}
