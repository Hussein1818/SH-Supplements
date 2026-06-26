"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Mock Data أولية لمنتجات داخل السلة
const INITIAL_CART = [
  {
    id: 1,
    name: "Whey Protein Isolate - Vanilla",
    brand: "Optimum Stack",
    price: 29.99,
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&q=80",
    quantity: 1,
  },
  {
    id: 3,
    name: "Liquid BCAA - Blue Razz",
    brand: "Recovery Core",
    price: 21.0,
    image: "https://images.unsplash.com/photo-1606813902869-1f3e5c8b6f2d?w=300&q=80",
    quantity: 2,
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(INITIAL_CART);

  // تحديث الكمية (زيادة أو نقصان)
  const updateQuantity = (id: number, increment: boolean) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = increment ? item.quantity + 1 : item.quantity - 1;
          return { ...item, quantity: newQty < 1 ? 1 : newQty };
        }
        return item;
      }),
    );
  };

  // حذف منتج من السلة
  const removeItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // حساب الحسابات المالية
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shipping = subtotal > 0 ? 5.0 : 0;
  const total = subtotal + shipping;

  return (
    <div className="space-y-8" dir="ltr">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-[#0044CC]" /> Your Shopping Cart
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review your items and proceed to secure checkout.
        </p>
      </div>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side: Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card
                key={item.id}
                className="bg-white border-gray-100 shadow-sm rounded-xl overflow-hidden group"
              >
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  {/* Product Image & Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-20 w-20 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden relative shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-1.5 mix-blend-multiply"
                      />
                    </div>
                    <div className="space-y-0.5 max-w-sm">
                      <span className="text-[10px] text-gray-400 block font-medium uppercase tracking-wider">
                        {item.brand}
                      </span>
                      <h3 className="text-xs font-bold text-gray-900 line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs font-extrabold text-[#0044CC] pt-1">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Actions & Delete */}
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="flex items-center border border-gray-200 rounded-md bg-gray-50 h-8">
                      <button
                        title="Decrease Quantity"
                        onClick={() => updateQuantity(item.id, false)}
                        className="px-2 text-gray-500 hover:text-gray-900 transition-colors h-full flex items-center"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-gray-800 min-w-[24px] text-center select-none">
                        {item.quantity}
                      </span>
                      <button
                        title="Increase Quantity"
                        onClick={() => updateQuantity(item.id, true)}
                        className="px-2 text-gray-500 hover:text-gray-900 transition-colors h-full flex items-center"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Remove Item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Right Side: Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-white border-gray-100 shadow-sm rounded-xl sticky top-24">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-base font-bold text-gray-900">
                  Order Summary
                </h2>

                <div className="space-y-2 text-xs font-medium text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-gray-900 font-bold">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span className="text-gray-900 font-bold">
                      ${shipping.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Separator className="bg-gray-100" />

                <div className="flex justify-between text-sm font-black text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-[#0044CC] text-base">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <div className="pt-2">
                  <Button className="w-full bg-[#FF6600] hover:bg-[#E05500] text-white font-semibold text-xs py-2.5 rounded-md flex items-center justify-center gap-1.5 shadow-sm transition-all">
                    Proceed to Checkout <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Secure Badge */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-medium pt-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />{" "}
                  Secure SSL Encrypted Checkout
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 bg-white border border-gray-100 rounded-xl space-y-3">
          <span className="text-4xl">🛒</span>
          <h3 className="text-sm font-bold text-gray-900 pt-2">
            Your Cart is Empty
          </h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
            Looks like you haven&apos;t added any premium supplements to your
            stack yet.
          </p>
          <div className="pt-2">
            <Link href="/categories">
              <Button className="bg-[#0044CC] hover:bg-[#0033AA] text-white text-xs font-semibold px-5 h-9 rounded-md">
                Browse Catalog
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
