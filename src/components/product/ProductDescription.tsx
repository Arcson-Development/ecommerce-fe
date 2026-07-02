"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

interface ProductDescriptionProps {
  title?: string;
  text?: string;
}

const DEFAULT_DESCRIPTION =
  "Brokoli organik segar pilihan, dipanen langsung dari kebun lokal. Kaya akan vitamin C, K, dan serat. Cocok untuk ditumis, dikukus, atau sebagai campuran sup sehat. Disimpan di suhu dingin untuk menjaga kesegaran dan kandungan nutrisinya.";

export function ProductDescription({
  title = "Detail Produk",
  text = DEFAULT_DESCRIPTION,
}: ProductDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const [isLong, setIsLong] = useState(false);

  useEffect(() => {
    setIsLong(text.length > 220);
  }, [text]);

  const displayed = expanded || !isLong ? text : text.slice(0, 220) + "...";

  return (
    <section className="mx-auto max-w-7xl border-t border-gray-200 px-4 pt-10 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h2 className="text-base font-semibold text-zinc-900 sm:text-lg">
          {title}
        </h2>
        <p
          className={`mt-3 text-sm leading-relaxed text-zinc-600 sm:text-base ${
            !expanded && isLong ? "" : ""
          }`}
        >
          {displayed}
        </p>
        {isLong && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setExpanded((e) => !e)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-zinc-700 transition-colors hover:text-zinc-900"
          >
            {expanded ? "Sembunyikan" : "Selengkapnya"}
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </motion.span>
          </motion.button>
        )}
      </motion.div>
    </section>
  );
}
