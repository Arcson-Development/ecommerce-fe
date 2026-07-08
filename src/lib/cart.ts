"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "./api";
import { useAuth } from "./auth";

export interface CartItem {
  id: string; // This represents the variantId in the frontend
  quantity: number;
}

interface CartState {
  items: CartItem[];
  fetchCart: () => Promise<void>;
  addItem: (variantId: string) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  clear: () => Promise<void>;
  getCount: () => number;
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
            // Map backend CartItem { variantId, quantity } to frontend CartItem { id: variantId, quantity }
            const mapped = dbItems.map((item: any) => ({
              id: item.variantId,
              quantity: item.quantity,
            }));
            set({ items: mapped });
          } catch (e) {
            console.error("Failed to fetch db cart", e);
          }
        }
      },
      addItem: async (variantId) => {
        const isAuth = useAuth.getState().isAuthenticated;
        
        // Update local state first (Optimistic update)
        const currentItems = get().items;
        const existing = currentItems.find((i) => i.id === variantId);
        let newItems: CartItem[] = [];
        
        if (existing) {
          newItems = currentItems.map((i) =>
            i.id === variantId ? { ...i, quantity: i.quantity + 1 } : i
          );
        } else {
          newItems = [...currentItems, { id: variantId, quantity: 1 }];
        }
        
        set({ items: newItems });

        // Sync with backend if authenticated
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
        
        // Update local state
        set((state) => ({
          items: state.items.filter((i) => i.id !== variantId),
        }));

        // Sync with backend
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

        // Update local state
        set((state) => ({
          items: state.items.map((i) =>
            i.id === variantId ? { ...i, quantity } : i
          ),
        }));

        // Sync with backend
        if (isAuth) {
          try {
            await api.post("/cart/items", { variantId, quantity });
          } catch (e) {
            console.error("Failed to sync update quantity to db cart", e);
          }
        }
      },
      clear: async () => {
        set({ items: [] });
        // Handled automatically on checkout, but if cleared manually and authenticated:
        const isAuth = useAuth.getState().isAuthenticated;
        if (isAuth) {
          const currentItems = get().items;
          for (const item of currentItems) {
            try {
              await api.delete(`/cart/items/${item.id}`);
            } catch (e) {
              // ignore
            }
          }
        }
      },
      getCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: "snowys-cart" }
  )
);
