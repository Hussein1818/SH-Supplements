"use client";

import { useCheckoutStore } from "@/src/components/store/checkoutStore";
import { Package } from "lucide-react";

export const OrderSummary = () => {
  const { items, subtotal, shippingFee, total } = useCheckoutStore();

  if (!items || items.length === 0) {
    return (
      <div className="bg-gray-50 p-8 rounded-3xl text-center space-y-4 border border-gray-100">
        <Package className="w-12 h-12 mx-auto text-gray-300" />
        <p className="font-bold text-gray-500">Your order summary is empty.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-3xl space-y-6 border border-gray-100">
      <h2 className="font-black text-xl border-b border-gray-200 pb-4">
        Order Summary
      </h2>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex gap-4 items-center bg-white p-3 rounded-xl border border-gray-100"
          >
            <img
              src={item.productImageUrl || "/placeholder.png"}
              alt={item.productName}
              className="w-16 h-16 object-cover rounded-lg border border-gray-100"
            />
            <div className="flex-1">
              <p className="font-bold text-sm text-gray-900 line-clamp-2">
                {item.productName}
              </p>
              <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
            </div>
            <p className="font-black text-sm text-gray-900">
              ${(item.unitPrice * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600 font-medium">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 font-medium">
          <span>Shipping</span>
          <span>
            {shippingFee === 0 ? "Free" : `$${shippingFee.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between font-black text-xl pt-4 border-t border-gray-200 text-[#0044CC]">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
