"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { MitraShell } from "@/components/mitra/MitraShell";
import { MitraSidebar, MitraLayoutHeader } from "@/components/mitra/MitraSidebar";
import { api } from "@/lib/api";

export default function MitraSettingsPage() {
  const [shippings, setShippings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await api.get("/mitra/settings");
        setShippings(data.shippings || []);
        setPayments(data.payments || []);
      } catch (e) {
        console.error("Failed to load store settings", e);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleToggleShipping = (index: number) => {
    const updated = [...shippings];
    updated[index].isActive = !updated[index].isActive;
    setShippings(updated);
  };

  const handleChangeCost = (index: number, val: string) => {
    const updated = [...shippings];
    updated[index].customCost = val === "" ? null : parseFloat(val);
    setShippings(updated);
  };

  const handleTogglePayment = (index: number) => {
    const updated = [...payments];
    updated[index].isActive = !updated[index].isActive;
    setPayments(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/mitra/settings", {
        shippings,
        payments,
      });
      alert("Pengaturan toko berhasil disimpan!");
    } catch (e: any) {
      alert(e.message || "Gagal menyimpan pengaturan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MitraShell>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
        <MitraSidebar active="settings" />

        <div className="space-y-6">
          <MitraLayoutHeader title="Pengaturan Toko" subtitle="Konfigurasi Metode Pengiriman & Pembayaran" />

          {loading ? (
            <div className="rounded-sm border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
              Memuat pengaturan toko...
            </div>
          ) : (
            <div className="space-y-6">
              {/* Shipping Section */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-sm border border-zinc-200 bg-white p-6"
              >
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-900">
                  Metode Pengiriman Toko
                </h2>
                <p className="mb-6 text-xs text-zinc-500">
                  Aktifkan metode pengiriman kurir yang ingin Anda layani dari toko Anda. Anda juga dapat menyesuaikan tarif pengiriman custom (biarkan kosong untuk menggunakan tarif default sistem).
                </p>

                <div className="space-y-4">
                  {shippings.map((s, idx) => (
                    <div
                      key={s.id}
                      className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={`ship-${s.id}`}
                          checked={s.isActive}
                          onChange={() => handleToggleShipping(idx)}
                          className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <label htmlFor={`ship-${s.id}`} className="text-sm font-medium text-zinc-800 cursor-pointer">
                          {s.name} <span className="text-xs text-zinc-500">({s.eta})</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400">Tarif Custom (Rp):</span>
                        <input
                          type="number"
                          placeholder={s.defaultCost.toString()}
                          disabled={!s.isActive}
                          value={s.customCost !== null && s.customCost !== undefined ? s.customCost : ""}
                          onChange={(e) => handleChangeCost(idx, e.target.value)}
                          className="w-32 border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-right text-sm text-zinc-800 transition-colors focus:border-zinc-900 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* Payment Section */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-sm border border-zinc-200 bg-white p-6"
              >
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-900">
                  Metode Pembayaran Toko
                </h2>
                <p className="mb-6 text-xs text-zinc-500">
                  Aktifkan metode pembayaran yang Anda terima untuk transaksi produk dari toko Anda.
                </p>

                <div className="space-y-4">
                  {payments.map((p, idx) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`pay-${p.id}`}
                        checked={p.isActive}
                        onChange={() => handleTogglePayment(idx)}
                        className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <label htmlFor={`pay-${p.id}`} className="text-sm font-medium text-zinc-800 cursor-pointer">
                        {p.name}
                      </label>
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white px-8 py-3 text-sm font-semibold uppercase tracking-wider transition-colors disabled:bg-zinc-400 disabled:cursor-not-allowed"
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MitraShell>
  );
}
