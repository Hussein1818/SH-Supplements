"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowRight,
  Star,
  ShoppingCart,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { api } from "@/src/components/auth/axiosInstance";
import { toast } from "sonner";
import { useCartStore } from "@/src/components/store/cartStore";

interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice: number | null;
  mainImageUrl: string;
  categoryName: string;
  brandName: string;
  averageRating: number;
}

export default function CategoryProductsPage() {
  const { id } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = async (product: Product) => {
    const activePrice = product.discountPrice
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
      await api.post(`Carts/add`, {
        productId: product.id,
        quantity: 1,
      });
      toast.success("Added to Cart");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  useEffect(() => {
    async function fetchCategoryProducts() {
      try {
        const response = await api.get(`/Products`, {
          params: { categoryId: id },
        });
        setProducts(
          Array.isArray(response.data)
            ? response.data
            : response.data.items || [],
        );
      } catch (error) {
        toast.error("failed to load products for this category");
      } finally {
        setIsLoading(false);
      }
    }
    if (id) fetchCategoryProducts();
  }, [id]);
  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500 min-h-[50vh] flex items-center justify-center">
        Loading products...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8" dir="ltr">
      <Link
        href="/categories"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Categories
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-8 h-8" />
          Category Products
        </h1>
        <p className="text-gray-500 mt-2">
          {products.length} {products.length === 1 ? "product" : "products"}{" "}
          found.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          no products in this category
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 relative"
            >
              {product.discountPrice && (
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
                    {product.discountPrice ? (
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
      )}
    </div>
  );
}
