"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CreditCard, Plus, Search, X, Power, Edit3 } from "lucide-react";
import { toast } from "sonner";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "" });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await api.get("/admin/payments");
      setPayments(data || []);
    } catch (e) {
      console.error("Failed to load payments", e);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setForm({ name: "", code: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/payments/${editingId}`, form);
      } else {
        await api.post("/admin/payments", form);
      }
      resetForm();
      await loadData();
      toast.success(editingId ? "Metode pembayaran berhasil diperbarui!" : "Metode pembayaran baru berhasil ditambahkan!");
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan metode pembayaran.");
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      await api.put(`/admin/payments/${id}`, { isActive: !currentActive });
      await loadData();
      toast.success(`Metode pembayaran ${!currentActive ? "diaktifkan" : "dinonaktifkan"}!`);
    } catch (e: any) {
      toast.error(e.message || "Gagal mengubah status.");
    }
  };

  const handleEdit = (p: any) => {
    setForm({ name: p.name, code: p.code });
    setEditingId(p.id);
    setShowForm(true);
  };

  const filtered = payments.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.code?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-sm text-zinc-500">
        Memuat data pembayaran...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Pembayaran Global</h1>
          <p className="text-sm text-zinc-500 mt-1">Kelola metode pembayaran yang tersedia untuk semua toko</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-1.5 text-xs font-semibold bg-primary hover:bg-primary-hover text-primary-fg px-4 py-2 rounded-sm uppercase tracking-wider transition-colors"
        >
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showForm ? "Batal" : "Tambah Metode"}
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-white border border-zinc-200 rounded-sm p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                {editingId ? "Edit Metode Pembayaran" : "Tambah Metode Pembayaran Baru"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                    Nama Pembayaran
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Transfer Bank"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-zinc-200 bg-white px-3 py-2 text-sm rounded-sm focus:border-zinc-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                    Kode Unik
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: bank_transfer"
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full border border-zinc-200 bg-white px-3 py-2 text-sm rounded-sm focus:border-zinc-900 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-zinc-300 text-zinc-700 text-xs font-semibold uppercase tracking-wider hover:bg-zinc-100 rounded-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-fg text-xs font-semibold uppercase tracking-wider hover:bg-primary-hover rounded-sm"
                >
                  {editingId ? "Simpan Perubahan" : "Simpan"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Metode", value: payments.length, color: "bg-zinc-900 text-white" },
          { label: "Aktif", value: payments.filter((p) => p.isActive).length, color: "bg-emerald-500 text-white" },
          { label: "Nonaktif", value: payments.filter((p) => !p.isActive).length, color: "bg-zinc-300 text-zinc-700" },
        ].map((item) => (
          <div key={item.label} className={`rounded-sm p-4 ${item.color}`}>
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-[10px] uppercase tracking-wider opacity-80 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Cari metode pembayaran..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-sm text-sm focus:border-zinc-900 focus:outline-none bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-700">
            <thead>
              <tr className="bg-zinc-50 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-200">
                <th className="px-6 py-3">Metode</th>
                <th className="px-6 py-3">Kode</th>
                <th className="px-6 py-3">Tanggal Dibuat</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    {search ? "Tidak ada metode yang cocok." : "Belum ada metode pembayaran."}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-sm bg-zinc-100 flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-zinc-500" />
                        </div>
                        <span className="font-semibold text-zinc-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-zinc-500">{p.code}</td>
                    <td className="px-6 py-4 text-xs text-zinc-500">
                      {new Date(p.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggle(p.id, p.isActive)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          p.isActive ? "bg-emerald-500" : "bg-zinc-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            p.isActive ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(p)}
                        className="flex h-8 w-8 items-center justify-center bg-zinc-100 text-zinc-600 hover:bg-zinc-200 rounded-sm ml-auto"
                        title="Edit"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
