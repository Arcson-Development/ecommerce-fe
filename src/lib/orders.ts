"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OrderStatus = "processing" | "shipped" | "completed" | "cancelled";

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  unit: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  date: string; // ISO
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  shippingMethod: string;
  paymentMethod: string;
  total: number;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
  trackingNumber?: string;
}

interface OrdersState {
  orders: Order[];
  addOrder: (order: Order) => void;
  getOrder: (id: string) => Order | undefined;
}

const seedOrders: Order[] = [
  {
    id: "SNW-1029384",
    date: "2026-06-28T09:15:00.000Z",
    status: "completed",
    items: [
      {
        productId: "1",
        productName: "Brokoli",
        productImage:
          "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=600&q=80",
        unit: "1 Kg",
        price: 18200,
        quantity: 2,
      },
      {
        productId: "2",
        productName: "Tomat Merah",
        productImage:
          "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80",
        unit: "1 Kg",
        price: 28000,
        quantity: 1,
      },
    ],
    subtotal: 64400,
    shippingCost: 10000,
    shippingMethod: "Go-jek (Estimasi 1 – 2 jam)",
    paymentMethod: "QRIS (default)",
    total: 74400,
    shippingAddress: {
      name: "Juniko Dwi Putra",
      phone: "081234567890",
      address: "Jl. Margonda Raya No. 100",
      city: "Depok",
      province: "Jawa Barat",
      postalCode: "16424",
    },
    trackingNumber: "GJK-2026-0618-9921",
  },
  {
    id: "SNW-1029312",
    date: "2026-06-22T14:42:00.000Z",
    status: "shipped",
    items: [
      {
        productId: "3",
        productName: "Bawang Merah",
        productImage:
          "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&q=80",
        unit: "1 Kg",
        price: 45000,
        quantity: 1,
      },
      {
        productId: "4",
        productName: "Wortel",
        productImage:
          "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&q=80",
        unit: "1 Kg",
        price: 26000,
        quantity: 2,
      },
    ],
    subtotal: 97000,
    shippingCost: 0,
    shippingMethod: "JNE Regular (Estimasi 2 – 3 hari)",
    paymentMethod: "Transfer Bank BCA",
    total: 97000,
    shippingAddress: {
      name: "Juniko Dwi Putra",
      phone: "081234567890",
      address: "Jl. Margonda Raya No. 100",
      city: "Depok",
      province: "Jawa Barat",
      postalCode: "16424",
    },
    trackingNumber: "JNE-7766554433",
  },
  {
    id: "SNW-1029201",
    date: "2026-06-15T08:05:00.000Z",
    status: "processing",
    items: [
      {
        productId: "1",
        productName: "Brokoli",
        productImage:
          "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=600&q=80",
        unit: "1 Kg",
        price: 18200,
        quantity: 1,
      },
    ],
    subtotal: 18200,
    shippingCost: 12000,
    shippingMethod: "Grab (Estimasi 2 – 3 jam)",
    paymentMethod: "DANA",
    total: 30200,
    shippingAddress: {
      name: "Juniko Dwi Putra",
      phone: "081234567890",
      address: "Jl. Margonda Raya No. 100",
      city: "Depok",
      province: "Jawa Barat",
      postalCode: "16424",
    },
  },
  {
    id: "SNW-1028987",
    date: "2026-05-30T19:20:00.000Z",
    status: "cancelled",
    items: [
      {
        productId: "2",
        productName: "Tomat Merah",
        productImage:
          "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80",
        unit: "1 Kg",
        price: 28000,
        quantity: 3,
      },
    ],
    subtotal: 84000,
    shippingCost: 10000,
    shippingMethod: "Go-jek (Estimasi 1 – 2 jam)",
    paymentMethod: "QRIS (default)",
    total: 94000,
    shippingAddress: {
      name: "Juniko Dwi Putra",
      phone: "081234567890",
      address: "Jl. Margonda Raya No. 100",
      city: "Depok",
      province: "Jawa Barat",
      postalCode: "16424",
    },
  },
];

export const useOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: seedOrders,
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      getOrder: (id) => get().orders.find((o) => o.id === id),
    }),
    { name: "snowys-orders" }
  )
);
