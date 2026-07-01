"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/components/store/authStore";
import { api } from "@/src/components/auth/axiosInstance";
import { toast } from "sonner";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const accessToken = useAuthStore((state) => state.accessToken);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    setIsClient(true);
    if (!accessToken) {
      router.replace("/login");
    }
  }, [accessToken, router]);

  useEffect(() => {
    async function fetchCart() {
      if (!accessToken) return;
      try {
        const response = await api.get(`/Carts/my-cart`);
        setCart(response.data.items || []);
      } catch (error) {
        console.error("error fetching cart data");
      } finally {
        setIsLoading(false);
      }
    }
    if (isClient) fetchCart();
  }, [accessToken, isClient]);

  const handleRemoveItem = async (cartItemId: number) => {
    const previousCart = [...cart];
    setCart(cart.filter((item) => item.id !== cartItemId));

    try {
      await api.delete(`/carts/remove/${cartItemId}`);
      toast.success("Item removed");
    } catch (error) {
      setCart(previousCart);
      toast.error("Failed to remove item");
    }
  };
  const handleUpdateQuantity = async (
    cartItemId: number,
    newQuantity: number,
  ) => {
    if (newQuantity < 1) return;

    const previousCart = [...cart];
    setCart(
      cart.map((item) =>
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item,
      ),
    );

    try {
      await api.put(`/Carts/update-quantity`, {
        cartItemId: cartItemId,
        quantity: newQuantity,
      });
    } catch (error) {
      setCart(previousCart);
      toast.error("Failed to update quantity");
    }
  };

  if (!isClient || !accessToken) return null;

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-500">
        Loading your cart...
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[50vh] space-y-4"
        dir="ltr"
      >
        <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
        <Button onClick={() => router.push("/products")} className="rounded-xl">
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8" dir="ltr">
      <h1 className="text-3xl font-extrabold text-gray-900">Shopping Cart</h1>

      <div className="space-y-4">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center p-2">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="max-h-full object-contain mix-blend-multiply"
                  />
                ) : (
                  <span className="text-xs text-gray-400">No Img</span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">${item.price}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* أزرار تعديل الكمية */}
              <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-md"
                  onClick={() =>
                    handleUpdateQuantity(item.id, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-6 text-center font-medium text-sm">
                  {item.quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-md"
                  onClick={() =>
                    handleUpdateQuantity(item.id, item.quantity + 1)
                  }
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <p className="font-bold text-lg text-gray-900 w-20 text-right">
                ${(item.price * item.quantity).toFixed(2)}
              </p>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveItem(item.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl mt-8">
        <div>
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="text-2xl font-extrabold text-gray-900">
            ${total.toFixed(2)}
          </p>
        </div>
        <Button size="lg" className="rounded-xl">
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}
