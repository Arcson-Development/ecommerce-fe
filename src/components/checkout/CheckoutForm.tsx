"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Select } from "@/components/Select";

export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  province: string;
  city: string;
  district: string;
  address: string;
  postalCode: string;
  phone: string;
  notes: string;
}

interface CheckoutFormProps {
  data: CheckoutFormData;
  onChange: (data: CheckoutFormData) => void;
}

// Indonesian provinces (sample)
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
  "DKI Jakarta": ["Jakarta Pusat", "Jakarta Selatan", "Jakarta Barat", "Jakarta Timur", "Jakarta Utara"],
  "Jawa Barat": ["Bandung", "Bogor", "Depok", "Bekasi", "Cimahi"],
  "Jawa Tengah": ["Semarang", "Solo", "Magelang", "Salatiga"],
  "Jawa Timur": ["Surabaya", "Malang", "Sidoarjo", "Gresik"],
  Banten: ["Tangerang", "Serang", "Cilegon"],
  Yogyakarta: ["Yogyakarta", "Sleman", "Bantul"],
  Bali: ["Denpasar", "Badung", "Gianyar"],
  "Sumatera Utara": ["Medan", "Binjai", "Pematangsiantar"],
};

const DISTRICTS: Record<string, string[]> = {
  "Bandung": ["Coblong", "Cibeunying Kidul", "Sukajadi", "Buah Batu"],
  "Depok": ["Beji", "Cimanggis", "Sawangan", "Pancoran Mas"],
  "Bogor": ["Bogor Tengah", "Bogor Utara", "Tanah Sareal"],
  "Jakarta Selatan": ["Kebayoran Baru", "Mampang Prapatan", "Pancoran"],
  "Jakarta Pusat": ["Menteng", "Tanah Abang", "Gambir"],
};

export function CheckoutForm({ data, onChange }: CheckoutFormProps) {
  const [showProvince, setShowProvince] = useState(false);
  const [showCity, setShowCity] = useState(false);
  const [showDistrict, setShowDistrict] = useState(false);

  const cities = data.province ? CITIES[data.province] ?? [] : [];
  const districts = data.city ? DISTRICTS[data.city] ?? [] : [];

  const update = (field: keyof CheckoutFormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  // For dependent fields: reset downstream selections in a single state update
  const selectProvince = (v: string) => {
    onChange({ ...data, province: v, city: "", district: "" });
  };
  const selectCity = (v: string) => {
    onChange({ ...data, city: v, district: "" });
  };
  const selectDistrict = (v: string) => {
    onChange({ ...data, district: v });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onSubmit={(e) => e.preventDefault()}
      className="space-y-10"
    >
      {/* BILLING & SHIPPING */}
      <section>
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-zinc-900">
          Penagihan &amp; Pengiriman
        </h2>

        <div className="space-y-4">
          {/* Email */}
          <Field label="Alamat E-mail" required>
            <input
              type="email"
              required
              value={data.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="Alamat E-mail"
              className="form-input"
            />
          </Field>

          {/* First + Last name */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nama Depan" required>
              <input
                type="text"
                required
                value={data.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                placeholder="..."
                className="form-input"
              />
            </Field>
            <Field label="Nama Belakang" required>
              <input
                type="text"
                required
                value={data.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                placeholder="..."
                className="form-input"
              />
            </Field>
          </div>

          {/* Province */}
          <Field label="Provinsi" required>
            <Select
              value={data.province}
              placeholder="Provinsi"
              options={PROVINCES}
              open={showProvince}
              onToggle={() => setShowProvince(!showProvince)}
              onSelect={(v) => {
                selectProvince(v);
                setShowProvince(false);
              }}
            />
          </Field>

          {/* City */}
          <Field label="Kota" required>
            <Select
              value={data.city}
              placeholder="Kota"
              options={cities}
              disabled={!data.province}
              open={showCity}
              onToggle={() => setShowCity(!showCity)}
              onSelect={(v) => {
                selectCity(v);
                setShowCity(false);
              }}
            />
          </Field>

          {/* District + Address detail */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Kecamatan">
              <Select
                value={data.district}
                placeholder="Kecamatan"
                options={districts.length > 0 ? districts : ["-"]}
                disabled={!data.city}
                open={showDistrict}
                onToggle={() => setShowDistrict(!showDistrict)}
                onSelect={(v) => {
                  selectDistrict(v);
                  setShowDistrict(false);
                }}
              />
            </Field>
            <Field label="Alamat Detail">
              <input
                type="text"
                value={data.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="Alamat Detail"
                className="form-input"
              />
            </Field>
          </div>

          {/* Postal code */}
          <Field label="Kode Pos" required>
            <input
              type="text"
              required
              inputMode="numeric"
              value={data.postalCode}
              onChange={(e) => update("postalCode", e.target.value)}
              placeholder="Kode Pos"
              className="form-input"
            />
          </Field>

          {/* Phone */}
          <Field label="Telepon" required>
            <input
              type="tel"
              required
              value={data.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="Telepon"
              className="form-input"
            />
          </Field>
        </div>
      </section>

      {/* ADDITIONAL INFO */}
      <section>
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-zinc-900">
          Informasi Tambahan
        </h2>
        <Field label="Catatan Pesanan (Opsional)">
          <textarea
            rows={5}
            value={data.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Catatan.."
            className="form-input resize-y"
          />
        </Field>
      </section>

      <style jsx>{`
        .form-input {
          width: 100%;
          border: 1px solid #e4e4e7;
          background: #fafafa;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: #18181b;
          transition: border-color 0.15s, background 0.15s;
          border-radius: 0;
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
    </motion.form>
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


