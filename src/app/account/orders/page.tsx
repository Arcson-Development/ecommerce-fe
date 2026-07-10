"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { Search, ChevronRight, Package } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import {
  AccountSidebar,
  AccountLayoutHeader,
} from "@/components/account/AccountSidebar";
import { formatRupiah } from "@/lib/format-rupiah";
import { useOrders, type OrderStatus } from "@/lib/orders";
import {
  ORDER_STATUS_META,
  formatOrderDate,
} from "@/lib/order-format";

const FILTERS: { key: "all" | OrderStatus; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "pending", label: "Belum Dibayar" },
  { key: "processing", label: "Diproses" },
  { key: "shipped", label: "Dikirim" },
  { key: "completed", label: "Selesai" },
  { key: "cancelled", label: "Dibatalkan" },
];

export default function OrdersPage() {
  const orders = useOrders((s) => s.orders);
  const fetchOrders = useOrders((s) => s.fetchOrders);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered = useMemo(() => {
    let list = orders;
    if (filter !== "all") {
      list = list.filter((o) => o.status === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.items.some((i) => i.productName.toLowerCase().includes(q))
      );
    }
    return list;
  }, [orders, filter, search]);

  const counts = useMemo(() => {
    const c: Record<"all" | OrderStatus, number> = {
      all: orders.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      completed: 0,
      cancelled: 0,
    };
    orders.forEach((o) => {
      if (c[o.status] !== undefined) {
        c[o.status] += 1;
      }
    });
    return c;
  }, [orders]);

  return (
    <>
      <TopBar />
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <AccountLayoutHeader title="Pesanan Saya" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
          <AccountSidebar active="orders" />

          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari nomor pesanan atau produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none"
              />
            </div>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2 border-b border-zinc-200">
              {FILTERS.map((f) => {
                const isActive = filter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`relative px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-zinc-900"
                        : "text-zinc-500 hover:text-zinc-700"
                    }`}
                  >
                    {f.label}
                    <span
                      className={`ml-1.5 text-xs ${
                        isActive ? "text-zinc-900" : "text-zinc-400"
                      }`}
                    >
                      ({counts[f.key]})
                    </span>
                    {isActive && (
                      <motion.span
                        layoutId="orders-tab"
                        className="absolute inset-x-0 -bottom-px h-0.5 bg-zinc-900"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Orders list */}
            {filtered.length === 0 ? (
              <EmptyOrders />
            ) : (
              <ul className="space-y-3">
                {filtered.map((order) => {
                  const meta = ORDER_STATUS_META[order.status];
                  return (
                    <motion.li
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="block rounded-sm border border-zinc-200 bg-white transition-shadow hover:shadow-md"
                      >
                        {/* Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 px-4 py-3 sm:px-5">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-semibold text-zinc-900">
                              #{order.id}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.bg} ${meta.text}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${meta.dot}`}
                              />
                              {meta.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <span>{formatOrderDate(order.date)}</span>
                            <ChevronRight
                              className="h-4 w-4"
                              strokeWidth={2}
                            />
                          </div>
                        </div>

                        {/* Items */}
                        <div className="divide-y divide-zinc-100">
                          {order.items.map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 px-4 py-3 sm:px-5"
                            >
                              <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-zinc-100">
                                <Image
                                  src={item.productImage}
                                  alt={item.productName}
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-zinc-900">
                                  {item.productName} - {item.unit}
                                </p>
                                <p className="text-xs text-zinc-500">
                                  {item.quantity} × {formatRupiah(item.price)}
                                </p>
                              </div>
                              <p className="text-sm font-semibold text-zinc-900">
                                {formatRupiah(item.price * item.quantity)}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 bg-zinc-50 px-4 py-3 sm:px-5">
                          <div className="text-xs text-zinc-500">
                            {order.items.length} produk • {order.shippingMethod}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-zinc-500">
                              Total
                            </span>
                            <span className="text-base font-semibold text-zinc-900">
                              {formatRupiah(order.total)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function EmptyOrders() {
  return (
    <div className="rounded-sm border border-dashed border-zinc-300 bg-white py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100">
        <Package className="h-6 w-6 text-zinc-400" strokeWidth={1.75} />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-zinc-900">
        Belum ada pesanan
      </h3>
      <p className="mt-1 text-xs text-zinc-500">
        Pesananmu akan muncul di sini setelah checkout.
      </p>
      <Link
        href="/"
        className="mt-5 inline-block bg-zinc-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-zinc-800"
      >
        Mulai Belanja
      </Link>
    </div>
  );
}
