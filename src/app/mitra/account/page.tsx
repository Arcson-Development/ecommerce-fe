"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  Save,
  Edit3,
  Store as StoreIcon,
  Mail,
  Phone,
  FileText,
  Clock,
  CreditCard,
  CheckCircle2,
  Star,
  Package,
  ShoppingBag,
  Calendar,
  Building2,
  Power,
  Hash,
  User as UserIcon,
  MapPin,
} from "lucide-react";
import { MitraShell } from "@/components/mitra/MitraShell";
import { MitraSidebar } from "@/components/mitra/MitraSidebar";
import {
  Field,
  SelectInput,
  useSelectState,
  inputClass,
} from "@/components/mitra/FormFields";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const STORE_TYPES = [
  "Toko Retail",
  "Toko Grosir",
  "Petani / Peternak",
  "Distributor",
  "Home Industry",
];

const BANKS = [
  "BCA",
  "BRI",
  "BNI",
  "Mandiri",
  "CIMB Niaga",
  "DANA",
  "OVO",
  "GoPay",
];

const DAYS = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
] as const;

const TIMES = Array.from({ length: 24 }, (_, h) => {
  const hh = h.toString().padStart(2, "0");
  return [`${hh}:00`, `${hh}:30`];
}).flat();

interface AccountForm {
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  storeType: string;
  description: string;
}

const DEFAULT_OPERATING_HOURS: Record<string, { open: string; close: string; isOpen: boolean }> = {
  Senin: { open: "06:00", close: "20:00", isOpen: true },
  Selasa: { open: "06:00", close: "20:00", isOpen: true },
  Rabu: { open: "06:00", close: "20:00", isOpen: true },
  Kamis: { open: "06:00", close: "20:00", isOpen: true },
  Jumat: { open: "06:00", close: "20:00", isOpen: true },
  Sabtu: { open: "06:00", close: "21:00", isOpen: true },
  Minggu: { open: "07:00", close: "18:00", isOpen: true },
};

export default function MitraAccountPage() {
  const router = useRouter();
  const { user, fetchProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<AccountForm>({
    storeName: "",
    ownerName: "",
    email: "",
    phone: "",
    storeType: "Toko Retail",
    description: "",
  });
  const [operatingHours, setOperatingHours] = useState(DEFAULT_OPERATING_HOURS);
  const [bankForm, setBankForm] = useState({
    bank: "BCA",
    accountNumber: "",
    accountName: "",
  });
  const [editingBank, setEditingBank] = useState(false);
  const [openTimeSelect, setOpenTimeSelect] = useState<string | null>(null);
  const [storeProfile, setStoreProfile] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [markets, setMarkets] = useState<any[]>([]);
  const [marketId, setMarketId] = useState<string>("");

  const storeTypeSelect = useSelectState(false);
  const marketSelect = useSelectState(false);
  const bankSelect = useSelectState(false);

  // Fetch data from API on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [profile, dashboard] = await Promise.all([
          api.get("/mitra/profile"),
          api.get("/mitra/dashboard"),
        ]);
        setStoreProfile(profile);
        setDashboardStats(dashboard);
        setForm({
          storeName: profile.name || "",
          ownerName: user?.nickname || user?.username || "",
          email: user?.email || "",
          phone: user?.phone || "",
          storeType: "Toko Retail",
          description: profile.description || "",
        });
        setMarketId(profile.marketId || "");
        if (profile.operatingHours) {
          setOperatingHours(profile.operatingHours);
        }
      } catch (e: any) {
        console.error("Failed to load profile", e);
        setError(e.message || "Gagal memuat profil toko.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
    // Load markets list
    api.get("/markets").then(setMarkets).catch(console.error);
  }, [user]);

  const update = (field: keyof AccountForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.storeName || !form.ownerName || !form.email) {
      toast.error("Mohon lengkapi field wajib.");
      return;
    }
    try {
      await Promise.all([
        api.put("/mitra/profile", {
          name: form.storeName,
          description: form.description,
          operatingHours,
          marketId: marketId || undefined,
        }),
        api.put("/users/profile", {
          nickname: form.ownerName,
        }),
      ]);
      await fetchProfile();
      setEditing(false);
      toast.success("Profil toko berhasil diperbarui!");
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan profil.");
    }
  };

  const handleCancel = () => {
    if (storeProfile) {
      setForm({
        storeName: storeProfile.name || "",
        ownerName: user?.nickname || user?.username || "",
        email: user?.email || "",
        phone: user?.phone || "",
        storeType: "Toko Retail",
        description: storeProfile.description || "",
      });
      setOperatingHours(storeProfile.operatingHours || DEFAULT_OPERATING_HOURS);
      setMarketId(storeProfile.marketId || "");
    }
    setEditing(false);
  };

  const toggleDay = (day: (typeof DAYS)[number]) => {
    setOperatingHours((h: any) => ({
      ...h,
      [day]: { ...h[day], isOpen: !h[day].isOpen },
    }));
  };

  const updateTime = (
    day: (typeof DAYS)[number],
    field: "open" | "close",
    value: string
  ) => {
    setOperatingHours((h: any) => ({
      ...h,
      [day]: { ...h[day], [field]: value },
    }));
  };

  const handleSaveBank = () => {
    if (!bankForm.bank || !bankForm.accountNumber || !bankForm.accountName) {
      toast.error("Mohon lengkapi data rekening.");
      return;
    }
    setEditingBank(false);
    toast.info("Fitur rekening payout belum tersedia di backend.");
  };

  if (loading) {
    return (
      <MitraShell>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
          <MitraSidebar active="account" />
          <div className="flex items-center justify-center min-h-[40vh] text-sm text-zinc-500">
            Memuat profil toko...
          </div>
        </div>
      </MitraShell>
    );
  }

  if (error) {
    return (
      <MitraShell>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
          <MitraSidebar active="account" />
          <div className="flex items-center justify-center min-h-[40vh] text-sm text-rose-600">
            {error}
          </div>
        </div>
      </MitraShell>
    );
  }

  return (
    <MitraShell>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
        <MitraSidebar active="account" />

        <div className="space-y-4">
          <button
            onClick={() => router.push("/mitra")}
            className="flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-zinc-900"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
            Kembali ke Dasbor
          </button>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">
                Akun Mitra
              </h1>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
                Dasbor
              </p>
            </div>
            {!editing && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-800 transition-colors hover:border-zinc-700 hover:text-zinc-900"
              >
                <Edit3 className="h-3.5 w-3.5" strokeWidth={2} />
                Edit Profil
              </motion.button>
            )}
          </div>

          {/* Stats row */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            <StatCard
              icon={Calendar}
              label="Bergabung"
              value={storeProfile?.createdAt
                ? new Date(storeProfile.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric", month: "short", year: "numeric",
                  })
                : "-"}
              color="sky"
            />
            <StatCard
              icon={Package}
              label="Total Produk"
              value={dashboardStats?.totalProducts ?? 0}
              color="emerald"
            />
            <StatCard
              icon={ShoppingBag}
              label="Total Pesanan"
              value={dashboardStats?.totalOrders ?? 0}
              color="amber"
            />
            <StatCard
              icon={Star}
              label="Rating Toko"
              value={dashboardStats?.rating ? `${dashboardStats.rating} (${dashboardStats.totalReviews})` : "-"}
              color="rose"
            />
          </motion.section>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_22rem]">
            {/* Left: profile + ops hours + bank */}
            <div className="space-y-4">
              {/* Profile */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-sm border border-zinc-200 bg-white"
              >
                <div className="border-b border-zinc-200 px-5 py-4">
                  <h3 className="text-sm font-semibold text-zinc-900">
                    Profil Toko
                  </h3>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Informasi dasar tentang toko dan pemilik.
                  </p>
                </div>

                {editing ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSave();
                    }}
                  >
                    <div className="space-y-4 p-5">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Nama Toko" required>
                          <input
                            type="text"
                            required
                            value={form.storeName}
                            onChange={(e) =>
                              update("storeName", e.target.value)
                            }
                            placeholder="Nama Toko"
                            className={inputClass}
                          />
                        </Field>
                        <Field label="Nama Pemilik" required>
                          <input
                            type="text"
                            required
                            value={form.ownerName}
                            onChange={(e) =>
                              update("ownerName", e.target.value)
                            }
                            placeholder="Nama Pemilik"
                            className={inputClass}
                          />
                        </Field>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Email" required>
                          <input
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) => update("email", e.target.value)}
                            placeholder="email@domain.com"
                            className={inputClass}
                          />
                        </Field>
                        <Field label="Telepon" required>
                          <input
                            type="tel"
                            required
                            value={form.phone}
                            onChange={(e) => update("phone", e.target.value)}
                            placeholder="0812 1234 5678"
                            className={inputClass}
                          />
                        </Field>
                      </div>

                      <Field label="Jenis Toko" required>
                        <SelectInput
                          value={form.storeType}
                          placeholder="Pilih Jenis Toko"
                          options={STORE_TYPES}
                          open={storeTypeSelect.open}
                          onToggle={storeTypeSelect.toggle}
                          onSelect={(v) => {
                            update("storeType", v);
                            storeTypeSelect.close();
                          }}
                        />
                      </Field>

                      <Field label="Berada di Pasar">
                        <SelectInput
                          value={markets.find((m: any) => m.id === marketId)?.name || ""}
                          placeholder="Pilih Pasar"
                          options={markets
                            .filter((m: any) => m.isActive !== false)
                            .map((m: any) => m.name)}
                          open={marketSelect.open}
                          onToggle={marketSelect.toggle}
                          onSelect={(name) => {
                            const m = markets.find((x: any) => x.name === name);
                            if (m) setMarketId(m.id);
                            marketSelect.close();
                          }}
                        />
                      </Field>

                      <Field label="Deskripsi Toko" required>
                        <textarea
                          required
                          rows={4}
                          value={form.description}
                          onChange={(e) =>
                            update("description", e.target.value)
                          }
                          placeholder="Ceritakan tentang tokomu, keunggulan, dan komitmen ke pelanggan..."
                          className={`${inputClass} resize-y`}
                        />
                      </Field>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-zinc-200 bg-zinc-50 px-5 py-3">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="border border-zinc-300 bg-white px-4 py-2 text-xs font-medium text-zinc-800 transition-colors hover:border-zinc-700 hover:text-zinc-900"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800"
                      >
                        <Save className="h-3.5 w-3.5" strokeWidth={2.5} />
                        Simpan Perubahan
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4 p-5">
                    <div className="flex items-center gap-4 border-b border-zinc-100 pb-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-emerald-500 to-emerald-700 text-2xl text-white">
                        🐤
                      </div>
                      <div>
                        <p className="text-base font-semibold text-zinc-900">
                          {form.storeName}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {form.storeType} • Mitra sejak{" "}
                          {storeProfile?.createdAt
                            ? new Date(storeProfile.createdAt).toLocaleDateString("id-ID", {
                                month: "long",
                                year: "numeric",
                              })
                            : "-"}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                            <CheckCircle2
                              className="h-3 w-3"
                              strokeWidth={2.5}
                            />
                            Terverifikasi
                          </span>
                        </div>
                      </div>
                    </div>

                    <InfoRow icon={StoreIcon} label="Nama Toko" value={form.storeName} />
                    <InfoRow icon={UserIcon} label="Nama Pemilik" value={form.ownerName} />
                    <InfoRow icon={Mail} label="Email" value={form.email} />
                    <InfoRow icon={Phone} label="Telepon" value={form.phone} />
                    <InfoRow
                      icon={Building2}
                      label="Jenis Toko"
                      value={form.storeType}
                    />
                    <InfoRow
                      icon={MapPin}
                      label="Berada di Pasar"
                      value={storeProfile?.market?.name || "-"}
                    />
                    <div className="flex items-start gap-3 border-t border-zinc-100 pt-3">
                      <FileText
                        className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400"
                        strokeWidth={2}
                      />
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                          Deskripsi Toko
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-zinc-700">
                          {form.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.section>

              {/* Operating Hours */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-sm border border-zinc-200 bg-white"
              >
                <div className="border-b border-zinc-200 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-zinc-500" strokeWidth={2} />
                    <h3 className="text-sm font-semibold text-zinc-900">
                      Jam Operasional
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Atur jam buka-tutup toko untuk setiap hari. Pelanggan hanya
                    bisa memesan saat toko buka.
                  </p>
                </div>

                <div className="divide-y divide-zinc-100">
                  {DAYS.map((day) => {
                    const h = operatingHours[day];
                    return (
                      <div
                        key={day}
                        className="grid grid-cols-[5rem_1fr_auto] items-center gap-3 px-5 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-zinc-900">
                            {day}
                          </p>
                        </div>

                        {h.isOpen ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <SelectInput
                              value={h.open}
                              placeholder="Buka"
                              options={TIMES}
                              open={openTimeSelect === `${day}-open`}
                              onToggle={() =>
                                setOpenTimeSelect(
                                  openTimeSelect === `${day}-open`
                                    ? null
                                    : `${day}-open`
                                )
                              }
                              onSelect={(v) => {
                                updateTime(day, "open", v);
                                setOpenTimeSelect(null);
                              }}
                            />
                            <span className="text-xs text-zinc-500">—</span>
                            <SelectInput
                              value={h.close}
                              placeholder="Tutup"
                              options={TIMES}
                              open={openTimeSelect === `${day}-close`}
                              onToggle={() =>
                                setOpenTimeSelect(
                                  openTimeSelect === `${day}-close`
                                    ? null
                                    : `${day}-close`
                                )
                              }
                              onSelect={(v) => {
                                updateTime(day, "close", v);
                                setOpenTimeSelect(null);
                              }}
                            />
                          </div>
                        ) : (
                          <span className="text-xs italic text-zinc-400">
                            Tutup
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                            h.isOpen
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400"
                              : "border-zinc-200 bg-white text-zinc-400 hover:border-zinc-400 hover:text-zinc-700"
                          }`}
                          title={h.isOpen ? "Tutup toko" : "Buka toko"}
                        >
                          <Power className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end border-t border-zinc-200 bg-zinc-50 px-5 py-3">
                  <button
                    type="button"
                    onClick={() => toast.success("Jam operasional berhasil disimpan!")}
                    className="flex items-center gap-1.5 bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800"
                  >
                    <Save className="h-3.5 w-3.5" strokeWidth={2.5} />
                    Simpan Jam
                  </button>
                </div>
              </motion.section>

              {/* Bank Account */}
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-sm border border-zinc-200 bg-white"
              >
                <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <CreditCard
                      className="h-4 w-4 text-zinc-500"
                      strokeWidth={2}
                    />
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900">
                        Rekening Payout
                      </h3>
                      <p className="text-xs text-zinc-500">
                        Rekening tujuan pencairan dana hasil penjualan.
                      </p>
                    </div>
                  </div>
                  {!editingBank && (
                    <button
                      type="button"
                      onClick={() => setEditingBank(true)}
                      className="flex items-center gap-1.5 border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 transition-colors hover:border-zinc-700 hover:text-zinc-900"
                    >
                      <Edit3 className="h-3 w-3" strokeWidth={2} />
                      Edit
                    </button>
                  )}
                </div>

                {editingBank ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveBank();
                    }}
                  >
                    <div className="space-y-4 p-5">
                      <Field label="Bank / E-Wallet" required>
                        <SelectInput
                          value={bankForm.bank}
                          placeholder="Pilih Bank"
                          options={BANKS}
                          open={bankSelect.open}
                          onToggle={bankSelect.toggle}
                          onSelect={(v) => {
                            setBankForm((b) => ({ ...b, bank: v }));
                            bankSelect.close();
                          }}
                        />
                      </Field>
                      <Field label="Nomor Rekening" required>
                        <input
                          type="text"
                          required
                          value={bankForm.accountNumber}
                          onChange={(e) =>
                            setBankForm((b) => ({
                              ...b,
                              accountNumber: e.target.value,
                            }))
                          }
                          placeholder="123-456-7890"
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Nama Pemilik Rekening" required>
                        <input
                          type="text"
                          required
                          value={bankForm.accountName}
                          onChange={(e) =>
                            setBankForm((b) => ({
                              ...b,
                              accountName: e.target.value,
                            }))
                          }
                          placeholder="Nama sesuai buku tabungan"
                          className={inputClass}
                        />
                      </Field>
                    </div>
                    <div className="flex justify-end gap-2 border-t border-zinc-200 bg-zinc-50 px-5 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          setBankForm({
                            bank: "BCA",
                            accountNumber: "",
                            accountName: "",
                          });
                          setEditingBank(false);
                        }}
                        className="border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 transition-colors hover:border-zinc-700 hover:text-zinc-900"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800"
                      >
                        <Save className="h-3 w-3" strokeWidth={2.5} />
                        Simpan
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
                    <InfoRow
                      icon={CreditCard}
                      label="Bank"
                      value={bankForm.bank}
                    />
                    <InfoRow
                      icon={Hash}
                      label="No. Rekening"
                      value={bankForm.accountNumber || "-"}
                    />
                    <InfoRow
                      icon={UserIcon}
                      label="Atas Nama"
                      value={bankForm.accountName || "-"}
                    />
                  </div>
                )}
              </motion.section>
            </div>

            {/* Right: profile card / quick actions */}
            <motion.aside
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="space-y-4"
            >
              <div className="rounded-sm border border-zinc-200 bg-white p-5 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-4xl text-white">
                  🐤
                </div>
                <p className="mt-3 text-base font-semibold text-zinc-900">
                  {form.storeName}
                </p>
                <p className="text-xs text-zinc-500">#{storeProfile?.id?.slice(0, 8) || "-"}</p>
                <div className="mt-3 flex items-center justify-center gap-1.5">
                  <Star
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                    strokeWidth={1.5}
                  />
                  <span className="text-sm font-semibold text-zinc-900">
                    {dashboardStats?.rating ? dashboardStats.rating.toFixed(1) : "-"}
                  </span>
                  <span className="text-xs text-zinc-500">
                    ({dashboardStats?.totalReviews || 0} ulasan)
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2 border-t border-zinc-100 pt-4 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" strokeWidth={2.5} />
                    Mitra Aktif
                  </span>
                </div>
              </div>

              <div className="rounded-sm border border-zinc-200 bg-white p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-700">
                  Tindakan Cepat
                </h3>
                <div className="mt-3 space-y-2">
                  <QuickAction
                    label="Undang Rekan Mitra"
                    desc="Dapatkan bonus referral Rp100.000"
                  />
                  <QuickAction
                    label="Pusat Bantuan"
                    desc="24/7 customer support"
                  />
                  <QuickAction
                    label="Syarat & Ketentuan"
                    desc="Ketentuan bermitra"
                  />
                </div>
              </div>

              <p className="text-[10px] leading-relaxed text-zinc-500">
                <span className="font-semibold">Privasi:</span> Informasi
                rekening dan data sensitif lainnya dienkripsi dan tidak akan
                dibagikan ke pihak ketiga.
              </p>
            </motion.aside>
          </div>
        </div>
      </div>
    </MitraShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string | number;
  color: "sky" | "emerald" | "amber" | "rose";
}) {
  const colorMap = {
    sky: "bg-sky-50 text-sky-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  };
  return (
    <div className="rounded-sm border border-zinc-200 bg-white p-3 sm:p-4">
      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-sm ${colorMap[color]}`}>
        <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
      </div>
      <p className="mt-2 truncate text-sm font-semibold text-zinc-900 sm:text-base">
        {value}
      </p>
      <p className="text-[10px] text-zinc-500 sm:text-xs">{label}</p>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon
        className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400"
        strokeWidth={2}
      />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm text-zinc-900">{value}</p>
      </div>
    </div>
  );
}

function QuickAction({ label, desc }: { label: string; desc: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-sm border border-zinc-200 bg-white px-3 py-2.5 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50"
    >
      <div>
        <p className="text-xs font-medium text-zinc-900">{label}</p>
        <p className="text-[10px] text-zinc-500">{desc}</p>
      </div>
      <span className="text-zinc-400">›</span>
    </button>
  );
}
