"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Clock,
  ShoppingCart,
  Loader2,
  Truck,
  ShieldCheck,
  Dumbbell,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { useEffect, useState } from "react";
import { api } from "@/src/components/auth/axiosInstance";
import { toast } from "sonner";
import { ProductCard } from "@/src/components/products/ProductCard";

// --- Interfaces ---
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

interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export default function Home() {
  const [flashSales, setFlashSales] = useState<FlashSaleProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoading(true);

        api
          .get("/Products/flash-sales")
          .then((res) => {
            setFlashSales(res.data?.slice(0, 4) || []);
          })
          .catch(() => console.warn("No flash sales found."));

        api
          .get("/Categories")
          .then((res) => {
            setCategories(res.data?.slice(0, 3) || []);
          })
          .catch(() => console.warn("No categories found."));

        api
          .get("/Products", { params: { pageNumber: 1, pageSize: 8 } })
          .then((res) => {
            setFeaturedProducts(res.data || []);
          })
          .catch(() => console.warn("No products found."));
      } catch (error) {
        toast.error("Failed to load some home page data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const handleAddToCart = (productName: string) => {
    toast.success(`${productName} added to cart!`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex justify-center items-center">
        <Loader2 className="w-12 h-12 text-[#FF6600] animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#F9F9F9] text-gray-900 font-sans antialiased"
      dir="ltr"
    >
      {/* 1. Hero Section */}
      <header className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-[#0044CC] rounded-3xl overflow-hidden min-h-[400px] flex items-center border border-gray-100 shadow-lg">
          <div
            className="absolute inset-0 z-0 opacity-40 bg-cover bg-center mix-blend-overlay"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&q=80')`,
            }}
          />

          <div className="relative z-10 max-w-xl p-8 md:p-12 space-y-5">
            <Badge className="bg-[#FF6600] text-white hover:bg-[#FF6600] font-bold px-3 py-1 text-xs uppercase tracking-wider">
              Premium Quality
            </Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Fuel Your Ambition.
              <br />
              <span className="text-[#FF6600]">Precision Engineered.</span>
            </h1>
            <p className="text-gray-200 text-sm md:text-base leading-relaxed opacity-90">
              Discover the next generation of performance nutrition. Formulated
              with clinical precision to support your peak potential.
            </p>
            <div className="flex items-center gap-3 pt-4">
              <Link href="/products">
                <Button className="bg-[#FF6600] hover:bg-[#E05500] text-white px-8 h-12 font-bold rounded-xl text-lg">
                  Shop Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Features Section (Static to fill the page) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center gap-4 border border-gray-100">
            <div className="bg-orange-50 p-3 rounded-xl text-[#FF6600]">
              <Truck className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Fast Delivery</h4>
              <p className="text-xs text-gray-500">Nationwide shipping</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center gap-4 border border-gray-100">
            <div className="bg-blue-50 p-3 rounded-xl text-[#0044CC]">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">100% Authentic</h4>
              <p className="text-xs text-gray-500">
                Verified original products
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center gap-4 border border-gray-100">
            <div className="bg-green-50 p-3 rounded-xl text-green-600">
              <Dumbbell className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Top Brands</h4>
              <p className="text-xs text-gray-500">Only the best supplements</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Shop by Category */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 mt-16 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">
                Shop by Category
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Targeted solutions for specific goals.
              </p>
            </div>
            <Link
              href="/categories"
              className="text-sm font-bold text-[#0044CC] hover:underline flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className={`${
                  index === 0
                    ? "md:col-span-2 min-h-[280px]"
                    : "min-h-[200px] md:min-h-[280px]"
                } relative bg-gray-900 rounded-2xl overflow-hidden group border border-gray-100 shadow-sm flex items-end block cursor-pointer transition-all hover:shadow-md`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-700"
                  style={{ backgroundImage: `url('${category.imageUrl}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="relative z-10 p-6 w-full flex justify-between items-end">
                  <div className="text-white">
                    <h3 className="text-xl font-black mb-1">{category.name}</h3>
                    <p className="text-xs text-gray-300 line-clamp-2 max-w-[80%]">
                      {category.description}
                    </p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm group-hover:bg-[#FF6600] text-white rounded-full h-10 w-10 flex items-center justify-center transition-colors">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. Featured Products (New Section) */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 mt-16 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">
                Featured Products
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Our most popular picks for you.
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm font-bold text-[#0044CC] hover:underline flex items-center gap-1"
            >
              Browse Catalog <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Near-Expiry Clearance (Flash Sales) */}
      {flashSales.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 mt-16">
          <div className="bg-gradient-to-br from-red-50 to-[#FAF6F0] border border-red-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Clock className="w-64 h-64 text-red-900" />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-red-600 flex items-center gap-2">
                  <Clock className="h-6 w-6" /> Flash Sales & Clearance
                </h2>
                <p className="text-sm text-gray-600 mt-1 font-medium">
                  High-performance supplements. Expiring soon. Huge discounts!
                </p>
              </div>
              <Link
                href="/flash-sales"
                className="text-sm font-bold text-red-600 hover:text-red-800 hover:underline bg-white px-4 py-2 rounded-full shadow-sm border border-red-100"
              >
                View All Deals →
              </Link>
            </div>

            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4">
              {flashSales.map((product) => (
                <Card
                  key={product.id}
                  className="bg-white border-transparent shadow-sm rounded-2xl overflow-hidden flex flex-col justify-between group hover:shadow-md hover:border-red-200 transition-all"
                >
                  <CardContent className="p-4 relative flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <Badge className="absolute top-3 left-3 bg-red-600 hover:bg-red-700 text-white font-black text-[11px] px-2 py-1 z-10 rounded-md shadow-sm">
                        -{product.savingsPercentage.toFixed(0)}%
                      </Badge>
                      <div className="w-full h-36 bg-gray-50/50 rounded-xl overflow-hidden relative mb-3 flex items-center justify-center p-4">
                        <img
                          src={product.imageUrl || "/placeholder.png"}
                          alt={product.name}
                          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-2 min-h-[40px] leading-snug">
                        {product.name}
                      </h4>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-gray-50">
                      <div className="flex items-end gap-2">
                        <span className="text-lg font-black text-red-600">
                          ${product.discountPrice.toFixed(2)}
                        </span>
                        <span className="text-xs font-semibold text-gray-400 line-through mb-1">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md w-max">
                        <Clock className="w-3 h-3" /> Exp:{" "}
                        {formatDate(product.expiryDate)}
                      </div>
                      <Button
                        onClick={() => handleAddToCart(product.name)}
                        disabled={product.stockQuantity <= 0}
                        className="w-full bg-gray-900 hover:bg-red-600 text-white text-xs py-2 h-10 rounded-xl font-bold transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {product.stockQuantity > 0 ? "Add to Cart" : "Sold Out"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
