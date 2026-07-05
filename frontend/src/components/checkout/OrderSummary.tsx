"use client";

import { useState } from "react";
import Image from "next/image";
import { useCheckoutStore } from "@/src/components/store/checkoutStore";
import { Package } from "lucide-react";
import { formatPrice, normalizeImageUrl } from "@/src/lib/utils";

const ProductThumb = ({ src, alt }: { src: string; alt: string }) => {
  const [error, setError] = useState(false);
  const normalizedSrc = normalizeImageUrl(src);
  if (!normalizedSrc || error) {
    return (
      <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
        <Package className="w-6 h-6 text-gray-400" />
      </div>
    );
  }
  return (
    <div className="relative w-16 h-16 rounded-lg border border-gray-100 overflow-hidden bg-white shrink-0">
      <Image
        src={normalizedSrc}
        alt={alt || "Product"}
        fill
        sizes="64px"
        className="object-contain p-1"
        onError={() => setError(true)}
      />
    </div>
  );
};

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
      <h2 className="font-black text-xl border-b border-gray-200 pb-4 text-stone-900">
        Order Summary
      </h2>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {items.map((item, idx) => (
          <div
            key={item.productId || `item-${idx}`}
            className="flex gap-4 items-center bg-white p-3 rounded-xl border border-gray-100"
          >
            <ProductThumb
              src={item.productImageUrl || ""}
              alt={item.productName || "Product image"}
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-gray-900 truncate">
                {item.productName || "Product"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity || 1}</p>
            </div>
            <p className="font-black text-sm text-gray-900 shrink-0">
              {formatPrice(
                (item.totalPrice !== undefined && item.totalPrice !== null)
                  ? item.totalPrice
                  : (item.unitPrice || 0) * (item.quantity || 1)
              )}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600 font-medium">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal || 0)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 font-medium">
          <span>Shipping</span>
          <span>
            {shippingFee === 0 ? "Free" : formatPrice(shippingFee || 0)}
          </span>
        </div>
        <div className="flex justify-between font-black text-xl pt-4 border-t border-gray-200 text-emerald-600">
          <span>Total</span>
          <span>{formatPrice(total || 0)}</span>
        </div>
      </div>
    </div>
  );
};

