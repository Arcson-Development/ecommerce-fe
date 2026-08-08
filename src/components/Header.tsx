"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useMitra } from "@/lib/mitra";
import { formatRupiah } from "@/lib/format-rupiah";

interface HeaderProps {
  onSearch?: (query: string) => void;
  initialSearch?: string;
}

export function Header({ onSearch, initialSearch = "" }: HeaderProps) {
  const items = useCart((state) => state.items);
  const cartCount = useCart((state) => state.getCount());
  const cartTotal = useCart((state) => state.getTotal());
  
  const user = useAuth((state) => state.user);
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const fetchProfile = useAuth((state) => state.fetchProfile);
  const fetchCart = useCart((state) => state.fetchCart);
  const fetchMitraStatus = useMitra((state) => state.fetchMitraStatus);

  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      fetchProfile().catch(() => {});
      fetchCart().catch(() => {});
      fetchMitraStatus().catch(() => {});
    }
  }, [isAuthenticated, fetchProfile, fetchCart, fetchMitraStatus]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    }
    setSearchOpen(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    if (onSearch) {
      onSearch("");
    } else {
      router.push("/");
    }
  };

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
          <Link href="/" aria-label="Beranda">
            <Logo />
          </Link>
          <span className="hidden text-xl font-semibold text-ink sm:inline">
            EKRAF Kiosk
          </span>
        </motion.div>

        {/* Search Bar - Desktop */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden md:flex flex-1 max-w-xl"
        >
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-ink" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk kreatif, subsektor, atau toko..."
              aria-label="Cari produk"
              className="w-full border border-gray-300 bg-gray-50 pl-12 pr-12 py-3 text-sm rounded-lg focus:border-accent focus:bg-white focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-ink hover:text-muted-ink"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </form>
        </motion.div>

        {/* Right actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="flex items-center gap-4 sm:gap-6"
        >
          <Link
            href="/admin/login"
            className="hidden text-sm text-ink transition-colors hover:text-accent sm:inline"
          >
            Admin
          </Link>
          <span className="hidden h-5 w-px bg-gray-300 sm:inline-block" />

          <Link
            href="/checkout"
            className="hidden text-sm text-ink transition-colors hover:text-accent md:inline"
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
                className="h-6 w-6 text-ink"
                strokeWidth={1.75}
              />
              {mounted && cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-sale px-1 text-xs font-bold text-white"
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.div>
          </Link>

          {/* Mobile search button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setSearchOpen(true)}
            aria-label="Cari"
            className="md:hidden text-ink"
          >
            <Search className="h-6 w-6" strokeWidth={1.75} />
          </motion.button>
        </motion.div>
      </div>

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 md:hidden"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              exit={{ y: -100 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white p-4 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-ink" aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari produk kreatif, subsektor, atau toko..."
                  aria-label="Cari produk"
                  className="w-full border border-gray-300 bg-gray-50 pl-12 pr-12 py-3 text-sm rounded-lg focus:border-accent focus:bg-white focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-ink hover:text-muted-ink"
                >
                  <X className="h-5 w-5" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Logo() {
  return (
    <img
      src="/ekraf-logo.png"
      alt="EKRAF Kiosk"
      width={48}
      height={48}
      className="h-12 w-12 object-contain"
    />
  );
}
