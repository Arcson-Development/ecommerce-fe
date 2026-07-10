"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Truck, Plus, X, Search, Power, Edit3 } from "lucide-react";
import { formatRupiah } from "@/lib/format-rupiah";
import { toast } from "sonner";

export default function AdminShippingPage() {
  const [shippings, setShippings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "", eta: "", defaultCost: "" });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await api.get("/admin/shippings");
      setShippings(data || []);
    } catch (e) {
      console.error("Failed to load shippings", e);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setForm({ name: "", code: "", eta: "", defaultCost: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, defaultCost: parseFloat(form.defaultCost) };
      if (editingId) {
        await api.put(`/admin/shippings/${editingId}`, payload);
      } else {
        await api.post("/admin/shippings", payload);
      }
      resetForm();
      await loadData();
      toast.success(editingId ? "Kurir berhasil diperbarui!" : "Kurir baru berhasil ditambahkan!");
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan data kurir.");
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      await api.put(`/admin/shippings/${id}`, { isActive: !currentActive });
      await loadData();
      toast.success(`Kurir ${!currentActive ? "diaktifkan" : "dinonaktifkan"}!`);
    } catch (e: any) {
      toast.error(e.message || "Gagal mengubah status.");
    }
  };

  const handleEdit = (s: any) => {
    setForm({ name: s.name, code: s.code, eta: s.eta, defaultCost: String(s.defaultCost) });
    setEditingId(s.id);
    setShowForm(true);
  };

  const filtered = shippings.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.code?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-sm text-zinc-500">
        Memuat data pengiriman...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Master Pengiriman</h1>
          <p className="text-sm text-zinc-500 mt-1">Kelola kurir & metode pengiriman global</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-1.5 text-xs font-semibold bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-sm uppercase tracking-wider transition-colors"
        >
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showForm ? "Batal" : "Tambah Kurir"}
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
                {editingId ? "Edit Kurir" : "Tambah Kurir Baru"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                    Nama Kurir
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: JNE"
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
                    placeholder="Contoh: jne"
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full border border-zinc-200 bg-white px-3 py-2 text-sm rounded-sm focus:border-zinc-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                    Estimasi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 1-3 hari"
                    required
                    value={form.eta}
                    onChange={(e) => setForm({ ...form, eta: e.target.value })}
                    className="w-full border border-zinc-200 bg-white px-3 py-2 text-sm rounded-sm focus:border-zinc-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                    Tarif Default (Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 15000"
                    required
                    value={form.defaultCost}
                    onChange={(e) => setForm({ ...form, defaultCost: e.target.value })}
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
                  className="px-4 py-2 bg-zinc-900 text-white text-xs font-semibold uppercase tracking-wider hover:bg-zinc-800 rounded-sm"
                >
                  {editingId ? "Simpan Perubahan" : "Simpan"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Cari kurir..."
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
                <th className="px-6 py-3">Kurir</th>
                <th className="px-6 py-3">Kode</th>
                <th className="px-6 py-3">Estimasi</th>
                <th className="px-6 py-3">Tarif Default</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    {search ? "Tidak ada kurir yang cocok." : "Belum ada data kurir."}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-sm bg-zinc-100 flex items-center justify-center">
                          <Truck className="h-4 w-4 text-zinc-500" />
                        </div>
                        <span className="font-semibold text-zinc-900">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-zinc-500">{s.code}</td>
                    <td className="px-6 py-4 text-xs text-zinc-600">{s.eta || "-"}</td>
                    <td className="px-6 py-4 font-medium text-zinc-800">
                      {s.defaultCost ? formatRupiah(s.defaultCost) : "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggle(s.id, s.isActive)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          s.isActive ? "bg-emerald-500" : "bg-zinc-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            s.isActive ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(s)}
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
