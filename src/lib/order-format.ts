import type { OrderStatus } from "@/lib/orders";

export interface StatusMeta {
  label: string;
  bg: string;
  text: string;
  dot: string;
}

export const ORDER_STATUS_META: Record<OrderStatus, StatusMeta> = {
  processing: {
    label: "Diproses",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  shipped: {
    label: "Dikirim",
    bg: "bg-sky-50",
    text: "text-sky-700",
    dot: "bg-sky-500",
  },
  completed: {
    label: "Selesai",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  cancelled: {
    label: "Dibatalkan",
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
  },
};

export const formatOrderDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const formatOrderDateTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
