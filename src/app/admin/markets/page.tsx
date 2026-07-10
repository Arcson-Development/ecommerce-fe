"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Building2, Plus, Search, X, MapPin, Power, Edit3, Trash2 } from "lucide-react";
import { LeafletMap } from "@/components/LeafletMap";
import { toast } from "sonner";

export default function AdminMarketsPage() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", address: "", lat: -6.2088, lng: 106.8456 });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await api.get("/markets/admin");
      setMarkets(data || []);
    } catch (e) {
      console.error("Failed to load markets", e);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setForm({ name: "", address: "", lat: -6.2088, lng: 106.8456 });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/markets/${editingId}`, form);
      } else {
        await api.post("/markets", form);
      }
      resetForm();
      await loadData();
      toast.success(editingId ? "Pasar berhasil diperbarui!" : "Pasar baru berhasil ditambahkan!");
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan data pasar.");
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      await api.put(`/markets/${id}`, { isActive: !currentActive });
      await loadData();
      toast.success(`Pasar ${!currentActive ? "diaktifkan" : "dinonaktifkan"}!`);
    } catch (e: any) {
      toast.error(e.message || "Gagal mengubah status pasar.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pasar ini? Tindakan ini akan menonaktifkan pasar.")) return;
    try {
      await api.delete(`/markets/${id}`);
      await loadData();
      toast.success("Pasar berhasil dinonaktifkan!");
    } catch (e: any) {
      toast.error(e.message || "Gagal menghapus pasar.");
    }
  };

  const handleEdit = (m: any) => {
    setForm({ name: m.name, address: m.address || "", lat: m.lat || -6.2088, lng: m.lng || 106.8456 });
    setEditingId(m.id);
    setShowForm(true);
  };

  const filtered = markets.filter(
    (m) =>
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.address?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-sm text-zinc-500">
        Memuat data pasar...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Master Pasar</h1>
          <p className="text-sm text-zinc-500 mt-1">Kelola data pasar tradisional</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-1.5 text-xs font-semibold bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-sm uppercase tracking-wider transition-colors"
        >
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showForm ? "Batal" : "Tambah Pasar"}
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
                {editingId ? "Edit Pasar" : "Tambah Pasar Baru"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                    Nama Pasar
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Pasar Senen"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-zinc-200 bg-white px-3 py-2 text-sm rounded-sm focus:border-zinc-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                    Alamat
                  </label>
                  <input
                    type="text"
                    placeholder="Alamat lengkap pasar"
                    required
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full border border-zinc-200 bg-white px-3 py-2 text-sm rounded-sm focus:border-zinc-900 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                  Pilih Lokasi di Peta
                </p>
                <div className="h-64 border border-zinc-200 rounded-sm overflow-hidden">
                  <LeafletMap
                    lat={form.lat}
                    lng={form.lng}
                    onSelectLocation={(lat, lng) => setForm({ ...form, lat, lng })}
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

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total Pasar", value: markets.length, color: "bg-zinc-900 text-white" },
          { label: "Aktif", value: markets.filter((m) => m.isActive).length, color: "bg-emerald-500 text-white" },
          { label: "Nonaktif", value: markets.filter((m) => !m.isActive).length, color: "bg-zinc-300 text-zinc-700" },
          { label: "Total Toko", value: markets.reduce((sum: number, m: any) => sum + (m.stores?.length || 0), 0), color: "bg-blue-500 text-white" },
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
          placeholder="Cari pasar..."
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
                <th className="px-6 py-3">Nama Pasar</th>
                <th className="px-6 py-3">Alamat</th>
                <th className="px-6 py-3">Koordinat</th>
                <th className="px-6 py-3 text-center">Toko Terdaftar</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    {search ? "Tidak ada pasar yang cocok." : "Belum ada data pasar."}
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-sm bg-zinc-100 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-zinc-500" />
                        </div>
                        <span className="font-semibold text-zinc-900">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-600 max-w-60 truncate">
                      <div className="flex items-start gap-1">
                        <MapPin className="h-3 w-3 text-zinc-400 mt-0.5 shrink-0" />
                        <span>{m.address || "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-zinc-500">
                      {m.lat ? `${m.lat.toFixed(4)}, ${m.lng.toFixed(4)}` : "-"}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-zinc-800">
                      {m.stores?.length || 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggle(m.id, m.isActive)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          m.isActive ? "bg-emerald-500" : "bg-zinc-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            m.isActive ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => handleEdit(m)}
                          className="flex h-8 w-8 items-center justify-center bg-zinc-100 text-zinc-600 hover:bg-zinc-200 rounded-sm"
                          title="Edit"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="flex h-8 w-8 items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-sm"
                          title="Hapus"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
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
