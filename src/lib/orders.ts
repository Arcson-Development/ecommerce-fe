"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "./api";
import { useAuth } from "./auth";

export type OrderStatus = "pending" | "processing" | "shipped" | "completed" | "cancelled";

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
  paymentUrl?: string;
  paymentToken?: string;
  shippingPhoto?: string;
  recipientPhoto?: string;
}

interface OrdersState {
  orders: Order[];
  fetchOrders: () => Promise<void>;
  checkout: (details: {
    shippingMethod: string;
    shippingCost: number;
    paymentMethod: string;
  }) => Promise<{ redirectUrl: string; token: string; orderId: string } | null>;
  getOrder: (id: string) => Promise<Order | undefined>;
}

// Maps backend order to frontend Order format
function mapBackendOrder(order: any): Order {
  const subtotal = order.items.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );
  
  // Since backend doesn't store address per order (it links to user.addresses),
  // we extract address details from user or return placeholder
  const address = order.user?.addresses?.[0] || {
    recipient: order.user?.nickname || order.user?.username || "Customer",
    phone: order.user?.phone || "080000000",
    street: "Alamat Toko / Pengiriman",
    city: "Depok",
    province: "Jawa Barat",
    postalCode: "16424",
  };

  return {
    id: order.id,
    date: order.createdAt,
    status: order.status.toLowerCase() as OrderStatus,
    items: order.items.map((item: any) => ({
      productId: item.variant?.product?.id || "N/A",
      productName: item.variant?.product?.name || item.variant?.name || "Produk",
      productImage: item.variant?.product?.images?.[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
      unit: item.variant?.product?.unit || "Item",
      price: item.price,
      quantity: item.quantity,
    })),
    subtotal,
    shippingCost: order.shippingCost,
    shippingMethod: order.shippingMethod,
    paymentMethod: order.paymentMethod,
    total: order.total,
    shippingAddress: {
      name: address.recipient,
      phone: address.phone,
      address: address.street,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
    },
    trackingNumber: order.trackingNumber || undefined,
    paymentUrl: order.paymentUrl || undefined,
    paymentToken: order.paymentToken || undefined,
    shippingPhoto: order.shippingPhoto || undefined,
    recipientPhoto: order.recipientPhoto || undefined,
  };
}

export const useOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      fetchOrders: async () => {
        const isAuth = useAuth.getState().isAuthenticated;
        if (isAuth) {
          try {
            const dbOrders = await api.get("/orders");
            const mapped = dbOrders.map(mapBackendOrder);
            set({ orders: mapped });
          } catch (e) {
            console.error("Failed to fetch orders from backend", e);
          }
        }
      },
      checkout: async (details) => {
        const isAuth = useAuth.getState().isAuthenticated;
        if (!isAuth) {
          throw new Error("Anda harus masuk terlebih dahulu.");
        }

        try {
          const res = await api.post("/orders/checkout", details);
          // Orders checkout returns array of created orders (usually length 1 if single shop)
          const primaryOrder = res[0];
          
          // Re-fetch orders list to update UI
          await get().fetchOrders();

          if (primaryOrder && primaryOrder.paymentUrl) {
            return {
              redirectUrl: primaryOrder.paymentUrl,
              token: primaryOrder.paymentToken,
              orderId: primaryOrder.id,
            };
          }
          return null;
        } catch (e: any) {
          console.error("Checkout failed", e);
          throw e;
        }
      },
      getOrder: async (id) => {
        // Try locally first
        let found = get().orders.find((o) => o.id === id);
        if (found) return found;

        const isAuth = useAuth.getState().isAuthenticated;
        if (isAuth) {
          try {
            const order = await api.get(`/orders`);
            const singleOrder = order.find((o: any) => o.id === id);
            if (singleOrder) {
              return mapBackendOrder(singleOrder);
            }
          } catch (e) {
            console.error("Failed to fetch single order from backend", e);
          }
        }
        return undefined;
      },
    }),
    { name: "snowys-orders" }
  )
);
