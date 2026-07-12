"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function TopBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full bg-primary py-2.5 text-center text-xs sm:text-sm text-primary-fg"
      role="status"
      aria-live="polite"
    >
      <p className="font-semibold">Min. Belanja Rp. 80.000</p>
      <p className="flex items-center justify-center gap-1.5 text-green-50">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        Diskon ongkir maks. Rp20.000 untuk pembelian ≥ Rp200.000
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
      </p>
    </motion.div>
  );
}
