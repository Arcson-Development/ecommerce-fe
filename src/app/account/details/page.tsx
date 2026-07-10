"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { AccountSidebar, AccountLayoutHeader } from "@/components/account/AccountSidebar";

export default function AccountDetailsPage() {
  const router = useRouter();
  const { user, isAuthenticated, fetchProfile } = useAuth();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isAuthenticated) { router.replace("/auth?redirect=/account/details"); return; }
    if (user) {
      setNickname(user.nickname || "");
      api.get("/users/profile").then((p) => {
        setEmail(p.email || "");
        setPhone(p.phone || "");
      }).catch(() => {});
    }
  }, [isAuthenticated, user, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/users/profile", { nickname });
      toast.success("Profil berhasil diperbarui!");
      await fetchProfile();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <TopBar /><Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <AccountLayoutHeader title="Detail Akun" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
          <AccountSidebar active="account" />
          <form onSubmit={handleSave} className="rounded-sm border border-zinc-200 bg-white p-6 sm:p-8 space-y-6">
            <div className="space-y-4">
              <Field label="Username">
                <input type="text" value={user?.username || ""} disabled className="w-full border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm text-zinc-500 cursor-not-allowed" />
              </Field>
              <Field label="Nama Panggilan">
                <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Nama panggilan" className="w-full border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:border-zinc-900 focus:bg-white focus:outline-none" />
              </Field>
              <Field label="Email">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:border-zinc-900 focus:bg-white focus:outline-none" />
              </Field>
              <Field label="Telepon">
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telepon" className="w-full border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm focus:border-zinc-900 focus:bg-white focus:outline-none" />
              </Field>
            </div>
            <button type="submit" disabled={saving} className="bg-zinc-900 text-white px-8 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-zinc-800 disabled:bg-zinc-400 transition-colors">
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<label className="block"><span className="mb-1.5 block text-sm text-zinc-800">{label}</span>{children}</label>);
}