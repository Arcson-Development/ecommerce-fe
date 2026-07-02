"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, Printer, Send, User, MapPin } from "lucide-react";
import { MitraShell } from "@/components/mitra/MitraShell";
import { MitraSidebar } from "@/components/mitra/MitraSidebar";
import { merchantOrders, merchantProducts } from "@/lib/merchant-data";
import { formatRupiah } from "@/data/products";

export default function MitraOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const order = mounted
    ? merchantOrders.find((o) => o.id === params.id)
    : undefined;

  if (!mounted) return null;

  if (!order) {
    return (
      <MitraShell>
        <div className="py-16 text-center">
          <h1 className="text-xl font-semibold text-zinc-900">
            Pesanan tidak ditemukan
          </h1>
          <button
            onClick={() => router.push("/mitra/orders")}
            className="mt-6 bg-zinc-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white"
          >
            Kembali
          </button>
        </div>
      </MitraShell>
    );
  }

  const handleSend = () => {
    if (confirm(`Kirim pesanan #${order.id} ke kurir?`)) {
      alert(`Pesanan #${order.id} berhasil dikirim ke ${order.shippingMethod}.`);
      router.push("/mitra/orders");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <MitraShell>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
        <MitraSidebar active="orders" />

        <div className="space-y-4">
          {/* Top action bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/mitra/orders")}
              className="flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-zinc-900"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2} />
              Kembali ke Pesanan Masuk
            </button>
          </div>

          {/* Header card */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-sm border border-zinc-200 bg-white p-6"
          >
            <h2 className="text-xl font-semibold text-zinc-900 sm:text-2xl">
              Detail Pesanan
            </h2>
            <div className="mt-3 border-t border-zinc-200 pt-3">
              <p className="text-sm font-semibold text-zinc-900">
                Pesanan Masuk!
              </p>
              <p className="text-xs italic text-zinc-500">
                Harap segera selesaikan pesanan ini ya :D
              </p>
            </div>

            {/* Penerima */}
            <div className="mt-5 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                <User className="h-4 w-4 text-zinc-600" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Penerima
                </p>
                <p className="text-sm font-semibold text-zinc-900">
                  {order.shippingAddress.recipient}
                </p>
                <p className="text-xs text-zinc-600">
                  {order.shippingAddress.phone}
                </p>
              </div>
            </div>

            {/* Alamat */}
            <div className="mt-4 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                <MapPin className="h-4 w-4 text-zinc-600" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Alamat Pengiriman
                </p>
                <p className="text-sm text-zinc-700">
                  {order.shippingAddress.street}
                </p>
                <p className="text-sm text-zinc-700">
                  {order.shippingAddress.district}
                </p>
                <p className="text-sm text-zinc-700">
                  {order.shippingAddress.city}, {order.shippingAddress.province}{" "}
                  {order.shippingAddress.postalCode}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 border border-zinc-300 bg-white py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:border-zinc-700 hover:text-zinc-900"
              >
                <Printer className="h-4 w-4" strokeWidth={2} />
                Print Nota
              </button>
              <button
                type="button"
                onClick={handleSend}
                className="flex items-center justify-center gap-2 bg-zinc-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                <Send className="h-4 w-4" strokeWidth={2} />
                Kirim Pesanan
              </button>
            </div>
          </motion.section>

          {/* Order summary panel (right column on lg) */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-sm border border-zinc-200 bg-white"
          >
            <div className="border-b border-zinc-200 px-6 py-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900">
                Pesanan Anda
              </h3>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-zinc-200 px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              <span>Produk</span>
              <span className="text-right">Subtotal</span>
            </div>

            <ul className="divide-y divide-zinc-200">
              {order.items.map((item, i) => {
                const productImage =
                  merchantProducts.find(
                    (p) => p.name.toLowerCase() === item.name.toLowerCase()
                  )?.image ?? merchantProducts[0].image;
                return (
                  <li
                    key={i}
                    className="grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-zinc-100">
                        <Image
                          src={productImage}
                          alt={item.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <p className="text-sm text-zinc-800">
                          {item.name} - {item.unit}
                        </p>
                        <p className="text-xs text-zinc-500">× {item.qty}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-zinc-900">
                      {formatRupiah(item.price * item.qty)}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="space-y-2 border-t border-zinc-200 px-6 py-4 text-sm">
              <Row label="Subtotal" value={formatRupiah(order.subtotal)} />
              <Row
                label="Pengiriman"
                valueRight={order.shippingMethod}
                value={
                  order.shippingCost === 0 ? (
                    <span className="font-medium text-emerald-600">GRATIS</span>
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

            <div className="border-t border-zinc-200 px-6 py-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Metode Pembayaran
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-semibold text-zinc-500">
                    QRIS
                  </span>
                  <span className="text-sm font-medium text-zinc-900">
                    {order.paymentMethod}
                  </span>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    order.paymentStatus === "Lunas"
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </MitraShell>
  );
}

function Row({
  label,
  value,
  valueRight,
}: {
  label: string;
  value: React.ReactNode;
  valueRight?: string;
}) {
  return (
    <div className="flex items-center justify-between text-zinc-700">
      <span>
        {label}
        {valueRight && (
          <span className="ml-2 text-xs text-zinc-500">{valueRight}</span>
        )}
      </span>
      <span>{value}</span>
    </div>
  );
}
