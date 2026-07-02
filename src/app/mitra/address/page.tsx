"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChevronLeft,
  MapPin,
  Plus,
  Trash2,
  Save,
  Edit3,
  Crosshair,
  Phone,
  Home,
} from "lucide-react";
import { MitraShell } from "@/components/mitra/MitraShell";
import { MitraSidebar } from "@/components/mitra/MitraSidebar";
import {
  Field,
  SelectInput,
  useSelectState,
  inputClass,
} from "@/components/mitra/FormFields";
import { storeAddress } from "@/lib/merchant-data";

const PROVINCES = [
  "DKI Jakarta",
  "Jawa Barat",
  "Jawa Tengah",
  "Jawa Timur",
  "Banten",
  "Yogyakarta",
  "Bali",
  "Sumatera Utara",
];

const CITIES: Record<string, string[]> = {
  "DKI Jakarta": [
    "Jakarta Pusat",
    "Jakarta Selatan",
    "Jakarta Barat",
    "Jakarta Timur",
    "Jakarta Utara",
  ],
  "Jawa Barat": ["Bandung", "Bogor", "Depok", "Bekasi", "Cimahi"],
  "Jawa Tengah": ["Semarang", "Solo", "Magelang", "Salatiga"],
  "Jawa Timur": ["Surabaya", "Malang", "Sidoarjo", "Gresik"],
  "Banten": ["Tangerang", "Serang", "Cilegon"],
  "Yogyakarta": ["Yogyakarta", "Sleman", "Bantul"],
  "Bali": ["Denpasar", "Badung", "Gianyar"],
  "Sumatera Utara": ["Medan", "Binjai", "Pematangsiantar"],
} as const;

const DISTRICTS: Record<string, string[]> = {
  "Jakarta Timur": [
    "Kramat Jati",
    "Matraman",
    "Jatinegara",
    "Duren Sawit",
    "Cakung",
  ],
  "Jakarta Selatan": [
    "Kebayoran Baru",
    "Mampang Prapatan",
    "Pancoran",
    "Jagakarsa",
  ],
  "Jakarta Pusat": ["Menteng", "Tanah Abang", "Gambir", "Kemayoran"],
  "Jakarta Barat": ["Grogol Petamburan", "Kebon Jeruk", "Palmerah"],
  "Jakarta Utara": ["Penjaringan", "Pademangan", "Kelapa Gading"],
};

interface AddressForm {
  label: string;
  recipient: string;
  phone: string;
  street: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  notes: string;
}

const INITIAL_FORM: AddressForm = {
  label: storeAddress.label,
  recipient: storeAddress.recipient,
  phone: storeAddress.phone,
  street: storeAddress.street,
  province: storeAddress.province,
  city: storeAddress.city,
  district: storeAddress.district,
  postalCode: storeAddress.postalCode,
  notes: "Lokasi strategis di Pasar Induk Kramat Jati Blok B-12, mudah dijangkau kurir",
};

export default function MitraAddressPage() {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<AddressForm>(INITIAL_FORM);
  const [savedAddresses, setSavedAddresses] = useState<AddressForm[]>([
    INITIAL_FORM,
  ]);

  const provinceSelect = useSelectState(false);
  const citySelect = useSelectState(false);
  const districtSelect = useSelectState(false);

  const cities = form.province ? CITIES[form.province] ?? [] : [];
  const districts = form.city ? DISTRICTS[form.city] ?? [] : [];

  const update = (field: keyof AddressForm, value: string) => {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === "province") {
        next.city = "";
        next.district = "";
      }
      if (field === "city") {
        next.district = "";
      }
      return next;
    });
  };

  const handleSave = () => {
    if (!form.recipient || !form.phone || !form.street || !form.province) {
      alert("Mohon lengkapi field wajib.");
      return;
    }
    setSavedAddresses((prev) => {
      const idx = prev.findIndex((a) => a.label === INITIAL_FORM.label);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = form;
        return next;
      }
      return [...prev, form];
    });
    setEditing(false);
    alert("Alamat berhasil disimpan!");
  };

  const handleCancel = () => {
    setForm(INITIAL_FORM);
    setEditing(false);
  };

  const handleUseCurrentLocation = () => {
    alert("Meminta akses lokasi... (fitur ini memerlukan izin browser)");
  };

  return (
    <MitraShell>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
        <MitraSidebar active="address" />

        <div className="space-y-4">
          <button
            onClick={() => router.push("/mitra")}
            className="flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-zinc-900"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
            Kembali ke Dasbor
          </button>

          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">
              Akun Mitra
            </h1>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Dasbor
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_22rem]">
            {/* Left: form / saved addresses */}
            <div className="space-y-4">
              {/* Header + actions */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-zinc-900">
                  Alamat Toko
                </h2>
                {!editing && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-800 transition-colors hover:border-zinc-700 hover:text-zinc-900"
                  >
                    <Edit3 className="h-3.5 w-3.5" strokeWidth={2} />
                    Edit Alamat
                  </motion.button>
                )}
              </div>

              {/* Saved address cards (read mode) */}
              {!editing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.label}
                      className="rounded-sm border border-zinc-200 bg-white p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-emerald-50 text-emerald-700">
                            <Home className="h-4 w-4" strokeWidth={2} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-zinc-900">
                                {addr.label}
                              </p>
                              {addr.label === storeAddress.label && (
                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                                  Utama
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm font-medium text-zinc-800">
                              {addr.recipient} • {addr.phone}
                            </p>
                            <p className="mt-0.5 text-sm text-zinc-600">
                              {addr.street}
                            </p>
                            <p className="text-sm text-zinc-600">
                              {addr.district}, {addr.city}, {addr.province}{" "}
                              {addr.postalCode}
                            </p>
                            {addr.notes && (
                              <p className="mt-2 border-t border-zinc-100 pt-2 text-xs italic text-zinc-500">
                                Catatan: {addr.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-sm border border-dashed border-zinc-300 bg-zinc-50 py-3 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-500 hover:text-zinc-900"
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                    Tambah Alamat Baru
                  </button>
                </motion.div>
              )}

              {/* Edit form */}
              {editing && (
                <motion.form
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSave();
                  }}
                  className="rounded-sm border border-zinc-200 bg-white"
                >
                  <div className="border-b border-zinc-200 px-5 py-4">
                    <h3 className="text-sm font-semibold text-zinc-900">
                      {form.label === storeAddress.label
                        ? "Edit Alamat Utama"
                        : "Alamat Baru"}
                    </h3>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Perbarui informasi alamat toko untuk pengiriman pesanan.
                    </p>
                  </div>

                  <div className="space-y-4 p-5">
                    <Field label="Label Alamat" required>
                      <input
                        type="text"
                        required
                        value={form.label}
                        onChange={(e) => update("label", e.target.value)}
                        placeholder="Contoh: Toko Utama, Gudang, dll."
                        className={inputClass}
                      />
                    </Field>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Nama Penerima" required>
                        <input
                          type="text"
                          required
                          value={form.recipient}
                          onChange={(e) =>
                            update("recipient", e.target.value)
                          }
                          placeholder="Nama penerima"
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Nomor Telepon" required>
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

                    <Field label="Alamat Lengkap" required>
                      <textarea
                        required
                        rows={3}
                        value={form.street}
                        onChange={(e) => update("street", e.target.value)}
                        placeholder="Nama jalan, nomor rumah, RT/RW, patokan..."
                        className={`${inputClass} resize-y`}
                      />
                    </Field>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Provinsi" required>
                        <SelectInput
                          value={form.province}
                          placeholder="Pilih Provinsi"
                          options={PROVINCES}
                          open={provinceSelect.open}
                          onToggle={provinceSelect.toggle}
                          onSelect={(v) => {
                            update("province", v);
                            provinceSelect.close();
                          }}
                        />
                      </Field>
                      <Field label="Kota / Kabupaten" required>
                        <SelectInput
                          value={form.city}
                          placeholder="Pilih Kota"
                          options={cities}
                          disabled={!form.province}
                          open={citySelect.open}
                          onToggle={citySelect.toggle}
                          onSelect={(v) => {
                            update("city", v);
                            citySelect.close();
                          }}
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Kecamatan">
                        <SelectInput
                          value={form.district}
                          placeholder="Pilih Kecamatan"
                          options={districts}
                          disabled={!form.city}
                          open={districtSelect.open}
                          onToggle={districtSelect.toggle}
                          onSelect={(v) => {
                            update("district", v);
                            districtSelect.close();
                          }}
                        />
                      </Field>
                      <Field label="Kode Pos" required>
                        <input
                          type="text"
                          required
                          inputMode="numeric"
                          value={form.postalCode}
                          onChange={(e) =>
                            update("postalCode", e.target.value)
                          }
                          placeholder="13540"
                          className={inputClass}
                        />
                      </Field>
                    </div>

                    <Field label="Catatan Alamat (Opsional)">
                      <textarea
                        rows={2}
                        value={form.notes}
                        onChange={(e) => update("notes", e.target.value)}
                        placeholder="Patokan, instruksi khusus untuk kurir, dll."
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
                      Simpan Alamat
                    </button>
                  </div>
                </motion.form>
              )}
            </div>

            {/* Right: Map preview + location info */}
            <motion.aside
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="space-y-4"
            >
              <h2 className="text-base font-semibold text-zinc-900">
                Titik Lokasi di Peta
              </h2>

              {/* Map placeholder */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-zinc-200 bg-gradient-to-br from-emerald-50 via-zinc-50 to-sky-50">
                {/* Decorative grid pattern */}
                <svg
                  className="absolute inset-0 h-full w-full opacity-30"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern
                      id="grid"
                      width="32"
                      height="32"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 32 0 L 0 0 0 32"
                        fill="none"
                        stroke="#a1a1aa"
                        strokeWidth="0.5"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Decorative roads */}
                <div className="absolute left-0 right-0 top-1/3 h-2 bg-zinc-200/60" />
                <div className="absolute left-1/2 top-0 h-full w-2 bg-zinc-200/60" />
                <div className="absolute left-0 top-0 h-1 w-full bg-zinc-300/50" />

                {/* Pin */}
                <motion.div
                  initial={{ scale: 0, y: -20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 18,
                    delay: 0.2,
                  }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full"
                >
                  <div className="relative">
                    <div className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 rounded-full bg-zinc-900/30 blur-sm" />
                    <MapPin
                      className="h-12 w-12 fill-rose-500 text-white drop-shadow-lg"
                      strokeWidth={1.5}
                    />
                  </div>
                </motion.div>

                {/* Floating use-location button */}
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-medium text-zinc-800 shadow-md transition-colors hover:bg-zinc-50"
                >
                  <Crosshair className="h-3.5 w-3.5" strokeWidth={2} />
                  Lokasi Saat Ini
                </button>

                {/* Coordinates badge */}
                <div className="absolute left-3 top-3 rounded-sm bg-white/80 px-2 py-1 text-[10px] font-mono text-zinc-600 backdrop-blur-sm">
                  {storeAddress.coordinates.lat.toFixed(4)},{" "}
                  {storeAddress.coordinates.lng.toFixed(4)}
                </div>
              </div>

              {/* Quick info */}
              <div className="rounded-sm border border-zinc-200 bg-white p-4 text-xs text-zinc-600">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-700">
                  Alamat Lengkap
                </p>
                <p className="mt-1 text-sm text-zinc-900">
                  {form.street}
                </p>
                <p className="text-sm text-zinc-900">
                  {form.district && `${form.district}, `}
                  {form.city}, {form.province} {form.postalCode}
                </p>
                <div className="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-3 text-zinc-500">
                  <Phone className="h-3 w-3" strokeWidth={2} />
                  <span>{form.phone}</span>
                </div>
              </div>

              <p className="text-[10px] leading-relaxed text-zinc-500">
                <span className="font-semibold">Catatan:</span> Pastikan titik
                lokasi sesuai dengan posisi toko sebenarnya. Kurir akan
                menggunakan titik ini sebagai acuan penjemputan pesanan.
              </p>
            </motion.aside>
          </div>
        </div>
      </div>
    </MitraShell>
  );
}
