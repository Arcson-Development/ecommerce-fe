"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "./api";
import { useAuth } from "./auth";

export type MitraStatus = "review" | "approved" | "rejected";

export interface MitraApplication {
  id: string;
  date: string; // ISO
  status: MitraStatus;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  storeName: string;
  province: string;
  city: string;
  district: string;
  address: string;
  postalCode: string;
  storeType: string;
  documentUrl?: string;
  adminNote?: string;
}

interface MitraState {
  applications: MitraApplication[];
  hasApplied: boolean;
  storeProfile: any | null;
  addApplication: (a: MitraApplication) => Promise<void>;
  fetchMitraStatus: () => Promise<void>;
  getApplication: (id: string) => MitraApplication | undefined;
}

export const useMitra = create<MitraState>()(
  persist(
    (set, get) => ({
      applications: [],
      hasApplied: false,
      storeProfile: null,
      addApplication: async (a) => {
        const isAuth = useAuth.getState().isAuthenticated;
        if (!isAuth) {
          throw new Error("Anda harus masuk terlebih dahulu.");
        }

        try {
          // Register store in the backend
          const res = await api.post("/mitra/register", {
            name: a.storeName,
            address: `${a.address}, ${a.district}, ${a.city}, ${a.province} ${a.postalCode}`,
            description: `${a.storeType} - Mitra baru Pasar Jaya`,
          });
          
          set({ 
            hasApplied: true,
            storeProfile: res,
            applications: [a, ...get().applications] 
          });

          // Re-fetch user profile because their role might change or they have a store linked
          await useAuth.getState().fetchProfile();
        } catch (e: any) {
          console.error("Mitra registration failed", e);
          throw e;
        }
      },
      fetchMitraStatus: async () => {
        const isAuth = useAuth.getState().isAuthenticated;
        if (isAuth) {
          try {
            const profile = await api.get("/mitra/profile").catch(() => null);
            if (profile) {
              set({ 
                hasApplied: true,
                storeProfile: profile,
              });
            } else {
              set({ hasApplied: false, storeProfile: null });
            }
          } catch (e) {
            set({ hasApplied: false, storeProfile: null });
          }
        }
      },
      getApplication: (id) =>
        get().applications.find((x) => x.id === id),
    }),
    { name: "pasarjaya-mitra" }
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
