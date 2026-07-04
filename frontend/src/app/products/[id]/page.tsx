"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/src/components/auth/axiosInstance";
import { Button } from "@/src/components/ui/button";
import {
  ShoppingCart,
  ArrowLeft,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/src/components/store/cartStore";
import { toast } from "sonner";
import { ProductCard } from "@/src/components/products/ProductCard";

interface ProductImage {
  id: string;
  imageUrl: string;
  isMainImage: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  stockQuantity: number;
  flavor: string;
  servings: number;
  ingredients: string;
  warnings: string;
  expiryDate: string;
  category: {
    id: string;
    name: string;
  };
  brand: {
    id: string;
    name: string;
    countryOfOrigin: string;
  };
  images: ProductImage[];
}

export default function SingleProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = async () => {
    if (!product) return;

    const activePrice = product.discountPrice
      ? product.discountPrice
      : product.price;

    const mainImg =
      product.images?.find((img) => img.isMainImage)?.imageUrl || "";

    addItem({
      id: product.id,
      name: product.name,
      price: activePrice,
      quantity: 1,
      imageUrl: mainImg,
    });

    try {
      await api.post(`/Carts/add`, {
        productId: product.id,
        quantity: 1,
      });
      toast.success("Added to Cart!");
    } catch (error) {
      toast.error("Failed to sync with server");
    }
  };

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      try {
        const response = await api.get(`/Products/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.error("Failed to load product details");
      } finally {
        setIsLoading(false);
      }
    }

    async function fetchAlternatives() {
      try {
        const response = await api.get(`/Products/${id}/alternatives`);
        setAlternatives(response.data || []);
      } catch (err) {
        console.error("Failed to load alternatives");
      }
    }

    fetchProduct();
    fetchAlternatives();
  }, [id]);

  if (isLoading)
    return (
      <div className="p-8 text-center text-gray-500 min-h-[50vh] flex items-center justify-center">
        Loading details...
      </div>
    );

  if (!product)
    return (
      <div className="p-8 text-center text-red-500 min-h-[50vh] flex items-center justify-center">
        Error loading details
      </div>
    );

  const displayImage =
    product.images?.find((img) => img.isMainImage)?.imageUrl ||
    product.images?.[0]?.imageUrl;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-12" dir="ltr">
      <div className="space-y-8">
        <Link
          href="/products"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image Section */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-8 flex flex-col items-center justify-center min-h-[400px] relative">
            {product.discountPrice && (
              <div className="absolute top-6 left-6 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg z-10">
                Sale
              </div>
            )}
            {displayImage ? (
              <img
                src={displayImage}
                alt={product.name}
                className="max-w-full h-auto object-contain mix-blend-multiply"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="flex flex-col justify-center space-y-6">
            {/* Brand & Category Tags */}
            <div className="flex items-center gap-3 text-sm font-medium">
              <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                {product.brand?.name} ({product.brand?.countryOfOrigin})
              </span>
              <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                {product.category?.name}
              </span>
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                {product.name}
              </h1>

              <div className="mt-4 flex items-end gap-4">
                {product.discountPrice ? (
                  <>
                    <span className="text-4xl font-extrabold text-gray-900">
                      ${product.discountPrice}
                    </span>
                    <span className="text-xl font-medium text-gray-400 line-through mb-1">
                      ${product.price}
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-extrabold text-gray-900">
                    ${product.price}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
              <div>
                <p className="text-sm text-gray-500">Flavor</p>
                <p className="font-semibold text-gray-900">
                  {product.flavor || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Servings</p>
                <p className="font-semibold text-gray-900">
                  {product.servings || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Stock Status</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {product.stockQuantity > 0 ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="font-semibold text-green-600">
                        In Stock ({product.stockQuantity})
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="font-semibold text-red-600">
                        Out of Stock
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="text-gray-600 leading-relaxed">
              <p>{product.description}</p>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <Button
                size="lg"
                className="w-full md:w-2/3 rounded-xl flex items-center gap-2 h-14 text-lg bg-[#0044CC] hover:bg-blue-700"
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0}
              >
                <ShoppingCart className="w-6 h-6" />
                {product.stockQuantity > 0 ? "Add to Cart" : "Out of Stock"}
              </Button>
            </div>

            {/* Ingredients & Warnings Cards */}
            <div className="space-y-3 pt-6">
              {product.ingredients && (
                <div className="bg-gray-50 p-4 rounded-2xl flex gap-3">
                  <Info className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">
                      Ingredients
                    </h4>
                    <p className="text-sm text-gray-600">
                      {product.ingredients}
                    </p>
                  </div>
                </div>
              )}

              {product.warnings && (
                <div className="bg-red-50 p-4 rounded-2xl flex gap-3 border border-red-100">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-red-900 text-sm mb-1">
                      Warnings
                    </h4>
                    <p className="text-sm text-red-700">{product.warnings}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {alternatives.length > 0 && (
        <div className="pt-12 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="w-6 h-6 text-[#0044CC]" />
            <h2 className="text-2xl font-black text-gray-900">
              Recommended Alternatives
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {alternatives.map((alt) => (
              <ProductCard key={alt.id} product={alt} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
