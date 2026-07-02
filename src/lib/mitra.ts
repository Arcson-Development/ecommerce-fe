"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MitraStatus = "review" | "approved" | "rejected";

export interface MitraApplication {
  id: string;
  date: string; // ISO
  status: MitraStatus;
  // Pemilik
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  // Toko
  storeName: string;
  province: string;
  city: string;
  district: string;
  address: string;
  postalCode: string;
  storeType: string;
  documentUrl?: string; // optional
  // Catatan admin (optional, untuk status approved/rejected)
  adminNote?: string;
}

interface MitraState {
  applications: MitraApplication[];
  hasApplied: boolean;
  addApplication: (a: MitraApplication) => void;
  getApplication: (id: string) => MitraApplication | undefined;
  setStatus: (id: string, status: MitraStatus, note?: string) => void;
}

const seedApplications: MitraApplication[] = [
  {
    id: "231344",
    date: "2026-05-04T10:00:00.000Z",
    status: "approved",
    email: "toko.manis@email.com",
    firstName: "Toko",
    lastName: "Manis & Perhiasan",
    phone: "081234567890",
    storeName: "Toko Manis & Perhiasan",
    province: "Jawa Barat",
    city: "Depok",
    district: "Pancoran Mas",
    address: "Jl. Margonda Raya No. 88",
    postalCode: "16424",
    storeType: "Toko Retail",
  },
  {
    id: "231355",
    date: "2026-06-12T08:30:00.000Z",
    status: "review",
    email: "sayur.segar@email.com",
    firstName: "Sayur",
    lastName: "Segar",
    phone: "081234567891",
    storeName: "Sayur Segar Makmur",
    province: "DKI Jakarta",
    city: "Jakarta Selatan",
    district: "Kebayoran Baru",
    address: "Jl. Senopati No. 12",
    postalCode: "12190",
    storeType: "Petani / Peternak",
  },
];

export const useMitra = create<MitraState>()(
  persist(
    (set, get) => ({
      applications: seedApplications,
      hasApplied: true,
      addApplication: (a) =>
        set((state) => ({
          applications: [a, ...state.applications],
          hasApplied: true,
        })),
      getApplication: (id) =>
        get().applications.find((x) => x.id === id),
      setStatus: (id, status, note) =>
        set((state) => ({
          applications: state.applications.map((a) =>
            a.id === id
              ? { ...a, status, ...(note ? { adminNote: note } : {}) }
              : a
          ),
        })),
    }),
    { name: "snowys-mitra" }
  )
);

export const MITRA_STATUS_META: Record<
  MitraStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  review: {
    label: "Review",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  approved: {
    label: "Disetujui",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "Ditolak",
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
  },
};
