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
import { useAuth } from "@/lib/auth";
import { useOrders } from "@/lib/orders";

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
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const items = useCart((state) => state.items);
  const [form, setForm] = useState<CheckoutFormData>(EMPTY_FORM);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const unsub = useAuth.persist.onFinishHydration(() => setHydrated(true));
    if (useAuth.persist.hasHydrated()) setHydrated(true);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/auth?redirect=/checkout");
    } else {
      useCart.getState().fetchCart();
    }
  }, [hydrated, isAuthenticated, router]);

  if (!mounted || !hydrated) {
    return <CheckoutShell><LoadingState /></CheckoutShell>;
  }

  if (!isAuthenticated) {
    return <CheckoutShell><LoadingState /></CheckoutShell>;
  }

  const handleCheckout = async (details: {
    shippingMethod: string;
    shippingCost: number;
    paymentMethod: string;
  }) => {
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

    const { isAuthenticated } = useAuth.getState();
    if (!isAuthenticated) {
      alert("Anda harus masuk (login) terlebih dahulu untuk membuat pesanan.");
      router.push("/auth");
      return;
    }

    setIsProcessing(true);
    try {
      // Send shipping details to backend and get midtrans redirect URL
      const checkoutResult = await useOrders.getState().checkout(details);
      
      if (checkoutResult && checkoutResult.redirectUrl) {
        // Clear local cart
        await useCart.getState().clear();
        // Redirect browser to Midtrans Snap Payment page
        window.location.href = checkoutResult.redirectUrl;
      } else {
        alert("Gagal memproses link pembayaran Midtrans.");
        setIsProcessing(false);
      }
    } catch (e: any) {
      alert(e.message || "Gagal melakukan checkout.");
      setIsProcessing(false);
    }
  };

  return (
    <CheckoutShell>
      {items.length === 0 ? (
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
    </CheckoutShell>
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

function CheckoutShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <Header />
      <CategoryNav categories={categories} />
      <CheckoutSteps current="checkout" />
      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        {children}
      </main>
    </>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
    </div>
  );
}
