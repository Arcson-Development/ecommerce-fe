"use client";

import { motion } from "framer-motion";
import { ChevronDown, Truck, CreditCard } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { products, formatRupiah } from "@/data/products";
import type { Product } from "@/types/product";

interface OrderSummaryProps {
  onCheckout: () => void;
  isProcessing?: boolean;
}

const SHIPPING_METHODS = [
  { id: "gojek", name: "Go-jek", eta: "Estimasi 1 – 2 jam", cost: 10000 },
  { id: "grab", name: "Grab", eta: "Estimasi 2 – 3 jam", cost: 12000 },
  { id: "jne", name: "JNE Regular", eta: "Estimasi 2 – 3 hari", cost: 9000 },
];

const PAYMENT_METHODS = [
  { id: "qris", name: "QRIS (default)" },
  { id: "bca", name: "Transfer Bank BCA" },
  { id: "dana", name: "DANA" },
  { id: "cod", name: "Bayar di Tempat (COD)" },
];

export function OrderSummary({ onCheckout, isProcessing }: OrderSummaryProps) {
  const items = useCart((state) => state.items);
  const updateQuantity = useCart((state) => state.updateQuantity);

  const [shippingOpen, setShippingOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [shipping, setShipping] = useState(SHIPPING_METHODS[0]);
  const [payment, setPayment] = useState(PAYMENT_METHODS[0]);

  // Resolve cart items to products
  const lineItems = items
    .map((item) => {
      const product = products.find((p) => p.id === item.id);
      return product ? { product, quantity: item.quantity } : null;
    })
    .filter((x): x is { product: Product; quantity: number } => x !== null);

  const subtotal = lineItems.reduce(
    (sum, { product, quantity }) => sum + product.price * quantity,
    0
  );
  const shippingCost = subtotal >= 80000 ? 0 : shipping.cost;
  const total = subtotal + shippingCost;

  if (lineItems.length === 0) {
    return (
      <motion.aside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-sm border border-zinc-200 bg-white p-6"
      >
        <p className="text-center text-sm text-zinc-500">
          Keranjang kosong. Tambahkan produk terlebih dahulu.
        </p>
      </motion.aside>
    );
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      className="rounded-sm border border-zinc-200 bg-white"
    >
      <h2 className="border-b border-zinc-200 px-6 py-4 text-sm font-semibold uppercase tracking-wider text-zinc-900">
        Pesanan Anda
      </h2>

      {/* Line items header */}
      <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-zinc-200 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        <span>Produk</span>
        <span className="text-right">Subtotal</span>
      </div>

      {/* Line items list */}
      <ul className="divide-y divide-zinc-200">
        {lineItems.map(({ product, quantity }) => (
          <li
            key={product.id}
            className="grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-4"
          >
            <div className="flex items-start gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-zinc-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm text-zinc-800">
                  {product.name} - {product.unit}
                </p>
                <p className="text-xs text-zinc-500">× {quantity}</p>
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="mt-1 text-xs text-zinc-400 underline-offset-2 hover:text-zinc-700 hover:underline"
                >
                  Kurangi
                </button>
              </div>
            </div>
            <span className="text-sm font-medium text-zinc-900">
              {formatRupiah(product.price * quantity)}
            </span>
          </li>
        ))}
      </ul>

      {/* Totals */}
      <div className="space-y-2 border-t border-zinc-200 px-6 py-4 text-sm">
        <Row label="Subtotal" value={formatRupiah(subtotal)} />
        <Row
          label="Pengiriman"
          valueRight={shipping.name}
          value={
            shippingCost === 0 ? (
              <span className="font-medium text-emerald-600">GRATIS</span>
            ) : (
              formatRupiah(shippingCost)
            )
          }
        />
        <div className="!mt-3 flex items-center justify-between border-t border-zinc-200 pt-3 text-base font-semibold text-zinc-900">
          <span>Total</span>
          <span>{formatRupiah(total)}</span>
        </div>
      </div>

      {/* Shipping method */}
      <div className="border-t border-zinc-200 px-6 py-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-700">
          <Truck className="h-3.5 w-3.5" strokeWidth={2.5} />
          <span>Pengiriman</span>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShippingOpen(!shippingOpen)}
            className="flex w-full items-center justify-between border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-left text-sm text-zinc-800 transition-colors hover:border-zinc-400"
          >
            <span>
              {shipping.name}{" "}
              <span className="text-zinc-500">({shipping.eta})</span>
            </span>
            <motion.span
              animate={{ rotate: shippingOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-zinc-500" />
            </motion.span>
          </button>
          {shippingOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShippingOpen(false)}
              />
              <motion.ul
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute left-0 right-0 z-20 mt-1 overflow-hidden border border-zinc-200 bg-white shadow-lg"
              >
                {SHIPPING_METHODS.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setShipping(m);
                        setShippingOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-zinc-50 ${
                        m.id === shipping.id
                          ? "bg-zinc-50 font-medium text-zinc-900"
                          : "text-zinc-700"
                      }`}
                    >
                      {m.name}{" "}
                      <span className="text-zinc-500">({m.eta})</span>
                    </button>
                  </li>
                ))}
              </motion.ul>
            </>
          )}
        </div>
      </div>

      {/* Payment method */}
      <div className="border-t border-zinc-200 px-6 py-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-700">
          <CreditCard className="h-3.5 w-3.5" strokeWidth={2.5} />
          <span>Metode Pembayaran</span>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setPaymentOpen(!paymentOpen)}
            className="flex w-full items-center justify-between border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-left text-sm text-zinc-800 transition-colors hover:border-zinc-400"
          >
            <span className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-semibold text-zinc-500">
                QRIS
              </span>
              <span>{payment.name}</span>
            </span>
            <motion.span
              animate={{ rotate: paymentOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-zinc-500" />
            </motion.span>
          </button>
          {paymentOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setPaymentOpen(false)}
              />
              <motion.ul
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute left-0 right-0 z-20 mt-1 overflow-hidden border border-zinc-200 bg-white shadow-lg"
              >
                {PAYMENT_METHODS.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setPayment(m);
                        setPaymentOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-zinc-50 ${
                        m.id === payment.id
                          ? "bg-zinc-50 font-medium text-zinc-900"
                          : "text-zinc-700"
                      }`}
                    >
                      {m.name}
                    </button>
                  </li>
                ))}
              </motion.ul>
            </>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-zinc-200 p-4">
        <motion.button
          type="button"
          onClick={onCheckout}
          disabled={isProcessing}
          whileHover={{ scale: isProcessing ? 1 : 1.01 }}
          whileTap={{ scale: isProcessing ? 1 : 0.98 }}
          className="w-full bg-zinc-900 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {isProcessing ? "Memproses..." : "Lanjut Pembayaran"}
        </motion.button>
      </div>
    </motion.aside>
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
