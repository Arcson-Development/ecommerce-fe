"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  MapPin,
  CreditCard,
  Truck,
  Package,
  CheckCircle2,
} from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import {
  AccountSidebar,
  AccountLayoutHeader,
} from "@/components/account/AccountSidebar";
import { categories, formatRupiah } from "@/data/products";
import { useOrders } from "@/lib/orders";
import {
  ORDER_STATUS_META,
  formatOrderDateTime,
} from "@/lib/order-format";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const getOrder = useOrders((s) => s.getOrder);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const order = mounted ? getOrder(params.id) : undefined;

  if (!mounted) return null;
  if (!order) {
    return (
      <>
        <TopBar />
        <Header />
        <CategoryNav categories={categories} />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
          <h1 className="text-xl font-semibold text-zinc-900">
            Pesanan tidak ditemukan
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Pesanan yang kamu cari tidak tersedia.
          </p>
          <button
            onClick={() => router.push("/account/orders")}
            className="mt-6 bg-zinc-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white"
          >
            Kembali ke Daftar Pesanan
          </button>
        </main>
      </>
    );
  }

  const meta = ORDER_STATUS_META[order.status];

  return (
    <>
      <TopBar />
      <Header />
      <CategoryNav categories={categories} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => router.push("/account/orders")}
          className="mb-4 flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-zinc-900"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          Kembali ke daftar pesanan
        </button>
        <AccountLayoutHeader title={`Pesanan #${order.id}`} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
          <AccountSidebar active="orders" />

          <div className="space-y-4">
            {/* Status banner */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-sm border ${meta.bg} p-5`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className={`text-xs uppercase tracking-wider ${meta.text}`}>
                    Status Pesanan
                  </p>
                  <p className={`mt-1 text-lg font-semibold ${meta.text}`}>
                    {meta.label}
                  </p>
                  <p className="mt-1 text-xs text-zinc-600">
                    Dipesan pada {formatOrderDateTime(order.date)}
                  </p>
                </div>
                {order.trackingNumber && (
                  <div className="rounded-sm border border-white/50 bg-white/60 px-4 py-2.5">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                      No. Resi
                    </p>
                    <p className="font-mono text-sm font-semibold text-zinc-900">
                      {order.trackingNumber}
                    </p>
                  </div>
                )}
              </div>
            </motion.section>

            {/* Items */}
            <section className="rounded-sm border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 px-5 py-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900">
                  Produk
                </h3>
              </div>
              <ul className="divide-y divide-zinc-200">
                {order.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-zinc-100">
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        sizes="64px"
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
                  </li>
                ))}
              </ul>

              {/* Totals */}
              <div className="space-y-2 border-t border-zinc-200 bg-zinc-50 px-5 py-4 text-sm">
                <Row label="Subtotal" value={formatRupiah(order.subtotal)} />
                <Row
                  label="Pengiriman"
                  value={
                    order.shippingCost === 0 ? (
                      <span className="font-medium text-emerald-600">
                        GRATIS
                      </span>
                    ) : (
                      formatRupiah(order.shippingCost)
                    )
                  }
                />
                <div className="flex items-center justify-between border-t border-zinc-200 pt-2 text-base font-semibold text-zinc-900">
                  <span>Total</span>
                  <span>{formatRupiah(order.total)}</span>
                </div>
              </div>
            </section>

            {/* Shipping + Payment info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoCard icon={MapPin} title="Alamat Pengiriman">
                <p className="font-medium text-zinc-900">
                  {order.shippingAddress.name}
                </p>
                <p className="text-zinc-600">
                  {order.shippingAddress.phone}
                </p>
                <p className="mt-1 text-zinc-600">
                  {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
                  {order.shippingAddress.province}{" "}
                  {order.shippingAddress.postalCode}
                </p>
              </InfoCard>

              <div className="space-y-4">
                <InfoCard icon={Truck} title="Metode Pengiriman">
                  <p className="font-medium text-zinc-900">
                    {order.shippingMethod}
                  </p>
                </InfoCard>
                <InfoCard icon={CreditCard} title="Metode Pembayaran">
                  <p className="font-medium text-zinc-900">
                    {order.paymentMethod}
                  </p>
                </InfoCard>
              </div>
            </div>

            {/* Action button */}
            {order.status === "completed" && (
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-sm bg-zinc-900 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-zinc-800 sm:w-auto sm:px-8"
              >
                <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
                Beli Lagi
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-zinc-700">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-sm border border-zinc-200 bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-zinc-500" strokeWidth={2} />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-700">
          {title}
        </h3>
      </div>
      <div className="space-y-0.5 text-sm">{children}</div>
    </section>
  );
}
