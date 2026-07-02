"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { Category } from "@/types/product";

interface CategoryNavProps {
  categories: Category[];
}

export function CategoryNav({ categories }: CategoryNavProps) {
  return (
    <nav className="border-b border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center gap-6 overflow-x-auto py-3 text-xs sm:text-sm font-medium uppercase tracking-wide text-gray-700 scrollbar-hide">
          {categories.map((category, i) => (
            <motion.li
              key={category.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="shrink-0"
            >
              <motion.a
                href="#"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="flex items-center gap-1 whitespace-nowrap text-gray-700 transition-colors hover:text-orange-600"
              >
                {category.name}
                {category.hasDropdown && (
                  <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
                )}
              </motion.a>
            </motion.li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
