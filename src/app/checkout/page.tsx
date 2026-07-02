"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { CategoryNav } from "@/components/CategoryNav";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import {
  CheckoutForm,
  type CheckoutFormData,
} from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { categories } from "@/data/products";
import { useCart } from "@/lib/cart";

const EMPTY_FORM: CheckoutFormData = {
  email: "",
  firstName: "",
  lastName: "",
  province: "",
  city: "",
  district: "",
  address: "",
  postalCode: "",
  phone: "",
  notes: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart((state) => state.items);
  const [form, setForm] = useState<CheckoutFormData>(EMPTY_FORM);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch with persisted Zustand store
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCheckout = () => {
    const required: (keyof CheckoutFormData)[] = [
      "email",
      "firstName",
      "lastName",
      "province",
      "city",
      "postalCode",
      "phone",
    ];
    const missing = required.find((k) => !form[k].trim());
    if (missing) {
      alert("Mohon lengkapi semua field yang wajib diisi.");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      router.push("/checkout/success");
    }, 800);
  };

  return (
    <>
      <TopBar />
      <Header />
      <CategoryNav categories={categories} />

      <CheckoutSteps current="checkout" />

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        {!mounted || items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px] lg:gap-12">
            <div>
              <CheckoutForm data={form} onChange={setForm} />
            </div>
            <div className="lg:sticky lg:top-6 lg:self-start">
              <OrderSummary
                onCheckout={handleCheckout}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function EmptyCart() {
  const router = useRouter();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-md py-16 text-center"
    >
      <h2 className="text-xl font-semibold text-zinc-900">
        Keranjang kamu kosong
      </h2>
      <p className="mt-2 text-sm text-zinc-500">
        Yuk, mulai belanja sayur segar favoritmu.
      </p>
      <button
        onClick={() => router.push("/")}
        className="mt-6 bg-zinc-900 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-zinc-800"
      >
        Mulai Belanja
      </button>
    </motion.div>
  );
}
