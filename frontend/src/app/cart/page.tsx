"use client";

import { useEffect, useState, useCallback } from "react";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";
import { api } from "@/src/components/auth/axiosInstance";
import { toast } from "sonner";
import { useCartStore } from "@/src/components/store/cartStore";
import { useAuthStore } from "@/src/components/store/authStore";
import Link from "next/link";
import { cn, formatPrice, normalizeImageUrl } from "@/src/lib/utils";

// ─── Skeleton ──────────────────────────────────────────────────────────────
function SkeletonCartItem() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-stone-200">
      <div className="skeleton h-16 w-16 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-3 w-1/4 rounded" />
      </div>
      <div className="skeleton h-8 w-24 rounded-xl" />
      <div className="skeleton h-5 w-14 rounded" />
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function CartPage() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);

  const cartItems = useCartStore((state) => state.items);
  const updateQuantityStore = useCartStore((state) => state.updateQuantity);
  const removeItemStore = useCartStore((state) => state.removeItem);

  const [grandTotal, setGrandTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // ── Data fetching (logic unchanged) ──────────────────────────────────────
  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/Carts/my-cart`);
      useCartStore.setState({ items: response.data.items || [] });
      setGrandTotal(response.data.grandTotal || 0);
    } catch {
      toast.error("Failed to load cart");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!accessToken) { router.replace("/login?redirect=/cart"); return; }
    fetchCart();
  }, [accessToken, fetchCart]);

  const handleRemoveItem = async (cartItemId: string) => {
    if (!cartItemId) return;
    try {
      await api.delete(`/Carts/remove/${cartItemId}`);
      removeItemStore(cartItemId);
      toast.success("Item removed");
      fetchCart();
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (!cartItemId || newQuantity < 1) return;
    try {
      await api.put(`/Carts/update-quantity`, { cartItemId, quantity: newQuantity });
      updateQuantityStore(cartItemId, newQuantity);
      fetchCart();
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="container-xl py-10" dir="ltr">
        <div className="skeleton h-8 w-40 rounded-lg mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[0, 1, 2].map((i) => <SkeletonCartItem key={i} />)}
          </div>
          <div className="skeleton h-56 rounded-2xl" />
        </div>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="container-xl py-24 flex flex-col items-center justify-center text-center" dir="ltr">
        <div className="h-20 w-20 rounded-3xl bg-stone-100 flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-stone-300" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-black text-stone-900 mb-2">Your cart is empty</h1>
        <p className="text-stone-500 text-sm mb-8 max-w-xs">
          Looks like you haven't added anything yet. Browse our catalog and find something you love.
        </p>
        <Button asChild variant="primary" size="lg" className="rounded-xl font-bold">
          <Link href="/products">
            Browse Products <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    );
  }

  // ── Filled cart ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-50" dir="ltr">
      <div className="container-xl py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Shopping Cart</h1>
          <p className="text-stone-500 text-sm mt-1">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">

          {/* ── Cart Items ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-4 p-4 bg-white border border-stone-200 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] group hover:border-stone-300 transition-colors"
                role="listitem"
              >
                {/* Product image */}
                <Link href={`/products/${item.productId}`} className="flex-shrink-0" aria-label={`View ${item.productName}`}>
                  <div className="h-16 w-16 rounded-xl bg-stone-50 border border-stone-100 overflow-hidden flex items-center justify-center">
                    <img
                      src={normalizeImageUrl(item.productImageUrl) || "/placeholder.png"}
                      alt={item.productName}
                      className="h-full w-full object-contain p-1 mix-blend-multiply"
                    />
                  </div>
                </Link>

                {/* Name + Price */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-900 text-sm truncate">{item.productName}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">{formatPrice(item.unitPrice)} each</p>
                </div>

                {/* Quantity stepper */}
                <div className="flex items-center bg-stone-100 rounded-xl p-0.5 gap-0" role="group" aria-label={`Quantity for ${item.productName}`}>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-8 w-8 rounded-xl hover:bg-stone-200 text-stone-600"
                    onClick={() => handleUpdateQuantity(item.id!, item.quantity - 1)}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                  <span
                    className="w-8 text-center text-sm font-bold text-stone-900 select-none"
                    aria-live="polite"
                    aria-label={`Quantity: ${item.quantity}`}
                  >
                    {item.quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-8 w-8 rounded-xl hover:bg-stone-200 text-stone-600"
                    onClick={() => handleUpdateQuantity(item.id!, item.quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </div>

                {/* Line total */}
                <div className="text-right w-20 flex-shrink-0">
                  <p className="font-black text-stone-900 text-sm">
                    {formatPrice(item.totalPrice ?? item.unitPrice * item.quantity)}
                  </p>
                </div>

                {/* Remove */}
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="flex-shrink-0 rounded-xl text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  onClick={() => handleRemoveItem(item.id!)}
                  aria-label={`Remove ${item.productName} from cart`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            ))}
          </div>

          {/* ── Order Summary ──────────────────────────────────────────── */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-stone-100">
                <h2 className="font-bold text-stone-900 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  Order Summary
                </h2>
              </div>

              <div className="p-5 space-y-3">
                {/* Item subtotals */}
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center text-sm">
                    <span className="text-stone-500 truncate max-w-[60%]">
                      {item.productName}
                      <span className="text-stone-400 ml-1">×{item.quantity}</span>
                    </span>
                    <span className="font-semibold text-stone-800 flex-shrink-0">
                      {formatPrice(item.totalPrice ?? item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}

                {/* Divider */}
                <div className="border-t border-stone-100 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-stone-900 text-base">Grand Total</span>
                    <span className="font-black text-stone-900 text-xl">
                      {formatPrice(grandTotal || cartItems.reduce((acc, item) => acc + (item.totalPrice ?? item.unitPrice * item.quantity), 0))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5">
                <Button
                  asChild
                  variant="primary"
                  size="lg"
                  className="w-full rounded-xl font-bold"
                  aria-label="Proceed to checkout"
                >
                  <Link href="/orders/checkout">
                    Checkout <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-stone-500 rounded-xl"
                >
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
