"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { AccountSidebar, AccountLayoutHeader } from "@/components/account/AccountSidebar";
import { CreditCard } from "lucide-react";

export default function AccountPaymentPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!isAuthenticated) { router.replace("/auth?redirect=/account/payment"); }
  }, [isAuthenticated, router]);

  if (!mounted) return null;

  return (
    <>
      <TopBar /><Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <AccountLayoutHeader title="Metode Pembayaran" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
          <AccountSidebar active="payment" />
          <div className="rounded-sm border border-zinc-200 bg-white p-12 text-center">
            <CreditCard className="mx-auto h-10 w-10 text-zinc-300" />
            <p className="mt-4 text-sm text-zinc-500">Belum ada metode pembayaran tersimpan.</p>
          </div>
        </div>
      </main>
    </>
  );
}