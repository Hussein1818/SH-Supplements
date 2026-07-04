"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/src/components/auth/axiosInstance";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  ShoppingBag,
  Star,
  ShoppingCart,
  Zap,
  Sparkles,
  Search,
  Bell,
  BellCheck,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { useCartStore } from "@/src/components/store/cartStore";
import { toast } from "sonner";
import { useAuthStore } from "@/src/components/store/authStore";

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
  inStock: boolean;
}

export default function ProductsPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const addItem = useCartStore((state) => state.addItem);

  const [products, setProducts] = useState<Product[]>([]);
  const [flashSales, setFlashSales] = useState<Product[]>([]);
  const [personalizedProducts, setPersonalizedProducts] = useState<Product[]>(
    [],
  );

  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const PAGE_SIZE = 8; 
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [notifiedProductIds, setNotifiedProductIds] = useState<number[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        setIsLoading(true);
        const [allRes, flashRes, personalRes] = await Promise.all([
          api.get(`/Products?pageNumber=1&pageSize=${PAGE_SIZE}`),
          api.get("/Products/flash-sales").catch(() => ({ data: [] })),
          api.get("/Products/personalized-for-me").catch(() => ({ data: [] })),
        ]);

        setProducts(allRes.data);
        setFlashSales(flashRes.data);
        setPersonalizedProducts(personalRes.data);

        if (allRes.data.length < PAGE_SIZE) {
          setHasMore(false);
        }
      } catch (error) {
        setError("Failed to load products catalog.");
      } finally {
        setIsLoading(false);
      }
    }

    if (isClient && accessToken) {
      fetchInitialData();
    }
  }, [isClient, accessToken]);

  const handleLoadMore = async () => {
    if (isMoreLoading || !hasMore) return;

    setIsMoreLoading(true);
    const nextPage = pageNumber + 1;

    try {
      const response = await api.get(
        `/Products?pageNumber=${nextPage}&pageSize=${PAGE_SIZE}`,
      );

      if (response.data.length === 0) {
        setHasMore(false);
        toast.info("You have reached the end of the catalog.");
      } else {
        setProducts((prev) => [...prev, ...response.data]);
        setPageNumber(nextPage);

        if (response.data.length < PAGE_SIZE) {
          setHasMore(false);
        }
      }
    } catch (error) {
      toast.error("Failed to load more products.");
    } finally {
      setIsMoreLoading(false);
    }
  };

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
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      toast.error("Failed to sync cart with server");
    }
  };

  const handleNotifyRestock = async (productId: number) => {
    try {
      await api.post(`/Products/${productId}/notify-restock`);
      setNotifiedProductIds((prev) => [...prev, productId]);
      toast.success(
        "We will notify you as soon as this product is back in stock!",
      );
    } catch (error) {
      toast.error("Failed to register restock notification");
    }
  };

  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.categoryName))),
  ];
  const brands = [
    "All",
    ...Array.from(new Set(products.map((p) => p.brandName))),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.categoryName === selectedCategory;
    const matchesBrand =
      selectedBrand === "All" || product.brandName === selectedBrand;
    return matchesSearch && matchesCategory && matchesBrand;
  });

  if (!accessToken || !isClient) return null;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0044CC]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-rose-500 font-bold">{error}</div>
    );
  }

  const ProductCard = ({
    product,
    isRecommended = false,
  }: {
    product: Product;
    isRecommended?: boolean;
  }) => {
    const isNotified = notifiedProductIds.includes(product.id);
    const hasDiscount =
      product.discountPrice > 0 && product.discountPrice < product.price;

    return (
      <div className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 relative">
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md z-10 uppercase">
            Sale
          </div>
        )}
        {isRecommended && (
          <div className="absolute top-3 right-3 bg-[#0044CC] text-white text-[10px] font-bold px-2 py-1 rounded-md z-10 flex items-center gap-1 uppercase">
            <Sparkles className="w-3 h-3" /> For You
          </div>
        )}

        <div className="h-48 bg-gray-50/50 flex items-center justify-center p-4 relative">
          {product.mainImageUrl ? (
            <img
              src={product.mainImageUrl}
              alt={product.name}
              className="max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <ShoppingBag className="w-10 h-10 text-gray-200" />
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow space-y-2">
          <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <span>{product.brandName}</span>
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {product.categoryName}
            </span>
          </div>

          <h3 className="font-bold text-gray-900 text-sm line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold text-gray-600">
              {product.averageRating > 0
                ? product.averageRating.toFixed(1)
                : "New"}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
            <div className="flex flex-col">
              {hasDiscount ? (
                <>
                  <span className="text-base font-black text-gray-900">
                    ${product.discountPrice}
                  </span>
                  <span className="text-xs font-medium text-gray-400 line-through">
                    ${product.price}
                  </span>
                </>
              ) : (
                <span className="text-base font-black text-gray-900">
                  ${product.price}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {product.inStock ? (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleAddToCart(product)}
                  className="rounded-xl border-gray-200 hover:bg-blue-50 hover:border-[#0044CC] text-gray-700 hover:text-[#0044CC] h-9 w-9"
                >
                  <ShoppingCart className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant={isNotified ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => !isNotified && handleNotifyRestock(product.id)}
                  className={`rounded-xl text-[10px] font-bold px-2.5 h-9 flex items-center gap-1 ${
                    isNotified
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "text-rose-600 border-rose-200 hover:bg-rose-50"
                  }`}
                >
                  {isNotified ? (
                    <>
                      <BellCheck className="w-3 h-3" /> Notified
                    </>
                  ) : (
                    <>
                      <Bell className="w-3 h-3" /> Notify Me
                    </>
                  )}
                </Button>
              )}
              <Button
                asChild
                variant="default"
                size="sm"
                className="rounded-xl font-bold px-3 h-9 text-xs bg-[#0044CC] hover:bg-[#0033AA] text-white"
              >
                <Link href={`/products/${product.id}`}>Details</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-10" dir="ltr">
      {/* 1. FLASH SALES SECTION */}
      {flashSales.length > 0 && (
        <div className="space-y-4 bg-gradient-to-r from-amber-500/5 to-red-500/5 p-6 rounded-2xl border border-orange-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-500 rounded-lg text-white">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                Flash Sales
              </h2>
              <p className="text-xs text-gray-500">
                Limited time offers. Grab them before they vanish!
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {flashSales.slice(0, 4).map((product) => (
              <ProductCard key={`flash-${product.id}`} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* 2. PERSONALIZED RECOMMENDATIONS */}
      {personalizedProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#0044CC] rounded-lg text-white">
              <Sparkles className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                Personalized For Your Goal
              </h2>
              <p className="text-xs text-gray-500">
                Supplements tailored specifically to optimize your current
                training and physical stats.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {personalizedProducts.slice(0, 4).map((product) => (
              <ProductCard
                key={`personal-${product.id}`}
                product={product}
                isRecommended={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* 3. MAIN CATALOG WITH FILTERS */}
      <div className="space-y-6 pt-4 border-t border-gray-100">
        {/* Catalog Header & Filters Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div>
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#0044CC]" /> Full Catalog
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Explore all available premium supplements.
            </p>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search catalog..."
                className="pl-9 w-52 bg-gray-50 border-none text-xs h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <select
              className="h-9 rounded-md bg-gray-50 px-2.5 text-xs focus:outline-none border-none text-gray-600 font-medium"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories
                .filter((c) => c !== "All")
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>

            {/* Brand Filter */}
            <select
              className="h-9 rounded-md bg-gray-50 px-2.5 text-xs focus:outline-none border-none text-gray-600 font-medium"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="All">All Brands</option>
              {brands
                .filter((b) => b !== "All")
                .map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Main Grid Content */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 border border-dashed border-gray-100 rounded-2xl">
            <ShoppingBag className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-medium">
              No supplements match your active filter search.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={`catalog-${product.id}`} product={product} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center pt-8">
                <Button
                  onClick={handleLoadMore}
                  disabled={isMoreLoading}
                  variant="outline"
                  className="rounded-xl font-bold text-xs px-6 py-5 border-gray-200 hover:border-[#0044CC] hover:text-[#0044CC] transition-colors flex items-center gap-2"
                >
                  {isMoreLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Load More Products <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
