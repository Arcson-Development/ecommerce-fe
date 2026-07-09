"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "./api";
import { useAuth } from "./auth";

export interface CartItem {
  id: string; // variantId
  quantity: number;
  price?: number; // Price at time of adding
  name?: string; // Product name for display
  image?: string; // Product image for display
}

interface CartState {
  items: CartItem[];
  fetchCart: () => Promise<void>;
  addItem: (variantId: string, price?: number, name?: string, image?: string) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  clear: () => Promise<void>;
  getCount: () => number;
  getTotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      fetchCart: async () => {
        const isAuth = useAuth.getState().isAuthenticated;
        if (isAuth) {
          try {
            const dbItems = await api.get("/cart");
            const mapped = dbItems.map((item: any) => ({
              id: item.variantId,
              quantity: item.quantity,
              price: item.variant?.price,
              name: item.variant?.product?.name,
              image: item.variant?.product?.images?.[0],
            }));
            set({ items: mapped });
          } catch (e) {
            console.error("Failed to fetch db cart", e);
          }
        }
      },
      addItem: async (variantId, price, name, image) => {
        const isAuth = useAuth.getState().isAuthenticated;
        
        const currentItems = get().items;
        const existing = currentItems.find((i) => i.id === variantId);
        let newItems: CartItem[] = [];
        
        if (existing) {
          newItems = currentItems.map((i) =>
            i.id === variantId ? { ...i, quantity: i.quantity + 1 } : i
          );
        } else {
          newItems = [...currentItems, { id: variantId, quantity: 1, price, name, image }];
        }
        
        set({ items: newItems });

        if (isAuth) {
          try {
            const quantity = existing ? existing.quantity + 1 : 1;
            await api.post("/cart/items", { variantId, quantity });
          } catch (e) {
            console.error("Failed to sync add item to db cart", e);
          }
        }
      },
      removeItem: async (variantId) => {
        const isAuth = useAuth.getState().isAuthenticated;
        
        set((state) => ({
          items: state.items.filter((i) => i.id !== variantId),
        }));

        if (isAuth) {
          try {
            await api.delete(`/cart/items/${variantId}`);
          } catch (e) {
            console.error("Failed to sync remove item from db cart", e);
          }
        }
      },
      updateQuantity: async (variantId, quantity) => {
        const isAuth = useAuth.getState().isAuthenticated;
        
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.id === variantId ? { ...i, quantity } : i
          ),
        }));

        if (isAuth) {
          try {
            await api.post("/cart/items", { variantId, quantity });
          } catch (e) {
            console.error("Failed to sync update quantity to db cart", e);
          }
        }
      },
      clear: async () => {
        const isAuth = useAuth.getState().isAuthenticated;
        const currentItems = get().items;
        
        // Sync with backend BEFORE clearing
        if (isAuth && currentItems.length > 0) {
          for (const item of currentItems) {
            try {
              await api.delete(`/cart/items/${item.id}`);
            } catch (e) {
              // ignore
            }
          }
        }
        
        set({ items: [] });
      },
      getCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
      getTotal: () =>
        get().items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0),
    }),
    { name: "pasarjaya-cart" }
  )
);
