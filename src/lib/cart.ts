"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "./api";
import { useAuth } from "./auth";
import { getImageUrl } from "./image-utils";

const API_HOST = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api").replace("/api", "");

export interface CartItem {
  id: string; // variantId
  quantity: number;
  price?: number; // Price at time of adding
  name?: string; // Product name for display
  image?: string; // Product image for display
}

interface CartState {
  items: CartItem[];
  syncing: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, snapshot?: { price?: number; name?: string; image?: string; variantId?: string }) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  clear: () => Promise<void>;
  syncGuestCart: () => Promise<void>;
  getCount: () => number;
  getTotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      syncing: false,
      fetchCart: async () => {
        // Don't clobber locally-optimistic items while a mutation is in flight.
        if (get().syncing) return;
        const isAuth = useAuth.getState().isAuthenticated;
        if (isAuth) {
          try {
            const dbItems = await api.get("/cart");
            const mapped = dbItems.map((item: any) => ({
              id: item.variantId,
              quantity: item.quantity,
              price: item.variant?.price,
              name: item.variant?.product?.name,
              image: getImageUrl(item.variant?.product?.images?.[0]),
            }));
            set({ items: mapped });
          } catch (e) {
            console.error("Failed to fetch db cart", e);
          }
        }
      },
      addItem: async (productId: string, snapshot?: { price?: number; name?: string; image?: string; variantId?: string }) => {
        const isAuth = useAuth.getState().isAuthenticated;

        // Resolve a valid variantId. The cart API expects a variantId, but the
        // product card/list only knows the productId — fetch the detail to get
        // the first variant (falls back to productId if none/unauthenticated).
        // Use variantId from snapshot if provided (avoids extra fetch).
        // When called from ProductCard/ProductInfo, the product.id is already
        // the variant ID because the listing API resolves it via variants?.[0]?.id.
        let variantId = snapshot?.variantId || productId;
        let price = snapshot?.price;
        let name = snapshot?.name;
        let image = snapshot?.image;

        // Only fetch as fallback if no variantId was provided and user is auth'd
        if (!snapshot?.variantId && isAuth) {
          try {
            const p: any = await api.get(`/products/${productId}`);
            variantId = p?.variants?.[0]?.id || productId;
            price = price ?? p?.price;
            name = name ?? p?.name;
            image = image ?? p?.images?.[0];
          } catch {
            /* use productId fallback */
          }
        }

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
          set({ syncing: true });
          try {
            const quantity = existing ? existing.quantity + 1 : 1;
            await api.post("/cart/items", { variantId, quantity });
          } catch (e) {
            console.error("Failed to sync add item to db cart", e);
          } finally {
            set({ syncing: false });
          }
        }
      },
      removeItem: async (variantId) => {
        const isAuth = useAuth.getState().isAuthenticated;
        
        set((state) => ({
          items: state.items.filter((i) => i.id !== variantId),
        }));

        if (isAuth) {
          set({ syncing: true });
          try {
            await api.delete(`/cart/items/${variantId}`);
          } catch (e) {
            console.error("Failed to sync remove item from db cart", e);
          } finally {
            set({ syncing: false });
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
          set({ syncing: true });
          try {
            await api.post("/cart/items", { variantId, quantity });
          } catch (e) {
            console.error("Failed to sync update quantity to db cart", e);
          } finally {
            set({ syncing: false });
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
  syncGuestCart: async () => {
    const isAuth = useAuth.getState().isAuthenticated;
    const localItems = get().items;
    if (isAuth && localItems.length > 0) {
      try {
        for (const item of localItems) {
          await api.post("/cart/items", { variantId: item.id, quantity: item.quantity });
        }
        await get().fetchCart();
      } catch (e) {
        console.error("Failed to sync guest cart", e);
      }
    }
  },
  getCount: () =>
    get().items.reduce((sum, item) => sum + item.quantity, 0),
  getTotal: () =>
    get().items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0),
}),
    { name: "pasarjaya-cart" }
  )
);
