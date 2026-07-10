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
import { formatRupiah } from "@/lib/format-rupiah";
import { useMitra } from "@/lib/mitra";
import { api } from "@/lib/api";

const ORDER_STATUS_META: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  PENDING: { label: "Menunggu", bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  PROCESSING: { label: "Diproses", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  SHIPPED: { label: "Dikirim", bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500" },
  COMPLETED: { label: "Selesai", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  CANCELLED: { label: "Batal", bg: "bg-zinc-100", text: "text-zinc-600", dot: "bg-zinc-400" },
};

export default function MitraDashboardPage() {
  const storeProfile = useMitra((s) => s.storeProfile);
  const fetchMitraStatus = useMitra((s) => s.fetchMitraStatus);
  const [mounted, setMounted] = useState(false);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchMitraStatus();
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const data = await api.get("/mitra/dashboard");
      setDashboard(data);
    } catch (e) {
      console.error("Failed to load dashboard", e);
    } finally {
      setLoading(false);
    }
  }

  const storeName = dashboard?.storeName || storeProfile?.name || "Toko Anda";
  const isApproved = storeProfile?.status === "APPROVED";
  const inboxOrders = dashboard?.inboxOrders || [];
  const revenueToday = dashboard?.revenueToday || 0;
  const totalRevenue = dashboard?.totalRevenue || 0;
  const totalOrders = dashboard?.totalOrders || 0;
  const totalProducts = dashboard?.totalProducts || 0;
  const pendingOrders = dashboard?.pendingOrders || 0;
  const processingOrders = dashboard?.processingOrders || 0;
  const shippedOrders = dashboard?.shippedOrders || 0;
  const weeklyRevenue = dashboard?.weeklyRevenue || [];

  return (
    <MitraShell>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
        <MitraSidebar active="dashboard" />

          <div className="space-y-6">
            {/* Not approved warning */}
            {mounted && storeProfile && !isApproved && (
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
                Selamat datang, {storeName} 🌿
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
                value={pendingOrders + processingOrders}
                color="rose"
                delta={pendingOrders + processingOrders > 0 ? `${pendingOrders + processingOrders} perlu diproses` : "Tidak ada"}
              />
              <StatCard
                icon={Wallet}
                label="Pendapatan Hari Ini"
                value={formatRupiah(revenueToday)}
                color="emerald"
                delta={revenueToday > 0 ? "Hari ini" : "Belum ada"}
              />
              <StatCard
                icon={Package}
                label="Total Produk"
                value={totalProducts}
                color="sky"
                delta={totalProducts > 0 ? `${totalProducts} produk` : "Belum ada"}
              />
              <StatCard
                icon={Star}
                label="Rating Toko"
                value={dashboard?.rating ? dashboard.rating.toFixed(1) : "-"}
                color="amber"
                delta={totalOrders > 0 ? `${totalOrders} pesanan selesai` : "Belum ada"}
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
                {weeklyRevenue.some((w: any) => w.value > 0) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
                    7 hari terakhir
                  </span>
                )}
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
                    inboxOrders.map((order: any) => {
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
                              {order.customer} • {order.items} produk
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
                    🏆 Produk
                  </span>
                </div>
                {totalProducts > 0 ? (
                  <>
                    <p className="text-sm text-zinc-600">
                      Kamu memiliki <strong>{totalProducts} produk</strong> di toko.
                    </p>
                    <Link
                      href="/mitra/products"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700"
                    >
                      Kelola Produk
                      <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
                    </Link>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-zinc-500">Belum ada produk.</p>
                    <Link
                      href="/mitra/products/new"
                      className="mt-2 inline-flex items-center gap-1 bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-zinc-800"
                    >
                      Tambah Produk
                    </Link>
                  </div>
                )}
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


