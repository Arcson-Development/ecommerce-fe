"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ShoppingBag,
  TrendingUp,
  Package,
  Star,
  ArrowRight,
  Wallet,
  Clock,
} from "lucide-react";
import { MitraShell } from "@/components/mitra/MitraShell";
import { MitraSidebar } from "@/components/mitra/MitraSidebar";
import { BarChart } from "@/components/mitra/BarChart";
import { formatRupiah } from "@/data/products";
import { useMitra } from "@/lib/mitra";
import {
  merchantOrders,
  merchantProducts,
  weeklyRevenue,
  ACTIVE_STORE,
} from "@/lib/merchant-data";

const ORDER_STATUS_META = {
  inbox: { label: "Pesanan Masuk", bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  on_the_way: { label: "Dikirim", bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500" },
  completed: { label: "Selesai", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  cancelled: { label: "Batal", bg: "bg-zinc-100", text: "text-zinc-600", dot: "bg-zinc-400" },
} as Record<"inbox" | "on_the_way" | "completed" | "cancelled", { label: string; bg: string; text: string; dot: string }>;

export default function MitraDashboardPage() {
  const applications = useMitra((s) => s.applications);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Find the approved application for the active store
  const activeStore = applications.find(
    (a) =>
      a.storeName === ACTIVE_STORE.name && a.status === "approved"
  );

  const inboxOrders = merchantOrders.filter((o) => o.status === "inbox");
  const today = new Date().toDateString();
  const revenueToday = merchantOrders
    .filter((o) => o.status === "completed" && new Date(o.date).toDateString() === today)
    .reduce((s, o) => s + o.total, 0);
  const totalRevenue = merchantOrders
    .filter((o) => o.status === "completed" || o.status === "on_the_way")
    .reduce((s, o) => s + o.total, 0);
  const completedOrders = merchantOrders.filter((o) => o.status === "completed").length;
  const totalProducts = merchantProducts.length;
  const rating = 4.8;

  // Top selling product
  const topProduct = merchantProducts[0];

  return (
    <MitraShell>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
        <MitraSidebar active="dashboard" />

          <div className="space-y-6">
            {/* Not approved warning */}
            {mounted && !activeStore && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3 rounded-sm border border-amber-200 bg-amber-50 p-4"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-600" strokeWidth={2} />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">
                      Toko belum disetujui
                    </p>
                    <p className="text-xs text-amber-700">
                      Pengajuan mitramu sedang dalam review. Dashboard ini hanya preview.
                    </p>
                  </div>
                </div>
                <Link
                  href="/account/mitra"
                  className="rounded-sm border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50"
                >
                  Lihat Status
                </Link>
              </motion.div>
            )}

            {/* Welcome banner */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-sm border border-zinc-200 bg-gradient-to-br from-emerald-900 to-emerald-700 p-6 text-white sm:p-8"
            >
              <p className="text-xs uppercase tracking-wider text-emerald-200">
                Mitra Dashboard
              </p>
              <h2 className="mt-1 text-xl font-semibold sm:text-2xl">
                Selamat datang, {ACTIVE_STORE.name} 🌿
              </h2>
              <p className="mt-2 text-sm text-emerald-100">
                Kelola pesanan, produk, dan performa tokomu dari satu tempat.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/mitra/orders"
                  className="inline-flex items-center gap-1.5 rounded-sm bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-900 transition-colors hover:bg-emerald-50"
                >
                  Lihat Pesanan
                  <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
                </Link>
                <Link
                  href="/mitra/products"
                  className="inline-flex items-center gap-1.5 rounded-sm border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  Kelola Produk
                </Link>
              </div>
            </motion.section>

            {/* Stats grid */}
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <StatCard
                icon={ShoppingBag}
                label="Pesanan Masuk"
                value={inboxOrders.length}
                color="rose"
                delta="+2 dari kemarin"
              />
              <StatCard
                icon={Wallet}
                label="Pendapatan Hari Ini"
                value={formatRupiah(revenueToday)}
                color="emerald"
                delta="+12% minggu ini"
              />
              <StatCard
                icon={Package}
                label="Total Produk"
                value={totalProducts}
                color="sky"
                delta="Aktif di toko"
              />
              <StatCard
                icon={Star}
                label="Rating Toko"
                value={rating.toFixed(1)}
                color="amber"
                delta={`${completedOrders} ulasan`}
              />
            </section>

            {/* Revenue chart */}
            <section className="rounded-sm border border-zinc-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900">
                    Pendapatan 7 Hari
                  </h3>
                  <p className="mt-0.5 text-2xl font-semibold text-zinc-900">
                    {formatRupiah(totalRevenue)}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
                  +18.2%
                </span>
              </div>
              <BarChart data={weeklyRevenue} />
            </section>

            {/* New orders + Top product */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* New orders */}
              <section className="rounded-sm border border-zinc-200 bg-white">
                <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900">
                    Pesanan Baru
                  </h3>
                  <Link
                    href="/mitra/orders"
                    className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700"
                  >
                    Semua
                    <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
                  </Link>
                </div>
                <ul className="divide-y divide-zinc-200">
                  {inboxOrders.length === 0 ? (
                    <li className="px-5 py-8 text-center text-sm text-zinc-500">
                      Tidak ada pesanan masuk.
                    </li>
                  ) : (
                    inboxOrders.map((order) => {
                      const meta = ORDER_STATUS_META[order.status];
                      return (
                        <li
                          key={order.id}
                          className="flex items-center justify-between gap-3 px-5 py-3"
                        >
                          <div className="min-w-0">
                            <p className="font-mono text-sm font-semibold text-zinc-900">
                              {order.id}
                            </p>
                            <p className="truncate text-xs text-zinc-500">
                              {order.customer} • {order.items.length} produk
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.bg} ${meta.text}`}
                            >
                              <span className={`h-1 w-1 rounded-full ${meta.dot}`} />
                              {meta.label}
                            </span>
                            <span className="text-sm font-semibold text-zinc-900">
                              {formatRupiah(order.total)}
                            </span>
                          </div>
                        </li>
                      );
                    })
                  )}
                </ul>
              </section>

              {/* Top product */}
              <section className="rounded-sm border border-zinc-200 bg-white p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                    🏆 Produk Terlaris
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm bg-zinc-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={topProduct.image}
                      alt={topProduct.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      {topProduct.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {topProduct.unit} • Stok: 24
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-900">
                      {formatRupiah(topProduct.price)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-zinc-200 pt-3 text-center">
                  <Mini label="Terjual" value="142" />
                  <Mini label="Pendapatan" value="2.6jt" />
                  <Mini label="Rating" value="4.9" />
                </div>
              </section>
            </div>
          </div>
        </div>
    </MitraShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delta,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string | number;
  color: "rose" | "emerald" | "sky" | "amber";
  delta?: string;
}) {
  const colorMap = {
    rose: "bg-rose-50 text-rose-700",
    emerald: "bg-emerald-50 text-emerald-700",
    sky: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-sm border border-zinc-200 bg-white p-4"
    >
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-sm ${colorMap[color]}`}>
        <Icon className="h-4 w-4" strokeWidth={2.5} />
      </div>
      <p className="mt-3 truncate text-base font-semibold text-zinc-900 sm:text-lg">
        {value}
      </p>
      <p className="text-xs text-zinc-500">{label}</p>
      {delta && <p className="mt-0.5 text-[10px] text-zinc-400">{delta}</p>}
    </motion.div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-zinc-900">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </p>
    </div>
  );
}
