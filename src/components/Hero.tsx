"use client";

import { motion } from "framer-motion";
import { Leaf, Truck, ShieldCheck } from "lucide-react";

const TRUST = [
  { icon: Leaf, title: "Segar Setiap Hari", desc: "Panen langsung dari petani lokal" },
  { icon: Truck, title: "Antar Cepat", desc: "Gratis ongkir min. belanja Rp200.000" },
  { icon: ShieldCheck, title: "Kualitas Terjamin", desc: "Garansi segar atau uang kembali" },
];

export function Hero() {
  return (
    <section
      aria-label="Sorotan Pasar Jaya"
      className="relative overflow-hidden bg-primary-soft"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
              <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
              Sayur & buah segar tiap hari
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-primary-soft-fg sm:text-4xl lg:text-5xl">
              Belanja bahan segar,
              <br />
              langsung dari pasar.
            </h2>
            <p className="mt-3 max-w-md text-sm text-zinc-600 sm:text-base">
              Sayuran, buah, daging, dan seafood pilihan — dipetik segar,
              diantar cepat ke rumah Anda.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#produk"
                className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg shadow-sm transition-colors hover:bg-primary-hover"
              >
                Mulai Belanja
              </a>
              <a
                href="#produk"
                className="rounded-md border border-primary/30 bg-white px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
              >
                Lihat Promo
              </a>
            </div>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1"
          >
            {TRUST.map((t) => (
              <li
                key={t.title}
                className="flex items-start gap-3 rounded-lg border border-primary/10 bg-white/70 p-4 backdrop-blur-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <t.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{t.title}</p>
                  <p className="text-xs text-zinc-600">{t.desc}</p>
                </div>
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
