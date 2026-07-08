"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, ShoppingBag, UserRound } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useMitra } from "@/lib/mitra";
import { products, formatRupiah } from "@/data/products";

export function Header() {
  const items = useCart((state) => state.items);
  const cartCount = useCart((state) => state.getCount());
  
  const user = useAuth((state) => state.user);
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const fetchProfile = useAuth((state) => state.fetchProfile);
  const fetchCart = useCart((state) => state.fetchCart);
  const fetchMitraStatus = useMitra((state) => state.fetchMitraStatus);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      fetchProfile();
      fetchCart();
      fetchMitraStatus();
    }
  }, [isAuthenticated, fetchProfile, fetchCart, fetchMitraStatus]);

  const cartTotal = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.id);
    return product ? sum + product.price * item.quantity : sum;
  }, 0);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center gap-3"
        >
          <Logo />
          <span className="hidden text-xl font-semibold text-zinc-900 sm:inline">
            Pasar Jaya
          </span>
        </motion.div>

        {/* Right actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="flex items-center gap-4 sm:gap-6"
        >
          <Link
            href={isAuthenticated ? "/account" : "/auth"}
            className="hidden text-sm text-zinc-700 transition-colors hover:text-orange-600 sm:inline"
          >
            {isAuthenticated && user ? `Hai, ${user.nickname || user.username}` : "Masuk / Daftar"}
          </Link>
          <span className="hidden h-5 w-px bg-gray-300 sm:inline-block" />

          <Link
            href="/checkout"
            className="hidden text-sm text-zinc-700 transition-colors hover:text-orange-600 md:inline"
          >
            Keranjang &gt;{" "}
            <span className="font-semibold">{formatRupiah(mounted ? cartTotal : 0)}</span>
          </Link>

          {/* Cart icon with animated count badge */}
          <Link
            href="/checkout"
            className="relative"
            aria-label="Keranjang"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              className="relative"
            >
              <ShoppingBag
                className="h-6 w-6 text-zinc-800"
                strokeWidth={1.75}
              />
              {mounted && cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-bold text-white"
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.div>
          </Link>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Cari"
            className="text-zinc-800"
          >
            <Search className="h-6 w-6" strokeWidth={1.75} />
          </motion.button>
        </motion.div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-zinc-900"
    >
      {/* Glasses */}
      <circle cx="14" cy="20" r="6" stroke="currentColor" strokeWidth="2" />
      <circle cx="34" cy="20" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20H28" stroke="currentColor" strokeWidth="2" />
      {/* Eyes */}
      <circle cx="14" cy="20" r="1.5" fill="currentColor" />
      <circle cx="34" cy="20" r="1.5" fill="currentColor" />
      {/* Smile */}
      <path
        d="M18 30C18 30 21 33 24 33C27 33 30 30 30 30"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Hair tufts */}
      <path
        d="M10 14C10 14 12 11 14 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M38 14C38 14 36 11 34 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
