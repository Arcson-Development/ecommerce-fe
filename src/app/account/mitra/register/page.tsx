"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronLeft, Upload } from "lucide-react";
import dynamic from "next/dynamic";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";

const LeafletMap = dynamic(() => import("@/components/LeafletMap").then((m) => ({ default: m.LeafletMap })), { ssr: false });
import {
  AccountSidebar,
  AccountLayoutHeader,
} from "@/components/account/AccountSidebar";
import { useMitra } from "@/lib/mitra";
import { api } from "@/lib/api";
import { toast } from "sonner";

const PROVINCES = [
  "DKI Jakarta",
  "Jawa Barat",
  "Jawa Tengah",
  "Jawa Timur",
  "Banten",
  "Yogyakarta",
  "Bali",
];

const CITIES: Record<string, string[]> = {
  "DKI Jakarta": ["Jakarta Pusat", "Jakarta Selatan", "Jakarta Barat"],
  "Jawa Barat": ["Bandung", "Bogor", "Depok", "Bekasi"],
  "Jawa Tengah": ["Semarang", "Solo", "Magelang"],
  "Jawa Timur": ["Surabaya", "Malang", "Sidoarjo"],
  Banten: ["Tangerang", "Serang"],
  Yogyakarta: ["Yogyakarta", "Sleman"],
  Bali: ["Denpasar", "Badung"],
};

const STORE_TYPES = [
  "Toko Retail",
  "Toko Grosir",
  "Petani / Peternak",
  "Distributor",
  "Home Industry",
];

export default function MitraRegisterPage() {
  const router = useRouter();
  const addApplication = useMitra((s) => s.addApplication);
  const [markets, setMarkets] = useState<any[]>([]);

  useEffect(() => {
    async function loadMarkets() {
      try {
        const res = await api.get("/markets");
        setMarkets(Array.isArray(res) ? res : []);
      } catch (_) {}
    }
    loadMarkets();
  }, []);

  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    storeName: "",
    province: "",
    city: "",
    district: "",
    address: "",
    postalCode: "",
    storeType: "",
    marketId: "",
    lat: -6.2088,
    lng: 106.8456,
  });
  const [openDropdown, setOpenDropdown] = useState<
    null | "province" | "city" | "district" | "storeType" | "market"
  >(null);
  const [submitting, setSubmitting] = useState(false);

  const cities = form.province ? CITIES[form.province] ?? [] : [];

  const update = (k: keyof typeof form, v: any) => {
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (k === "province") {
        next.city = "";
        next.district = "";
      }
      if (k === "city") {
        next.district = "";
      }
      if (k === "marketId") {
        const market = markets.find((m: any) => m.id === v);
        if (market) {
          next.lat = market.lat;
          next.lng = market.lng;
        }
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const required: (keyof typeof form)[] = [
      "email",
      "firstName",
      "lastName",
      "phone",
      "storeName",
      "province",
      "city",
      "address",
      "postalCode",
      "storeType",
      "marketId",
    ];
    if (required.some((k) => String(form[k] ?? "").trim() === "")) {
      toast.error("Mohon lengkapi semua field wajib.");
      return;
    }
    setSubmitting(true);
    const id = String(Date.now()).slice(-7);
    const { marketId: _, lat: _lat, lng: _lng, ...rest } = form;
    addApplication({
      id,
      date: new Date().toISOString(),
      status: "review",
      ...rest,
    });
    setTimeout(() => {
      router.push(`/account/mitra/${id}`);
    }, 600);
  };

  return (
    <>
      <TopBar />
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => router.push("/account/mitra")}
          className="mb-4 flex items-center gap-1.5 text-sm text-zinc-600 transition-colors hover:text-zinc-900"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          Kembali
        </button>
        <AccountLayoutHeader title="Mitra" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
          <AccountSidebar active="mitra" />

          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="rounded-sm border border-zinc-200 bg-white">
              <div className="grid grid-cols-1 gap-x-8 gap-y-4 p-6 sm:p-8 md:grid-cols-2">
                {/* INFORMASI PEMILIK */}
                <fieldset className="space-y-4">
                  <legend className="mb-2 w-full border-b border-zinc-200 pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-900">
                    Informasi Pemilik
                  </legend>

                  <Field label="Alamat E-mail" required>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="Alamat E-mail"
                      className="form-input"
                    />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Nama Depan" required>
                      <input
                        type="text"
                        required
                        value={form.firstName}
                        onChange={(e) => update("firstName", e.target.value)}
                        placeholder="..."
                        className="form-input"
                      />
                    </Field>
                    <Field label="Nama Belakang" required>
                      <input
                        type="text"
                        required
                        value={form.lastName}
                        onChange={(e) => update("lastName", e.target.value)}
                        placeholder="..."
                        className="form-input"
                      />
                    </Field>
                  </div>

                  <Field label="Telepon" required>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="Telepon"
                      className="form-input"
                    />
                  </Field>
                </fieldset>

                {/* INFORMASI TOKO */}
                <fieldset className="space-y-4">
                  <legend className="mb-2 w-full border-b border-zinc-200 pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-900">
                    Informasi Toko
                  </legend>

                  <Field label="Nama Toko" required>
                    <input
                      type="text"
                      required
                      value={form.storeName}
                      onChange={(e) => update("storeName", e.target.value)}
                      placeholder="Nama Toko"
                      className="form-input"
                    />
                  </Field>

                  <Field label="Provinsi" required>
                    <SelectInput
                      value={form.province}
                      placeholder="Provinsi"
                      options={PROVINCES}
                      open={openDropdown === "province"}
                      onToggle={() =>
                        setOpenDropdown(
                          openDropdown === "province" ? null : "province"
                        )
                      }
                      onSelect={(v) => {
                        update("province", v);
                        setOpenDropdown(null);
                      }}
                    />
                  </Field>

                  <Field label="Kota" required>
                    <SelectInput
                      value={form.city}
                      placeholder="Kota"
                      options={cities}
                      disabled={!form.province}
                      open={openDropdown === "city"}
                      onToggle={() =>
                        setOpenDropdown(
                          openDropdown === "city" ? null : "city"
                        )
                      }
                      onSelect={(v) => {
                        update("city", v);
                        setOpenDropdown(null);
                      }}
                    />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Kecamatan">
                      <input
                        type="text"
                        value={form.district}
                        onChange={(e) => update("district", e.target.value)}
                        placeholder="Kecamatan"
                        className="form-input"
                      />
                    </Field>
                    <Field label="Alamat Detail">
                      <input
                        type="text"
                        value={form.address}
                        onChange={(e) => update("address", e.target.value)}
                        placeholder="Alamat Detail"
                        className="form-input"
                      />
                    </Field>
                  </div>

                  <Field label="Kode Pos" required>
                    <input
                      type="text"
                      required
                      value={form.postalCode}
                      onChange={(e) => update("postalCode", e.target.value)}
                      placeholder="Kode Pos"
                      className="form-input"
                    />
                  </Field>

                  <Field label="Pasar / Lokasi" required>
                    <SelectInput
                      value={markets.find((m: any) => m.id === form.marketId)?.name || ""}
                      placeholder="Pilih Pasar"
                      options={markets.map((m: any) => m.name)}
                      open={openDropdown === "market"}
                      onToggle={() =>
                        setOpenDropdown(
                          openDropdown === "market" ? null : "market"
                        )
                      }
                      onSelect={(v) => {
                        const market = markets.find((m: any) => m.name === v);
                        if (market) update("marketId", market.id);
                        setOpenDropdown(null);
                      }}
                    />
                  </Field>

                  <Field label="Lokasi Toko di Peta">
                    <div className="h-64 border border-zinc-200 rounded-sm overflow-hidden">
                      <LeafletMap
                        lat={form.lat}
                        lng={form.lng}
                        onSelectLocation={(lat, lng) => {
                          update("lat", String(lat));
                          update("lng", String(lng));
                        }}
                      />
                    </div>
                  </Field>

                  <Field label="Jenis Toko" required>
                    <SelectInput
                      value={form.storeType}
                      placeholder="Jenis Toko"
                      options={STORE_TYPES}
                      open={openDropdown === "storeType"}
                      onToggle={() =>
                        setOpenDropdown(
                          openDropdown === "storeType" ? null : "storeType"
                        )
                      }
                      onSelect={(v) => {
                        update("storeType", v);
                        setOpenDropdown(null);
                      }}
                    />
                  </Field>

                  <Field label="Dokumen Pendukung (Opsional)">
                    <label className="flex cursor-pointer items-center gap-2 border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-500 transition-colors hover:border-zinc-400">
                      <Upload className="h-4 w-4" strokeWidth={2} />
                      <span>
                        Tarik dokumen kesini atau pilih dari{" "}
                        <span className="font-medium text-zinc-700 underline">
                          file
                        </span>
                      </span>
                      <input type="file" className="hidden" />
                    </label>
                  </Field>
                </fieldset>
              </div>

              <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-4 sm:px-8">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-zinc-900 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400 sm:w-auto sm:px-12"
                >
                  {submitting ? "Mengirim..." : "Pengajuan"}
                </button>
              </div>
            </div>
          </motion.form>
        </div>
      </main>

      <style jsx>{`
        .form-input {
          width: 100%;
          border: 1px solid #e4e4e7;
          background: #fafafa;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: #18181b;
          transition: border-color 0.15s, background 0.15s;
        }
        .form-input::placeholder {
          color: #a1a1aa;
        }
        .form-input:hover:not(:disabled) {
          border-color: #a1a1aa;
        }
        .form-input:focus {
          outline: none;
          border-color: #18181b;
          background: #ffffff;
        }
      `}</style>
    </>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-zinc-800">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function SelectInput({
  value,
  placeholder,
  options,
  disabled,
  open,
  onToggle,
  onSelect,
}: {
  value: string;
  placeholder: string;
  options: string[];
  disabled?: boolean;
  open: boolean;
  onToggle: () => void;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        className={`flex w-full items-center justify-between border bg-zinc-50 px-4 py-3 text-left text-sm transition-colors ${
          disabled
            ? "cursor-not-allowed border-zinc-200 text-zinc-400"
            : open
              ? "border-zinc-900 bg-white text-zinc-900"
              : "border-zinc-200 text-zinc-700 hover:border-zinc-400"
        }`}
      >
        <span className={value ? "text-zinc-900" : "text-zinc-400"}>
          {value || placeholder}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4" strokeWidth={2} />
        </motion.span>
      </button>
      {open && !disabled && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={onToggle}
          />
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 z-20 mt-1 max-h-60 overflow-auto border border-zinc-200 bg-white shadow-lg"
          >
            {options.map((opt) => (
              <li key={opt}>
                <button
                  type="button"
                  onClick={() => onSelect(opt)}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-zinc-50 ${
                    opt === value
                      ? "bg-zinc-50 font-medium text-zinc-900"
                      : "text-zinc-700"
                  }`}
                >
                  {opt}
                </button>
              </li>
            ))}
          </motion.ul>
        </>
      )}
    </div>
  );
}
