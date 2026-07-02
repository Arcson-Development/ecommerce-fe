"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Package, Truck, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import {
  AccountSidebar,
  AccountLayoutHeader,
} from "@/components/account/AccountSidebar";
import { categories } from "@/data/products";
import { useOrders } from "@/lib/orders";
import { formatRupiah } from "@/data/products";
import {
  ORDER_STATUS_META,
  formatOrderDate,
} from "@/lib/order-format";

export default function AccountDashboardPage() {
  const orders = useOrders((s) => s.orders);

  const counts = {
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };
  const totalSpent = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  const recent = orders.slice(0, 3);

  return (
    <>
      <TopBar />
      <Header />
      <CategoryNav categories={categories} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <AccountLayoutHeader title="Dashboard" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
          <AccountSidebar active="dashboard" />

          <div className="space-y-6">
            {/* Welcome banner */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-sm border border-zinc-200 bg-gradient-to-br from-zinc-900 to-zinc-700 p-6 text-white sm:p-8"
            >
              <p className="text-xs uppercase tracking-wider text-zinc-300">
                Selamat datang kembali
              </p>
              <h2 className="mt-1 text-xl font-semibold sm:text-2xl">
                Hai, Juniko 👋
              </h2>
              <p className="mt-2 text-sm text-zinc-300">
                Dari dashboard ini kamu bisa melihat pesanan, mengatur alamat,
                dan memperbarui detail akun.
              </p>
            </motion.section>

            {/* Stats grid */}
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <StatCard
                icon={Package}
                label="Diproses"
                value={counts.processing}
                color="amber"
              />
              <StatCard
                icon={Truck}
                label="Dikirim"
                value={counts.shipped}
                color="sky"
              />
              <StatCard
                icon={CheckCircle2}
                label="Selesai"
                value={counts.completed}
                color="emerald"
              />
              <StatCard
                icon={XCircle}
                label="Dibatalkan"
                value={counts.cancelled}
                color="rose"
              />
            </section>

            {/* Total spent */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-sm border border-zinc-200 bg-white p-5"
            >
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                Total Belanja
              </p>
              <p className="mt-1 text-2xl font-semibold text-zinc-900">
                {formatRupiah(totalSpent)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Akumulasi dari {orders.length - counts.cancelled} pesanan
                berhasil
              </p>
            </motion.section>

            {/* Recent orders */}
            <section className="rounded-sm border border-zinc-200 bg-white">
              <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900">
                  Pesanan Terbaru
                </h3>
                <Link
                  href="/account/orders"
                  className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700"
                >
                  Lihat Semua
                  <ArrowRight className="h-3 w-3" strokeWidth={2.5} />
                </Link>
              </div>

              <ul className="divide-y divide-zinc-200">
                {recent.map((order) => {
                  const meta = ORDER_STATUS_META[order.status];
                  return (
                    <li key={order.id} className="px-5 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-mono text-sm font-semibold text-zinc-900">
                            #{order.id}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {formatOrderDate(order.date)} • {order.items.length} produk
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.bg} ${meta.text}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${meta.dot}`}
                            />
                            {meta.label}
                          </span>
                          <span className="text-sm font-semibold text-zinc-900">
                            {formatRupiah(order.total)}
                          </span>
                        </div>
                      </div>

                      {/* Product thumbs */}
                      <div className="mt-3 flex items-center gap-2">
                        {order.items.slice(0, 4).map((item, i) => (
                          <div
                            key={i}
                            className="relative h-10 w-10 shrink-0 overflow-hidden rounded-sm bg-zinc-100"
                          >
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              fill
                              sizes="40px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ))}
                        {order.items.length > 4 && (
                          <span className="text-xs text-zinc-500">
                            +{order.items.length - 4} lainnya
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: number;
  color: "amber" | "sky" | "emerald" | "rose";
}) {
  const colorMap = {
    amber: "bg-amber-50 text-amber-700",
    sky: "bg-sky-50 text-sky-700",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
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
      <p className="mt-3 text-2xl font-semibold text-zinc-900">{value}</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </motion.div>
  );
}
