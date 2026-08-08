"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { Subsector } from "@/types/product";

interface SubsectorNavProps {
  categories: Subsector[];
  selectedSubsector?: string;
  onSelectSubsector?: (name: string) => void;
}

export function SubsectorNav({ categories, selectedSubsector, onSelectSubsector }: SubsectorNavProps) {
  return (
    <nav className="border-b border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center gap-6 overflow-x-auto py-3 text-xs sm:text-sm font-medium uppercase tracking-wide text-gray-700 scrollbar-hide">
          {categories.map((subsector, i) => {
            const isSelected = selectedSubsector === subsector.name;
            return (
              <motion.li
                key={subsector.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="shrink-0"
              >
                <button
                  type="button"
                  onClick={() => onSelectSubsector?.(subsector.name)}
                  className={`flex items-center gap-1 whitespace-nowrap transition-colors cursor-pointer hover:text-accent-hover ${
                    isSelected ? "text-accent-hover font-bold" : "text-gray-700"
                  }`}
                >
                  <span>{subsector.name}</span>
                  {subsector.hasDropdown && (
                    <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
                  )}
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
