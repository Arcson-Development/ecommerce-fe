"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { AccountSidebar, AccountLayoutHeader } from "@/components/account/AccountSidebar";
import { MapPin, Plus, Trash2, Check } from "lucide-react";

export default function AccountAddressPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isAuthenticated) { router.replace("/auth?redirect=/account/address"); return; }
    loadAddresses();
  }, [isAuthenticated, router]);

  async function loadAddresses() {
    try {
      const data = await api.get("/users/addresses");
      setAddresses(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus alamat ini?")) return;
    try {
      await api.delete(`/users/addresses/${id}`);
      loadAddresses();
    } catch (e: any) { toast.error(e.message || "Gagal menghapus."); }
  }

  if (!mounted) return null;

  return (
    <>
      <TopBar /><Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <AccountLayoutHeader title="Alamat Saya" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
          <AccountSidebar active="addresses" />
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="rounded-sm border border-zinc-200 bg-white p-4 flex gap-3 items-start">
                <MapPin className="h-5 w-5 text-zinc-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-zinc-900">{addr.recipient} - {addr.phone}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{addr.street}, {addr.district}, {addr.city}, {addr.province} {addr.postalCode}</p>
                  {addr.isPrimary && <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5">Utama</span>}
                </div>
                <button onClick={() => handleDelete(addr.id)} className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            {!loading && addresses.length === 0 && (
              <p className="text-sm text-zinc-500 text-center py-8">Belum ada alamat tersimpan.</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}