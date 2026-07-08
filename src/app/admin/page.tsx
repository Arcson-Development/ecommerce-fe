"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { Store, Truck, CreditCard, Check, X, Shield, Plus } from "lucide-react";
import { formatRupiah } from "@/data/products";

const TABS: { key: "stores" | "shippings" | "payments"; label: string; icon: any }[] = [
  { key: "stores", label: "Kelola Mitra Toko", icon: Store },
  { key: "shippings", label: "Kurir Global", icon: Truck },
  { key: "payments", label: "Pembayaran Global", icon: CreditCard },
];

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"stores" | "shippings" | "payments">("stores");
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<any[]>([]);
  const [shippings, setShippings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  // Forms for new methods
  const [showAddShip, setShowAddShip] = useState(false);
  const [newShip, setNewShip] = useState({ name: "", code: "", eta: "", defaultCost: "" });
  const [showAddPay, setShowAddPay] = useState(false);
  const [newPay, setNewPay] = useState({ name: "", code: "" });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    if (user?.role !== "ADMIN") {
      router.push("/");
      return;
    }

    async function loadAdminData() {
      try {
        const [storesData, shippingsData, paymentsData] = await Promise.all([
          api.get("/admin/stores"),
          api.get("/admin/shippings"),
          api.get("/admin/payments"),
        ]);
        setStores(storesData || []);
        setShippings(shippingsData || []);
        setPayments(paymentsData || []);
      } catch (e) {
        console.error("Failed to load admin panel data", e);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, [isAuthenticated, user, router]);

  const handleUpdateStoreStatus = async (storeId: string, status: "APPROVED" | "REJECTED") => {
    try {
      await api.put(`/admin/stores/${storeId}/status`, { status });
      alert(`Status toko berhasil diubah menjadi ${status}!`);
      const storesData = await api.get("/admin/stores");
      setStores(storesData);
    } catch (e: any) {
      alert(e.message || "Gagal mengubah status toko.");
    }
  };

  const handleToggleShipping = async (id: string, currentActive: boolean) => {
    try {
      await api.put(`/admin/shippings/${id}`, { isActive: !currentActive });
      const shippingsData = await api.get("/admin/shippings");
      setShippings(shippingsData);
    } catch (e: any) {
      alert(e.message || "Gagal mengubah status kurir.");
    }
  };

  const handleAddShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin/shippings", {
        ...newShip,
        defaultCost: parseFloat(newShip.defaultCost),
      });
      alert("Kurir global baru berhasil ditambahkan!");
      setShowAddShip(false);
      setNewShip({ name: "", code: "", eta: "", defaultCost: "" });
      const shippingsData = await api.get("/admin/shippings");
      setShippings(shippingsData);
    } catch (e: any) {
      alert(e.message || "Gagal menambah kurir.");
    }
  };

  const handleTogglePayment = async (id: string, currentActive: boolean) => {
    try {
      await api.put(`/admin/payments/${id}`, { isActive: !currentActive });
      const paymentsData = await api.get("/admin/payments");
      setPayments(paymentsData);
    } catch (e: any) {
      alert(e.message || "Gagal mengubah status pembayaran.");
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin/payments", newPay);
      alert("Metode pembayaran baru berhasil ditambahkan!");
      setShowAddPay(false);
      setNewPay({ name: "", code: "" });
      const paymentsData = await api.get("/admin/payments");
      setPayments(paymentsData);
    } catch (e: any) {
      alert(e.message || "Gagal menambah metode pembayaran.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col">
        <TopBar />
        <Header />
        <main className="flex-1 flex items-center justify-center p-8 text-sm text-zinc-500">
          Memuat Panel Administrasi...
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <TopBar />
      <Header />

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3 border-b border-zinc-200 pb-5">
          <div className="flex h-12 w-12 items-center justify-center bg-zinc-900 rounded-sm text-white">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Panel Super Admin</h1>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mt-0.5">
              Pusat Kontrol Global Pasar Jaya
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[16rem_1fr]">
          {/* Tabs Sidebar */}
          <aside className="space-y-1">
            {TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-colors rounded-sm text-left ${
                    isActive
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </aside>

          {/* Tab Content Panel */}
          <div className="space-y-6">
            {/* STORES TAB */}
            {activeTab === "stores" && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-zinc-200 rounded-sm overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-zinc-200">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-900">
                    Pengajuan & Daftar Mitra Toko
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-700">
                    <thead>
                      <tr className="bg-zinc-50 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-200">
                        <th className="px-6 py-3">Nama Toko</th>
                        <th className="px-6 py-3">Pemilik</th>
                        <th className="px-6 py-3">Alamat</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {stores.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                            Belum ada pendaftaran toko.
                          </td>
                        </tr>
                      ) : (
                        stores.map((s) => (
                          <tr key={s.id} className="hover:bg-zinc-50">
                            <td className="px-6 py-4 font-semibold text-zinc-900">
                              {s.name}
                              {s.description && (
                                <p className="text-xs font-normal text-zinc-500 mt-0.5">
                                  {s.description}
                                </p>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-medium text-zinc-800">{s.user?.nickname || s.user?.username}</p>
                              <p className="text-xs text-zinc-500">{s.user?.phone}</p>
                            </td>
                            <td className="px-6 py-4 text-zinc-600 text-xs">
                              {s.address}
                            </td>
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
                            <td className="px-6 py-4 text-right">
                              {s.status === "REVIEW" && (
                                <div className="inline-flex gap-1">
                                  <button
                                    onClick={() => handleUpdateStoreStatus(s.id, "APPROVED")}
                                    className="flex h-8 w-8 items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-sm"
                                    title="Setujui"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStoreStatus(s.id, "REJECTED")}
                                    className="flex h-8 w-8 items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-sm"
                                    title="Tolak"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                              {s.status !== "REVIEW" && (
                                <span className="text-xs text-zinc-400 italic">No Action</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.section>
            )}

            {/* SHIPPINGS TAB */}
            {activeTab === "shippings" && (
              <div className="space-y-6">
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-zinc-200 rounded-sm overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-900">
                      Opsi Kurir Pengiriman Global
                    </h2>
                    <button
                      onClick={() => setShowAddShip(!showAddShip)}
                      className="flex items-center gap-1 text-xs font-semibold bg-zinc-950 hover:bg-zinc-800 text-white px-3 py-1.5 rounded-sm uppercase tracking-wider transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Courier
                    </button>
                  </div>

                  {/* Add form */}
                  {showAddShip && (
                    <form onSubmit={handleAddShipping} className="p-6 bg-zinc-50 border-b border-zinc-200 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600">Tambah Kurir Baru</h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <input
                          type="text"
                          placeholder="Nama Kurir (e.g. JNE Regular)"
                          required
                          value={newShip.name}
                          onChange={(e) => setNewShip({ ...newShip, name: e.target.value })}
                          className="border border-zinc-200 bg-white px-3 py-2 text-sm rounded-sm focus:border-zinc-900 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Kode Unik (e.g. jne)"
                          required
                          value={newShip.code}
                          onChange={(e) => setNewShip({ ...newShip, code: e.target.value })}
                          className="border border-zinc-200 bg-white px-3 py-2 text-sm rounded-sm focus:border-zinc-900 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Estimasi / ETA (e.g. 2 - 3 hari)"
                          required
                          value={newShip.eta}
                          onChange={(e) => setNewShip({ ...newShip, eta: e.target.value })}
                          className="border border-zinc-200 bg-white px-3 py-2 text-sm rounded-sm focus:border-zinc-900 focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Tarif Default (Rp)"
                          required
                          value={newShip.defaultCost}
                          onChange={(e) => setNewShip({ ...newShip, defaultCost: e.target.value })}
                          className="border border-zinc-200 bg-white px-3 py-2 text-sm rounded-sm focus:border-zinc-900 focus:outline-none"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddShip(false)}
                          className="px-4 py-2 border border-zinc-300 text-zinc-700 text-xs font-semibold uppercase tracking-wider hover:bg-zinc-100"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-zinc-900 text-white text-xs font-semibold uppercase tracking-wider hover:bg-zinc-800"
                        >
                          Simpan
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-700">
                      <thead>
                        <tr className="bg-zinc-50 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-200">
                          <th className="px-6 py-3">Kurir</th>
                          <th className="px-6 py-3">Estimasi</th>
                          <th className="px-6 py-3">Ongkir Default</th>
                          <th className="px-6 py-3 text-right">Status Aktif</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200">
                        {shippings.map((s) => (
                          <tr key={s.id} className="hover:bg-zinc-50">
                            <td className="px-6 py-4 font-semibold text-zinc-900">
                              {s.name} <span className="text-xs text-zinc-400 font-mono">({s.code})</span>
                            </td>
                            <td className="px-6 py-4 text-xs">
                              {s.eta}
                            </td>
                            <td className="px-6 py-4 font-medium text-zinc-800">
                              {formatRupiah(s.defaultCost)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={s.isActive}
                                  onChange={() => handleToggleShipping(s.id, s.isActive)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                              </label>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.section>
              </div>
            )}

            {/* PAYMENTS TAB */}
            {activeTab === "payments" && (
              <div className="space-y-6">
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-zinc-200 rounded-sm overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-900">
                      Metode Pembayaran Global
                    </h2>
                    <button
                      onClick={() => setShowAddPay(!showAddPay)}
                      className="flex items-center gap-1 text-xs font-semibold bg-zinc-950 hover:bg-zinc-800 text-white px-3 py-1.5 rounded-sm uppercase tracking-wider transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Payment
                    </button>
                  </div>

                  {/* Add form */}
                  {showAddPay && (
                    <form onSubmit={handleAddPayment} className="p-6 bg-zinc-50 border-b border-zinc-200 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600">Tambah Metode Pembayaran</h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <input
                          type="text"
                          placeholder="Nama Pembayaran (e.g. BCA Virtual Account)"
                          required
                          value={newPay.name}
                          onChange={(e) => setNewPay({ ...newPay, name: e.target.value })}
                          className="border border-zinc-200 bg-white px-3 py-2 text-sm rounded-sm focus:border-zinc-900 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Kode Unik (e.g. bca)"
                          required
                          value={newPay.code}
                          onChange={(e) => setNewPay({ ...newPay, code: e.target.value })}
                          className="border border-zinc-200 bg-white px-3 py-2 text-sm rounded-sm focus:border-zinc-900 focus:outline-none"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddPay(false)}
                          className="px-4 py-2 border border-zinc-300 text-zinc-700 text-xs font-semibold uppercase tracking-wider hover:bg-zinc-100"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-zinc-900 text-white text-xs font-semibold uppercase tracking-wider hover:bg-zinc-800"
                        >
                          Simpan
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-700">
                      <thead>
                        <tr className="bg-zinc-50 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-200">
                          <th className="px-6 py-3">Nama Pembayaran</th>
                          <th className="px-6 py-3">Kode Unik</th>
                          <th className="px-6 py-3 text-right">Status Aktif</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200">
                        {payments.map((p) => (
                          <tr key={p.id} className="hover:bg-zinc-50">
                            <td className="px-6 py-4 font-semibold text-zinc-900">
                              {p.name}
                            </td>
                            <td className="px-6 py-4 font-mono text-xs">
                              {p.code}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={p.isActive}
                                  onChange={() => handleTogglePayment(p.id, p.isActive)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                              </label>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.section>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
