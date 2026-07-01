"use client";

import Link from "next/link";
import { ShoppingCart, Eye, Bell, BellCheck } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useCartStore } from "@/src/components/store/cartStore";
import { toast } from "sonner";
import { api } from "../auth/axiosInstance";
import { useState } from "react";

export const ProductCard = ({ product }: { product: any }) => {
  const addItem = useCartStore((state) => state.addItem);
  const [isNotified, setIsNotified] = useState(false);

  const handleAddToCart = async () => {
    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.mainImageUrl,
      });
      await api.post("/Carts/add", {
        productId: product.id,
        quantity: 1,
      });
      toast.success("Added to cart successfully!");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const handleNotify = async () => {
    try {
      await api.post(`/Products/${product.id}/notify-restock`);
      setIsNotified(true);
      toast.success("Notification set!");
    } catch {
      toast.error("Failed to notify");
    }
  };
  return (
    <div className="group relative bg-white border border-gray-100 rounded-3xl p-5 transition-all hover:shadow-xl hover:shadow-blue-50/50">
      <div className="aspect-square bg-gray-50 rounded-2xl mb-4 overflow-hidden flex items-center justify-center">
        <img
          src={product.mainImageUrl}
          alt={product.name}
          className="h-40 object-contain group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      <h3 className="font-bold text-gray-900 line-clamp-1">{product.name}</h3>
      <p className="text-[#0044CC] font-black text-lg mt-1">${product.price}</p>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <Button
          variant="secondary"
          className="rounded-xl font-bold bg-gray-100"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-4 h-4 mr-2" /> Add
        </Button>

        <Button
          asChild
          variant="default"
          className="rounded-xl font-bold bg-[#0044CC]"
        >
          <Link href={`/products/${product.id}`}>
            <Eye className="w-4 h-4 mr-2" /> View
          </Link>
        </Button>
      </div>
    </div>
  );
};
