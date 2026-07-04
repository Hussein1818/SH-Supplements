import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  id: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  productImageUrl?: string;
  totalPrice: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (newItem) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.id === newItem.id,
          );
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === newItem.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          }
          return { items: [...state.items, { ...newItem, quantity: 1 }] };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      clearCart: () => set({ items: [] }),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item,
          ),
        })),
    }),
    { name: "cart-storage" },
  ),
);
