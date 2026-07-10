"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Store, Check, X, Search, Filter, AlertTriangle } from "lucide-react";import { toast } from "sonner";
export default function AdminMitraPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    loadStores();
  }, []);

  async function loadStores() {
    try {
      const data = await api.get("/admin/stores");
      setStores(data || []);
    } catch (e: any) {
      console.error("Failed to load stores", e);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (storeId: string, status: "APPROVED" | "REJECTED") => {
    try {
      await api.put(`/admin/stores/${storeId}/status`, { status });
      await loadStores();
      toast.success(`Status toko berhasil ${status === "APPROVED" ? "disetujui" : "ditolak"}!`);
    } catch (e: any) {
      toast.error(e.message || "Gagal mengubah status toko.");
    }
  };

  const filtered = stores.filter((s) => {
    const matchSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
      s.user?.phone?.includes(search);
    const matchStatus = statusFilter === "ALL" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCount = stores.filter((s) => s.status === "REVIEW").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-sm text-zinc-500">
        Memuat data mitra...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Kelola Mitra Toko</h1>
        <p className="text-sm text-zinc-500 mt-1">Kelola pendaftaran & status toko mitra</p>
      </div>

      {/* Alert for pending */}
      {pendingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-sm p-4 flex items-center gap-3"
        >
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">{pendingCount} toko perlu direview</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Segera lakukan persetujuan atau penolakan untuk toko yang masih dalam status REVIEW.
            </p>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Toko", value: stores.length, color: "bg-zinc-900 text-white" },
          { label: "Disetujui", value: stores.filter((s) => s.status === "APPROVED").length, color: "bg-emerald-500 text-white" },
          { label: "Ditolak", value: stores.filter((s) => s.status === "REJECTED").length, color: "bg-rose-500 text-white" },
        ].map((item) => (
          <div key={item.label} className={`rounded-sm p-4 ${item.color}`}>
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-[10px] uppercase tracking-wider opacity-80 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari nama toko, pemilik, atau no. HP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-sm text-sm focus:border-zinc-900 focus:outline-none bg-white"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 border border-zinc-200 rounded-sm text-sm focus:border-zinc-900 focus:outline-none bg-white appearance-none"
          >
            <option value="ALL">Semua Status</option>
            <option value="REVIEW">Perlu Review</option>
            <option value="APPROVED">Disetujui</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-700">
            <thead>
              <tr className="bg-zinc-50 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-200">
                <th className="px-6 py-3">Nama Toko</th>
                <th className="px-6 py-3">Pemilik</th>
                <th className="px-6 py-3">Alamat</th>
                <th className="px-6 py-3">Pasar</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Tgl Daftar</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                    {search || statusFilter !== "ALL"
                      ? "Tidak ada toko yang cocok dengan filter."
                      : "Belum ada pendaftaran toko."}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-sm bg-zinc-100 flex items-center justify-center">
                          <Store className="h-4 w-4 text-zinc-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900">{s.name}</p>
                          {s.description && (
                            <p className="text-xs text-zinc-500 mt-0.5 max-w-48 truncate">
                              {s.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-800">{s.user?.nickname || s.user?.username}</p>
                      <p className="text-xs text-zinc-500">{s.user?.phone}</p>
                      <p className="text-xs text-zinc-400">{s.user?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-600 max-w-48 truncate">
                      {s.address || "-"}
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-600">{s.market?.name || "-"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          s.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700"
                            : s.status === "REVIEW"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500">
                      {new Date(s.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {s.status === "REVIEW" ? (
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => handleUpdateStatus(s.id, "APPROVED")}
                            className="flex h-8 w-8 items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-sm"
                            title="Setujui"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(s.id, "REJECTED")}
                            className="flex h-8 w-8 items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-sm"
                            title="Tolak"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-zinc-400 italic uppercase tracking-wider">
                          {s.status === "APPROVED" ? "Aktif" : "Ditolak"}
                        </span>
                      )}
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
