"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  MapPin,
  Plus,
  Save,
  Edit3,
  Crosshair,
  Phone,
  Home,
  Loader2,
} from "lucide-react";
import dynamic from "next/dynamic";
import { MitraShell } from "@/components/mitra/MitraShell";
import { MitraSidebar } from "@/components/mitra/MitraSidebar";
import {
  Field,
  SelectInput,
  useSelectState,
  inputClass,
} from "@/components/mitra/FormFields";
import { api } from "@/lib/api";
import { toast } from "sonner";

// Dynamically import LeafletMap to avoid SSR issues
const LeafletMap = dynamic(() => import("@/components/mitra/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-[4/3] items-center justify-center rounded-sm border border-zinc-200 bg-zinc-50">
      <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
    </div>
  ),
});

interface AddressForm {
  label: string;
  recipient: string;
  phone: string;
  street: string;
  province: string;
  city: string;
  district: string;
  village: string;
  postalCode: string;
  notes: string;
  lat: number;
  lng: number;
}

interface RegionItem {
  id: string;
  name: string;
}

const DEFAULT_FORM: AddressForm = {
  label: "Toko Utama",
  recipient: "",
  phone: "",
  street: "",
  province: "",
  city: "",
  district: "",
  village: "",
  postalCode: "",
  notes: "",
  lat: -6.2,
  lng: 106.8,
};

export default function MitraAddressPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<AddressForm>(DEFAULT_FORM);
  const [savedAddresses, setSavedAddresses] = useState<AddressForm[]>([]);

  const [provinces, setProvinces] = useState<RegionItem[]>([]);
  const [cities, setCities] = useState<RegionItem[]>([]);
  const [districts, setDistricts] = useState<RegionItem[]>([]);
  const [villages, setVillages] = useState<RegionItem[]>([]);

  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  const provinceSelect = useSelectState(false);
  const citySelect = useSelectState(false);
  const districtSelect = useSelectState(false);
  const villageSelect = useSelectState(false);

  // Fetch provinces on mount
  useEffect(() => {
    async function init() {
      try {
        const [provincesData, profile] = await Promise.all([
          api.get("/regions/provinces"),
          api.get("/mitra/profile").catch(() => null),
        ]);
        setProvinces(provincesData || []);

        if (profile) {
          // Parse address back into fields
          const addr: AddressForm = {
            label: "Toko Utama",
            recipient: profile.name || "",
            phone: "",
            street: profile.address || "",
            province: profile.province || "",
            city: profile.city || "",
            district: profile.district || "",
            village: profile.village || "",
            postalCode: profile.postalCode || "",
            notes: profile.notes || "",
            lat: profile.lat ?? -6.2,
            lng: profile.lng ?? 106.8,
          };
          setForm(addr);
          setSavedAddresses([addr]);

          // Load dependent data
          if (addr.province) {
            const p = provincesData?.find((x: any) => x.name === addr.province || x.id === addr.province);
            if (p) {
              const c = await api.get(`/regions/provinces/${p.id}/cities`);
              setCities(c || []);
              if (addr.city) {
                const ct = c?.find((x: any) => x.name === addr.city || x.id === addr.city);
                if (ct) {
                  const d = await api.get(`/regions/cities/${ct.id}/districts`);
                  setDistricts(d || []);
                  if (addr.district) {
                    const ds = d?.find((x: any) => x.name === addr.district || x.id === addr.district);
                    if (ds) {
                      const v = await api.get(`/regions/districts/${ds.id}/villages`);
                      setVillages(v || []);
                    }
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Load cities when province changes
  useEffect(() => {
    if (!form.province) { setCities([]); setDistricts([]); setVillages([]); return; }
    const province = provinces.find((p) => p.id === form.province || p.name === form.province);
    if (!province) return;
    setLoadingCities(true);
    api.get(`/regions/provinces/${province.id}/cities`)
      .then((data) => setCities(data || []))
      .catch(() => toast.error("Gagal memuat kota"))
      .finally(() => setLoadingCities(false));
  }, [form.province]);

  // Load districts when city changes
  useEffect(() => {
    if (!form.city) { setDistricts([]); setVillages([]); return; }
    const city = cities.find((c) => c.id === form.city || c.name === form.city);
    if (!city) return;
    setLoadingDistricts(true);
    api.get(`/regions/cities/${city.id}/districts`)
      .then((data) => setDistricts(data || []))
      .catch(() => toast.error("Gagal memuat kecamatan"))
      .finally(() => setLoadingDistricts(false));
  }, [form.city]);

  // Load villages when district changes
  useEffect(() => {
    if (!form.district) { setVillages([]); return; }
    const district = districts.find((d) => d.id === form.district || d.name === form.district);
    if (!district) return;
    setLoadingVillages(true);
    api.get(`/regions/districts/${district.id}/villages`)
      .then((data) => setVillages(data || []))
      .catch(() => toast.error("Gagal memuat desa"))
      .finally(() => setLoadingVillages(false));
  }, [form.district]);

  const update = (field: keyof AddressForm, value: any) => {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === "province") { next.city = ""; next.district = ""; next.village = ""; }
      if (field === "city") { next.district = ""; next.village = ""; }
      if (field === "district") { next.village = ""; }
      return next;
    });
  };

  const handleSave = async () => {
    if (!form.recipient || !form.phone || !form.street || !form.province) {
      toast.error("Mohon lengkapi field wajib.");
      return;
    }
    try {
      await api.put("/mitra/profile", {
        name: form.recipient,
        address: form.street,
        province: form.province,
        city: form.city,
        district: form.district,
        village: form.village,
        postalCode: form.postalCode,
        lat: form.lat,
        lng: form.lng,
        notes: form.notes,
      });
      setSavedAddresses((prev) => {
        const idx = prev.findIndex((a) => a.label === "Toko Utama");
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = form;
          return next;
        }
        return [...prev, form];
      });
      setEditing(false);
      toast.success("Alamat berhasil disimpan!");
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan alamat.");
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Browser tidak mendukung geolokasi.");
      return;
    }
    toast.info("Mendapatkan lokasi...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, lat: pos.coords.latitude, lng: pos.coords.longitude }));
        toast.success("Lokasi diperbarui!");
      },
      () => toast.error("Gagal mendapatkan lokasi. Periksa izin GPS."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleMapClick = (lat: number, lng: number) => {
    setForm((f) => ({ ...f, lat, lng }));
  };

  if (loading) {
    return (
      <MitraShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      </MitraShell>
    );
  }

  const getRegionName = (list: RegionItem[], idOrName: string) =>
    list.find((r) => r.id === idOrName || r.name === idOrName)?.name || idOrName;

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
              Alamat Toko
            </h1>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Kelola alamat toko untuk pengiriman pesanan
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_22rem]">
            {/* Left: form / saved addresses */}
            <div className="space-y-4">
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

              {/* Read mode */}
              {!editing && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  {savedAddresses.map((addr) => (
                    <div key={addr.label} className="rounded-sm border border-zinc-200 bg-white p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-emerald-50 text-emerald-700">
                            <Home className="h-4 w-4" strokeWidth={2} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-zinc-900">{addr.label}</p>
                              {addr.label === "Toko Utama" && (
                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">Utama</span>
                              )}
                            </div>
                            <p className="mt-1 text-sm font-medium text-zinc-800">{addr.recipient} • {addr.phone}</p>
                            <p className="mt-0.5 text-sm text-zinc-600">{addr.street}</p>
                            <p className="text-sm text-zinc-600">
                              {addr.village && `${getRegionName(villages, addr.village)}, `}
                              {getRegionName(districts, addr.district)},
                              {" "}{getRegionName(cities, addr.city)}, {getRegionName(provinces, addr.province)} {addr.postalCode}
                            </p>
                            {addr.notes && (
                              <p className="mt-2 border-t border-zinc-100 pt-2 text-xs italic text-zinc-500">Catatan: {addr.notes}</p>
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
                  onSubmit={(e) => { e.preventDefault(); handleSave(); }}
                  className="rounded-sm border border-zinc-200 bg-white"
                >
                  <div className="border-b border-zinc-200 px-5 py-4">
                    <h3 className="text-sm font-semibold text-zinc-900">Edit Alamat Toko</h3>
                    <p className="mt-0.5 text-xs text-zinc-500">Perbarui informasi alamat untuk pengiriman pesanan.</p>
                  </div>

                  <div className="space-y-4 p-5">
                    <Field label="Label Alamat" required>
                      <input type="text" required value={form.label} onChange={(e) => update("label", e.target.value)} placeholder="Contoh: Toko Utama" className={inputClass} />
                    </Field>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Nama Penerima" required>
                        <input type="text" required value={form.recipient} onChange={(e) => update("recipient", e.target.value)} placeholder="Nama penerima" className={inputClass} />
                      </Field>
                      <Field label="Nomor Telepon" required>
                        <input type="tel" required value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="0812 1234 5678" className={inputClass} />
                      </Field>
                    </div>

                    <Field label="Alamat Lengkap" required>
                      <textarea required rows={3} value={form.street} onChange={(e) => update("street", e.target.value)} placeholder="Nama jalan, nomor rumah, RT/RW, patokan..." className={`${inputClass} resize-y`} />
                    </Field>

                    {/* Province */}
                    <Field label="Provinsi" required>
                      <SelectInput
                        value={getRegionName(provinces, form.province)}
                        placeholder="Pilih Provinsi"
                        options={provinces.map((p) => p.name)}
                        open={provinceSelect.open}
                        onToggle={provinceSelect.toggle}
                        onSelect={(v) => {
                          const p = provinces.find((x) => x.name === v);
                          update("province", p?.id || v);
                          provinceSelect.close();
                        }}
                      />
                    </Field>

                    {/* City */}
                    <Field label="Kota / Kabupaten" required>
                      <SelectInput
                        value={getRegionName(cities, form.city)}
                        placeholder="Pilih Kota"
                        options={cities.map((c) => c.name)}
                        disabled={!form.province}
                        loading={loadingCities}
                        open={citySelect.open}
                        onToggle={citySelect.toggle}
                        onSelect={(v) => {
                          const c = cities.find((x) => x.name === v);
                          update("city", c?.id || v);
                          citySelect.close();
                        }}
                      />
                    </Field>

                    {/* District */}
                    <Field label="Kecamatan">
                      <SelectInput
                        value={getRegionName(districts, form.district)}
                        placeholder="Pilih Kecamatan"
                        options={districts.map((d) => d.name)}
                        disabled={!form.city}
                        loading={loadingDistricts}
                        open={districtSelect.open}
                        onToggle={districtSelect.toggle}
                        onSelect={(v) => {
                          const d = districts.find((x) => x.name === v);
                          update("district", d?.id || v);
                          districtSelect.close();
                        }}
                      />
                    </Field>

                    {/* Village */}
                    <Field label="Desa / Kelurahan">
                      <SelectInput
                        value={getRegionName(villages, form.village)}
                        placeholder="Pilih Desa / Kelurahan"
                        options={villages.map((v) => v.name)}
                        disabled={!form.district}
                        loading={loadingVillages}
                        open={villageSelect.open}
                        onToggle={villageSelect.toggle}
                        onSelect={(v) => {
                          const vl = villages.find((x) => x.name === v);
                          update("village", vl?.id || v);
                          villageSelect.close();
                        }}
                      />
                    </Field>

                    {/* Postal code */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Kode Pos" required>
                        <input type="text" required inputMode="numeric" value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} placeholder="13540" className={inputClass} />
                      </Field>
                      <Field label="Catatan Alamat (Opsional)">
                        <input type="text" value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Patokan untuk kurir" className={inputClass} />
                      </Field>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 border-t border-zinc-200 bg-zinc-50 px-5 py-3">
                    <button type="button" onClick={() => { setEditing(false); }} className="border border-zinc-300 bg-white px-4 py-2 text-xs font-medium text-zinc-800 transition-colors hover:border-zinc-700 hover:text-zinc-900">
                      Batal
                    </button>
                    <button type="submit" className="flex items-center gap-1.5 bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800">
                      <Save className="h-3.5 w-3.5" strokeWidth={2.5} />
                      Simpan Alamat
                    </button>
                  </div>
                </motion.form>
              )}
            </div>

            {/* Right: Map */}
            <motion.aside
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h2 className="text-base font-semibold text-zinc-900">Titik Lokasi di Peta</h2>

              <LeafletMap
                lat={form.lat}
                lng={form.lng}
                onMapClick={handleMapClick}
              />

              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="flex w-full items-center justify-center gap-2 rounded-sm border border-zinc-300 bg-white px-4 py-2.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-700 hover:text-zinc-900"
              >
                <Crosshair className="h-3.5 w-3.5" strokeWidth={2} />
                Gunakan Lokasi Saat Ini
              </button>

              <div className="rounded-sm border border-zinc-200 bg-white p-4 text-xs text-zinc-600">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-700">Alamat Lengkap</p>
                <p className="mt-1 text-sm text-zinc-900">{form.street}</p>
                <p className="text-sm text-zinc-900">
                  {form.village && `${getRegionName(villages, form.village)}, `}
                  {getRegionName(districts, form.district)}, {getRegionName(cities, form.city)}, {getRegionName(provinces, form.province)} {form.postalCode}
                </p>
                {form.phone && (
                  <div className="mt-3 flex items-center gap-2 border-t border-zinc-100 pt-3 text-zinc-500">
                    <Phone className="h-3 w-3" strokeWidth={2} />
                    <span>{form.phone}</span>
                  </div>
                )}
                <div className="mt-1 flex items-center gap-2 text-zinc-400">
                  <MapPin className="h-3 w-3" strokeWidth={2} />
                  <span className="font-mono">{form.lat.toFixed(4)}, {form.lng.toFixed(4)}</span>
                </div>
              </div>

              <p className="text-[10px] leading-relaxed text-zinc-500">
                <span className="font-semibold">Catatan:</span> Klik pada peta untuk menandai posisi toko. Kurir akan menggunakan titik ini sebagai acuan penjemputan.
              </p>
            </motion.aside>
          </div>
        </div>
      </div>
    </MitraShell>
  );
}
