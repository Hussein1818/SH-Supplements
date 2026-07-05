import { create } from "zustand";
import { api } from "../auth/axiosInstance";
import { normalizeImageUrl } from "@/src/lib/utils";

export interface CartItem {
  id?: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  productImageUrl?: string;
  totalPrice?: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  setCart: (items: CartItem[]) => void;
  fetchCart: () => Promise<void>;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],

  addItem: (newItem) =>
    set((state) => {
      const existingItem = state.items.find(
        (item) => String(item.productId) === String(newItem.productId),
      );
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            String(item.productId) === String(newItem.productId)
              ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
              : item,
          ),
        };
      }
      return { items: [...state.items, { ...newItem, quantity: newItem.quantity || 1 }] };
    }),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  clearCart: () => set({ items: [] }),

  updateQuantity: (id, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity: quantity } : item,
      ),
    })),

  setCart: (items) => set({ items }),

  fetchCart: async () => {
    try {
      const response = await api.get("/Carts/my-cart");
      const items = (response.data?.items || []).map((item: any) => ({
        ...item,
        productImageUrl: normalizeImageUrl(item.productImageUrl),
      }));
      set({ items });
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  },
}));
