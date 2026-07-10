"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { MitraShell } from "@/components/mitra/MitraShell";
import { MitraSidebar } from "@/components/mitra/MitraSidebar";
import { formatRupiah } from "@/lib/format-rupiah";
import { api } from "@/lib/api";

const FILTERS: { key: "inbox" | "on_the_way" | "completed"; label: string }[] = [
  { key: "inbox", label: "Kotak Masuk" },
  { key: "on_the_way", label: "Dalam Perjalanan" },
  { key: "completed", label: "Selesai" },
];

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu Diproses",
  PROCESSING: "Sedang Diproses",
  SHIPPED: "Dalam Pengiriman",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

export default function MitraOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"inbox" | "on_the_way" | "completed">("inbox");

  async function loadOrders() {
    try {
      const data = await api.get("/mitra/orders");
      setOrders(data || []);
    } catch (e) {
      console.error("Failed to load mitra orders", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const counts = useMemo(() => {
    return {
      inbox: orders.filter((o) => o.status === "PENDING" || o.status === "PROCESSING").length,
      on_the_way: orders.filter((o) => o.status === "SHIPPED").length,
      completed: orders.filter((o) => o.status === "COMPLETED" || o.status === "CANCELLED").length,
    };
  }, [orders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (filter === "inbox") return o.status === "PENDING" || o.status === "PROCESSING";
      if (filter === "on_the_way") return o.status === "SHIPPED";
      if (filter === "completed") return o.status === "COMPLETED" || o.status === "CANCELLED";
      return false;
    });
  }, [orders, filter]);

  return (
    <MitraShell>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
        <MitraSidebar active="orders" />

        <div>
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">
              Pesanan Toko Anda
            </h1>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Kelola pesanan dari pembeli
            </p>
          </div>

          {/* Filter tabs */}
          <div className="mb-6 flex flex-wrap gap-1 border-b border-zinc-200">
            {FILTERS.map((f) => {
              const isActive = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`relative px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    isActive
                      ? "text-zinc-900"
                      : "text-zinc-500 hover:text-zinc-700"
                  }`}
                >
                  {f.label}{" "}
                  <span
                    className={`ml-1 ${
                      isActive ? "text-zinc-900" : "text-zinc-400"
                    }`}
                  >
                    ({counts[f.key]})
                  </span>
                  {isActive && (
                    <motion.span
                      layoutId="mitra-orders-tab"
                      className="absolute inset-x-0 -bottom-px h-0.5 bg-zinc-900"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Orders table */}
          <div className="rounded-sm border border-zinc-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    <th className="px-5 py-3">No. Pesanan</th>
                    <th className="px-5 py-3">Tanggal Masuk</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Pembayaran</th>
                    <th className="px-5 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-12 text-center text-sm text-zinc-500"
                      >
                        Memuat data pesanan...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-12 text-center text-sm text-zinc-500"
                      >
                        Tidak ada pesanan.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((order) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
                      >
                        <td className="px-5 py-4 font-mono font-semibold text-zinc-900">
                          {order.orderNumber}
                        </td>
                        <td className="px-5 py-4 text-zinc-600">
                          {new Date(order.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              order.status === "PENDING"
                                ? "bg-rose-50 text-rose-700"
                                : order.status === "PROCESSING"
                                  ? "bg-blue-50 text-blue-700"
                                  : order.status === "SHIPPED"
                                    ? "bg-amber-50 text-amber-700"
                                    : order.status === "COMPLETED"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-zinc-100 text-zinc-600"
                            }`}
                          >
                            {STATUS_LABEL[order.status]}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-semibold text-zinc-900">
                            {formatRupiah(order.total)}
                          </span>
                          <span className="ml-1 text-xs text-zinc-500">
                            untuk {order.items?.length || 0} item
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                              order.paymentStatus === "PAID"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {order.paymentStatus === "PAID" ? "Lunas" : "Belum Bayar"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <a
                            href={`/mitra/orders/${order.id}`}
                            className="inline-block border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-700 hover:text-zinc-900"
                          >
                            Kelola Pesanan
                          </a>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MitraShell>
  );
}
