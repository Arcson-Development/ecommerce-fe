"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  id: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
  getCount: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (id) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { id, quantity: 1 }] };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      getCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: "snowys-cart" }
  )
);
