"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { useCart } from "@/lib/cart";
import { formatRupiah } from "@/lib/format-rupiah";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const items = useCart((state) => state.items);
  const clear = useCart((state) => state.clear);

  // Clear cart on mount
  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate a fake order number
  const orderNumber = `SNW-${Date.now().toString().slice(-7)}`;

  // Recalculate total (since cart was cleared, just show summary based on state at navigation)
  const subtotal = items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);
  const shipping = subtotal >= 80000 ? 0 : 10000;
  const total = subtotal + shipping;

  return (
    <>
      <TopBar />
      <Header />

      <CheckoutSteps current="complete" />

      <main className="mx-auto max-w-2xl px-4 pb-16 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2,
            }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"
          >
            <CheckCircle2
              className="h-12 w-12 text-emerald-600"
              strokeWidth={1.5}
            />
          </motion.div>

          <h1 className="mt-6 text-2xl font-semibold text-zinc-900 sm:text-3xl">
            Terima kasih atas pesananmu!
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Pesananmu sedang diproses. Kami akan mengirim update via email &amp;
            WhatsApp.
          </p>

          <div className="mt-8 inline-flex flex-col gap-1 border border-zinc-200 bg-zinc-50 px-8 py-4">
            <span className="text-xs uppercase tracking-wider text-zinc-500">
              Nomor Pesanan
            </span>
            <span className="font-mono text-lg font-semibold text-zinc-900">
              {orderNumber}
            </span>
          </div>

          <div className="mt-8 border border-zinc-200 bg-white p-6 text-left">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-900">
              Ringkasan Pembayaran
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-zinc-700">
                <span>Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-700">
                <span>Pengiriman</span>
                <span>
                  {shipping === 0 ? (
                    <span className="font-medium text-emerald-600">GRATIS</span>
                  ) : (
                    formatRupiah(shipping)
                  )}
                </span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-semibold text-zinc-900">
                <span>Total</span>
                <span>{formatRupiah(total)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => router.push("/")}
              className="bg-zinc-900 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-zinc-800"
            >
              Kembali ke Beranda
            </button>
            <button
              onClick={() => router.push("/")}
              className="border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-wider text-zinc-800 transition-colors hover:border-zinc-700"
            >
              Belanja Lagi
            </button>
          </div>
        </motion.div>
      </main>
    </>
  );
}
