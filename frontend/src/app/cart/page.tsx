"use client";

import { useEffect, useState, useCallback } from "react";
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";
import { api } from "@/src/components/auth/axiosInstance";
import { toast } from "sonner";
import { useCartStore } from "@/src/components/store/cartStore";
import { useAuthStore } from "@/src/components/store/authStore";
import Link from "next/link";

export default function CartPage() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);

  const cartItems = useCartStore((state) => state.items);
  const updateQuantityStore = useCartStore((state) => state.updateQuantity);
  const removeItemStore = useCartStore((state) => state.removeItem);

  const [grandTotal, setGrandTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/Carts/my-cart`);

      useCartStore.setState({ items: response.data.items || [] });
      setGrandTotal(response.data.grandTotal || 0);
    } catch (error) {
      toast.error("Failed to load cart");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
      return;
    }
    fetchCart();
  }, [accessToken, fetchCart]);

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      await api.delete(`/Carts/remove/${cartItemId}`);
      removeItemStore(cartItemId);
      toast.success("Item removed");
      fetchCart();
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleUpdateQuantity = async (
    cartItemId: string,
    newQuantity: number,
  ) => {
    if (newQuantity < 1) return;
    try {
      await api.put(`/Carts/update-quantity`, {
        cartItemId,
        quantity: newQuantity,
      });
      updateQuantityStore(cartItemId, newQuantity);
      fetchCart();
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin w-8 h-8 text-[#0044CC]" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <ShoppingBag className="w-16 h-16 text-gray-200" />
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <Button onClick={() => router.push("/products")}>
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8" dir="ltr">
      <h1 className="text-3xl font-extrabold">Shopping Cart</h1>

      <div className="space-y-4">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 bg-white border rounded-2xl shadow-sm"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.productImageUrl}
                alt={item.productName}
                className="w-16 h-16 object-cover rounded-xl"
              />
              <div>
                <h3 className="font-bold">{item.productName}</h3>
                <p className="text-sm text-gray-500">${item.unitPrice}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center bg-gray-50 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    handleUpdateQuantity(item.id, item.quantity - 1)
                  }
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-bold">
                  {item.quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    handleUpdateQuantity(item.id, item.quantity + 1)
                  }
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="font-bold w-20 text-right">
                ${item.totalPrice.toFixed(2)}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleRemoveItem(item.id)}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-6 rounded-2xl flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Grand Total</p>
          <p className="text-3xl font-black">${grandTotal.toFixed(2)}</p>
        </div>
        <Button asChild size="lg" className="rounded-xl px-8">
          <Link href="/orders/checkout">Proceed to Checkout</Link>
        </Button>
      </div>
    </div>
  );
}
