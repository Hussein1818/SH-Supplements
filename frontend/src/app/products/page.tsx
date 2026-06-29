"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/src/components/auth/axiosInstance";
import { Button } from "@/src/components/ui/button";
import { ShoppingBag, ArrowRight, Star, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/src/components/store/cartStore";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  price: number;
  discountPrice: number;
  mainImageUrl: string;
  categoryName: string;
  brandName: string;
  goal: number;
  averageRating: number;
}
const BASE_URL = "https://sh-supplements.runasp.net";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = async (product: Product) => {
    const activePrice =
      product.discountPrice > 0 && product.discountPrice < product.price
        ? product.discountPrice
        : product.price;
    addItem({
      id: product.id,
      name: product.name,
      price: activePrice,
      quantity: 1,
      imageUrl: product.mainImageUrl,
    });

    try {
      await api.post("/carts/add", {
        productId: product.id,
        quantity: 1,
      });
      toast.success("Added to Cart");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await api.get(`${BASE_URL}/api/Products`);
        setProducts(response.data);
      } catch (error) {
        setError("Error fetching products");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8" dir="ltr">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-8 h-8" />
          All Supplements
        </h1>
        <p className="text-gray-500 mt-2">Browse our full catalog.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 relative"
          >
            {product.discountPrice > 0 &&
              product.discountPrice < product.price && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
                  Sale
                </div>
              )}

            <div className="h-56 bg-gray-50 flex items-center justify-center p-4 relative">
              {product.mainImageUrl ? (
                <img
                  src={product.mainImageUrl}
                  alt={product.name}
                  className="max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <ShoppingBag className="w-12 h-12 text-gray-200" />
              )}
            </div>

            <div className="p-5 flex flex-col flex-grow space-y-2">
              <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                <span>{product.brandName}</span>
                <span className="bg-gray-100 px-2 py-1 rounded-md">
                  {product.categoryName}
                </span>
              </div>

              <h2 className="font-bold text-gray-900 line-clamp-2 min-h-[3rem] mt-1">
                {product.name}
              </h2>

              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold text-gray-700">
                  {product.averageRating > 0
                    ? product.averageRating.toFixed(1)
                    : "New"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                <div className="flex flex-col">
                  {product.discountPrice > 0 &&
                  product.discountPrice < product.price ? (
                    <>
                      <span className="text-xl font-extrabold text-gray-900">
                        ${product.discountPrice}
                      </span>
                      <span className="text-sm font-medium text-gray-400 line-through">
                        ${product.price}
                      </span>
                    </>
                  ) : (
                    <span className="text-xl font-extrabold text-gray-900">
                      ${product.price}
                    </span>
                  )}
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleAddToCart(product)}
                    className="rounded-xl border-gray-200 hover:bg-gray-50"
                  >
                    <ShoppingCart className="w-4 h-4 text-gray-700" />
                  </Button>

                  <Button
                    asChild
                    variant="default"
                    size="sm"
                    className="rounded-xl font-semibold px-4"
                  >
                    <Link href={`/products/${product.id}`}>Details</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
