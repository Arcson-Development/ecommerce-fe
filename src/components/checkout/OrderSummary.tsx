"use client";

import { motion } from "framer-motion";
import { ChevronDown, Truck, CreditCard } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/format-rupiah";

const API_HOST = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface OrderSummaryProps {
  onCheckout: (details: { shippingMethod: string; shippingCost: number; paymentMethod: string }) => void;
  isProcessing?: boolean;
}

export function OrderSummary({ onCheckout, isProcessing }: OrderSummaryProps) {
  const updateQuantity = useCart((state) => state.updateQuantity);

  const [cartDetails, setCartDetails] = useState<any[]>([]);
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [shipping, setShipping] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  
  const [shippingOpen, setShippingOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const dbCart = await api.get("/cart");
        setCartDetails(dbCart);

        if (dbCart.length > 0) {
          const storeId = dbCart[0]?.variant?.product?.storeId;
          if (storeId) {
            const settings = await api.get(`/mitra/store/${storeId}/checkout-settings`);
            
            const activeShippings = settings.shippings || [];
            const activePayments = settings.payments || [];

            setShippingMethods(activeShippings);
            setPaymentMethods(activePayments);

            if (activeShippings.length > 0) {
              setShipping(activeShippings[0]);
            }
            if (activePayments.length > 0) {
              setPayment(activePayments[0]);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load checkout settings", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const subtotal = cartDetails.reduce(
    (sum, item) => sum + (item.variant?.price ?? 0) * item.quantity,
    0
  );
  
  const shippingCost = subtotal >= 80000 ? 0 : (shipping?.cost ?? 0);
  const total = subtotal + shippingCost;

  if (loading) {
    return (
      <motion.aside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-sm border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500"
      >
        Memuat ringkasan pesanan...
      </motion.aside>
    );
  }

  if (cartDetails.length === 0) {
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
        {cartDetails.map((item) => {
          const variant = item.variant;
          const product = variant?.product;
          if (!product) return null;

          const rawImg = product.images?.[0];
          const image = rawImg && rawImg.startsWith("/uploads")
            ? `${API_HOST}${rawImg}`
            : (rawImg || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80");

          return (
            <li
              key={item.id}
              className="grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-4"
            >
              <div className="flex items-start gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-zinc-100">
                  <Image
                    src={image}
                    alt={product.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm text-zinc-800">
                    {product.name} - {variant.name}
                  </p>
                  <p className="text-xs text-zinc-500">× {item.quantity}</p>
                  <button
                    type="button"
                    onClick={async () => {
                      await updateQuantity(variant.id, item.quantity - 1);
                      // Reload cart details locally after updating quantity
                      const dbCart = await api.get("/cart");
                      setCartDetails(dbCart);
                    }}
                    className="mt-1 text-xs text-zinc-400 underline-offset-2 hover:text-zinc-700 hover:underline"
                  >
                    Kurangi
                  </button>
                </div>
              </div>
              <span className="text-sm font-medium text-zinc-900">
                {formatRupiah(variant.price * item.quantity)}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Totals */}
      <div className="space-y-2 border-t border-zinc-200 px-6 py-4 text-sm">
        <Row label="Subtotal" value={formatRupiah(subtotal)} />
        <Row
          label="Pengiriman"
          valueRight={shipping ? shipping.name : "-"}
          value={
            shippingCost === 0 && shipping ? (
              <span className="font-medium text-emerald-600">GRATIS</span>
            ) : shipping ? (
              formatRupiah(shippingCost)
            ) : (
              "-"
            )
          }
        />
        <div className="!mt-3 flex items-center justify-between border-t border-zinc-200 pt-3 text-base font-semibold text-zinc-900">
          <span>Total</span>
          <span>{formatRupiah(total)}</span>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Shipping method */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Metode Pengiriman
          </label>
          <div className="relative">
            {shippingMethods.length === 0 ? (
              <div className="border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
                Toko ini tidak menyediakan metode pengiriman aktif.
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShippingOpen(!shippingOpen)}
                  className="flex w-full items-center justify-between border border-zinc-200 bg-zinc-50 px-4 py-3 text-left text-sm text-zinc-700 transition-colors hover:border-zinc-400 focus:border-zinc-900 focus:bg-white"
                >
                  <span className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-zinc-400" />
                    {shipping ? (
                      <span>
                        {shipping.name}{" "}
                        <span className="text-xs text-zinc-500">({shipping.eta})</span>
                      </span>
                    ) : (
                      <span>Pilih Pengiriman</span>
                    )}
                  </span>
                  <ChevronDown className="h-4 w-4 text-zinc-400" />
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
                      className="absolute left-0 right-0 z-20 mt-1 max-h-60 overflow-auto border border-zinc-200 bg-white shadow-lg"
                    >
                      {shippingMethods.map((s) => (
                        <li key={s.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setShipping(s);
                              setShippingOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-zinc-50 ${
                              s.id === shipping?.id
                                ? "bg-zinc-50 font-medium text-zinc-900"
                                : "text-zinc-700"
                            }`}
                          >
                            {s.name} - {formatRupiah(s.cost)}{" "}
                            <span className="text-xs text-zinc-500">({s.eta})</span>
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Payment method */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Metode Pembayaran
          </label>
          <div className="relative">
            {paymentMethods.length === 0 ? (
              <div className="border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
                Toko ini tidak menyediakan metode pembayaran aktif.
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setPaymentOpen(!paymentOpen)}
                  className="flex w-full items-center justify-between border border-zinc-200 bg-zinc-50 px-4 py-3 text-left text-sm text-zinc-700 transition-colors hover:border-zinc-400 focus:border-zinc-900 focus:bg-white"
                >
                  <span className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-zinc-400" />
                    {payment ? (
                      <span>{payment.name}</span>
                    ) : (
                      <span>Pilih Pembayaran</span>
                    )}
                  </span>
                  <ChevronDown className="h-4 w-4 text-zinc-400" />
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
                      className="absolute left-0 right-0 z-20 mt-1 max-h-60 overflow-auto border border-zinc-200 bg-white shadow-lg"
                    >
                      {paymentMethods.map((m) => (
                        <li key={m.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setPayment(m);
                              setPaymentOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-zinc-50 ${
                              m.id === payment?.id
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-zinc-200 p-4">
        <motion.button
          type="button"
          onClick={() => {
            if (!shipping || !payment) {
              toast.error("Mohon pilih metode pengiriman dan pembayaran.");
              return;
            }
            onCheckout({
              shippingMethod: `${shipping.name} (${shipping.eta})`,
              shippingCost: shippingCost,
              paymentMethod: payment.name,
            });
          }}
          disabled={isProcessing || !shipping || !payment}
          whileHover={{ scale: isProcessing || !shipping || !payment ? 1 : 1.01 }}
          whileTap={{ scale: isProcessing || !shipping || !payment ? 1 : 0.98 }}
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
