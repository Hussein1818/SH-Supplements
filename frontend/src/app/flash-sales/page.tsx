"use client";

import { useEffect, useState } from "react";
import { api } from "@/src/components/auth/axiosInstance";
import { toast } from "sonner";
import { Zap, Timer, AlertCircle, ShoppingCart, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { useCartStore } from "@/src/components/store/cartStore";
import { formatPrice, normalizeImageUrl } from "@/src/lib/utils";

interface FlashSaleProduct {
  id: string;
  name: string;
  originalPrice: number;
  discountPrice: number;
  savingsPercentage: number;
  stockQuantity: number;
  expiryDate: string;
  imageUrl: string;
}

export default function FlashSalesPage() {
  const [products, setProducts] = useState<FlashSaleProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        const response = await api.get("/Products/flash-sales");
        setProducts(response.data || []);
      } catch (error) {
        toast.error("Failed to load flash sales.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashSales();
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = async (product: FlashSaleProduct) => {
    if (product.stockQuantity <= 0) return;
    const activePrice = product.discountPrice > 0 ? product.discountPrice : product.originalPrice;
    addItem({
      productId: String(product.id),
      productName: product.name,
      unitPrice: activePrice,
      quantity: 1,
      productImageUrl: product.imageUrl || "",
    });
    try {
      await api.post("/Carts/add", { productId: product.id, quantity: 1 });
      await useCartStore.getState().fetchCart();
      toast.success(`${product.name} added to cart!`);
    } catch {
      toast.error("Failed to sync cart with server");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8" dir="ltr">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
            <Zap className="w-10 h-10 text-red-500 fill-red-500" />
            Flash Sales
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Massive discounts on near-expiry products. Grab them before they're
            gone!
          </p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-red-500" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <Timer className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900">
            No Flash Sales Right Now
          </h3>
          <p className="text-gray-500 mt-2">
            Check back later for new near-expiry deals.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group overflow-hidden border-gray-200 hover:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <div className="relative aspect-square bg-gray-100 p-6 flex items-center justify-center overflow-hidden">
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full z-10 shadow-sm flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-white" />
                  {product.savingsPercentage.toFixed(0)}% OFF
                </div>

                <img
                  src={normalizeImageUrl(product.imageUrl) || "/placeholder.png"}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <CardContent className="p-5 space-y-4">
                <h3 className="font-bold text-gray-900 line-clamp-2 min-h-[40px] leading-tight">
                  {product.name}
                </h3>

                <div className="flex items-end gap-2">
                  <span className="text-2xl font-black text-red-600">
                    {formatPrice(product.discountPrice)}
                  </span>
                  <span className="text-sm font-semibold text-gray-400 line-through mb-1">
                    {formatPrice(product.originalPrice)}
                  </span>
                </div>

                <div className="space-y-2 bg-red-50 p-3 rounded-xl border border-red-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-800">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    Expires: {formatDate(product.expiryDate)}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-700">
                    <Timer className="w-4 h-4 text-orange-500" />
                    Only {product.stockQuantity} left in stock!
                  </div>
                </div>

                <Button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stockQuantity <= 0}
                  className="w-full h-11 bg-gray-900 hover:bg-red-600 text-white font-bold transition-colors"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {product.stockQuantity > 0 ? "Add to Cart" : "Out of Stock"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
