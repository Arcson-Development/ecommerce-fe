"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Tag, Plus, Search, X, Power, Trash2, Check, Edit3 } from "lucide-react";
import { toast } from "sonner";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", icon: "", hasDropdown: false });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await api.get("/categories");
      setCategories(data || []);
    } catch (e) {
      console.error("Failed to load categories", e);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setForm({ name: "", icon: "", hasDropdown: false });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
      } else {
        await api.post("/categories", form);
      }
      resetForm();
      await loadData();
      toast.success(editingId ? "Kategori berhasil diperbarui!" : "Kategori baru berhasil ditambahkan!");
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan kategori.");
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      await api.put(`/categories/${id}`, { isActive: !currentActive });
      await loadData();
      toast.success(`Kategori ${!currentActive ? "diaktifkan" : "dinonaktifkan"}!`);
    } catch (e: any) {
      toast.error(e.message || "Gagal mengubah status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus kategori ini? Tindakan ini tidak dapat dibatalkan.")) return;
    try {
      await api.delete(`/categories/${id}`);
      await loadData();
      toast.success("Kategori berhasil dihapus!");
    } catch (e: any) {
      toast.error(e.message || "Gagal menghapus kategori.");
    }
  };

  const handleEdit = (c: any) => {
    setForm({ name: c.name, icon: c.icon || "", hasDropdown: c.hasDropdown || false });
    setEditingId(c.id);
    setShowForm(true);
  };

  const filtered = categories.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-sm text-zinc-500">
        Memuat data kategori...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Master Kategori</h1>
          <p className="text-sm text-zinc-500 mt-1">Kelola kategori produk</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-1.5 text-xs font-semibold bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-sm uppercase tracking-wider transition-colors"
        >
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showForm ? "Batal" : "Tambah Kategori"}
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
                {editingId ? "Edit Kategori" : "Tambah Kategori Baru"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                    Nama Kategori
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Sayuran"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border border-zinc-200 bg-white px-3 py-2 text-sm rounded-sm focus:border-zinc-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                    Icon (opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Nama icon"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="w-full border border-zinc-200 bg-white px-3 py-2 text-sm rounded-sm focus:border-zinc-900 focus:outline-none"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.hasDropdown}
                      onChange={(e) => setForm({ ...form, hasDropdown: e.target.checked })}
                      className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                    />
                    <span className="text-xs font-semibold text-zinc-700">Memiliki Dropdown</span>
                  </label>
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
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Kategori", value: categories.length, color: "bg-zinc-900 text-white" },
          { label: "Aktif", value: categories.filter((c) => c.isActive).length, color: "bg-emerald-500 text-white" },
          { label: "Dropdown", value: categories.filter((c) => c.hasDropdown).length, color: "bg-blue-500 text-white" },
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
          placeholder="Cari kategori..."
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
                <th className="px-6 py-3">Nama</th>
                <th className="px-6 py-3">Icon</th>
                <th className="px-6 py-3 text-center">Dropdown</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    {search ? "Tidak ada kategori yang cocok." : "Belum ada kategori."}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-sm bg-zinc-100 flex items-center justify-center">
                          <Tag className="h-4 w-4 text-zinc-500" />
                        </div>
                        <span className="font-semibold text-zinc-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500 font-mono">{c.icon || "-"}</td>
                    <td className="px-6 py-4 text-center">
                      {c.hasDropdown ? (
                        <Check className="h-4 w-4 text-emerald-600 inline" />
                      ) : (
                        <X className="h-4 w-4 text-zinc-300 inline" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggle(c.id, c.isActive)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          c.isActive ? "bg-emerald-500" : "bg-zinc-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            c.isActive ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => handleEdit(c)}
                          className="flex h-8 w-8 items-center justify-center bg-zinc-100 text-zinc-600 hover:bg-zinc-200 rounded-sm"
                          title="Edit"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
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
