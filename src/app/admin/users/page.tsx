"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Users, Search, Shield, Filter } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await api.get("/admin/users");
      setUsers(data || []);
    } catch (e: any) {
      console.error("Failed to load users", e);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      await loadUsers();
      toast.success(`Role user berhasil diubah menjadi ${role}!`);
    } catch (e: any) {
      toast.error(e.message || "Gagal mengubah role user.");
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search);
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleCounts = {
    total: users.length,
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
    MITRA: users.filter((u) => u.role === "MITRA").length,
    BUYER: users.filter((u) => u.role === "BUYER").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-sm text-zinc-500">
        Memuat data users...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Manage Users</h1>
        <p className="text-sm text-zinc-500 mt-1">Kelola semua pengguna sistem Pasar Jaya</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total User", value: roleCounts.total, color: "bg-zinc-900 text-white" },
          { label: "Admin", value: roleCounts.ADMIN, color: "bg-purple-500 text-white" },
          { label: "Mitra", value: roleCounts.MITRA, color: "bg-amber-500 text-white" },
          { label: "Pembeli", value: roleCounts.BUYER, color: "bg-blue-500 text-white" },
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
            placeholder="Cari username, email, atau no. HP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-sm text-sm focus:border-zinc-900 focus:outline-none bg-white"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 border border-zinc-200 rounded-sm text-sm focus:border-zinc-900 focus:outline-none bg-white appearance-none"
          >
            <option value="ALL">Semua Role</option>
            <option value="ADMIN">Admin</option>
            <option value="MITRA">Mitra</option>
            <option value="BUYER">Pembeli</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-700">
            <thead>
              <tr className="bg-zinc-50 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-200">
                <th className="px-6 py-3">Username</th>
                <th className="px-6 py-3">Nickname</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Toko</th>
                <th className="px-6 py-3">Bergabung</th>
                <th className="px-6 py-3 text-right">Ubah Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-zinc-500">
                    {search || roleFilter !== "ALL"
                      ? "Tidak ada user yang cocok dengan filter."
                      : "Belum ada user terdaftar."}
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 uppercase">
                          {u.username?.charAt(0)}
                        </div>
                        <span className="font-semibold text-zinc-900">{u.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-600">{u.nickname || "-"}</td>
                    <td className="px-6 py-4 text-xs text-zinc-600">{u.email || "-"}</td>
                    <td className="px-6 py-4 text-xs font-mono">{u.phone || "-"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          u.role === "ADMIN"
                            ? "bg-purple-50 text-purple-700"
                            : u.role === "MITRA"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500">
                      {u.store ? (
                        <span title={`Status: ${u.store.status}`}>
                          {u.store.name}
                          <span className={`ml-1 inline-block h-2 w-2 rounded-full ${
                            u.store.status === "APPROVED" ? "bg-emerald-500" :
                            u.store.status === "REVIEW" ? "bg-amber-500" : "bg-rose-500"
                          }`} />
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500">
                      {new Date(u.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        className="border border-zinc-200 bg-white px-3 py-1.5 text-xs rounded-sm focus:border-zinc-900 focus:outline-none"
                      >
                        <option value="BUYER">BUYER</option>
                        <option value="MITRA">MITRA</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
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
