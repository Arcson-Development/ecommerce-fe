"use client";

import { motion } from "framer-motion";

export function TopBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full bg-zinc-900 py-2.5 text-center text-xs sm:text-sm text-white"
      role="status"
      aria-live="polite"
    >
      <p className="font-medium">Min. Belanja Rp. 80.000</p>
      <p className="text-zinc-300">
        ✨ Diskon ongkir maks. Rp20.000 untuk pembelian ≥ Rp200.000 ✨
      </p>
    </motion.div>
  );
}
