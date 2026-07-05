"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/src/components/auth/axiosInstance";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import {
  ShoppingBag,
  Star,
  ShoppingCart,
  Zap,
  Sparkles,
  Search,
  Bell,
  BellCheck,
  ChevronDown,
  SlidersHorizontal,
  Package,
} from "lucide-react";
import { useCartStore } from "@/src/components/store/cartStore";
import { toast } from "sonner";
import { useAuthStore } from "@/src/components/store/authStore";
import { cn } from "@/src/lib/utils";

// ─── Types (unchanged) ─────────────────────────────────────────────────────
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

// ─── Skeleton Card ─────────────────────────────────────────────────────────
function SkeletonProductCard() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
      <div className="skeleton aspect-square" />
      <div className="p-4 space-y-2.5">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
          <div className="skeleton h-5 w-16 rounded" />
          <div className="skeleton h-8 w-8 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const addItem     = useCartStore((state) => state.addItem);

  const [products,              setProducts]              = useState<Product[]>([]);
  const [flashSales,            setFlashSales]            = useState<Product[]>([]);
  const [personalizedProducts,  setPersonalizedProducts]  = useState<Product[]>([]);

  const [pageNumber,         setPageNumber]         = useState(1);
  const [hasMore,            setHasMore]            = useState(true);
  const [isMoreLoading,      setIsMoreLoading]      = useState(false);
  const PAGE_SIZE = 8;

  const [searchQuery,       setSearchQuery]       = useState("");
  const [selectedCategory,  setSelectedCategory]  = useState("All");
  const [selectedBrand,     setSelectedBrand]     = useState("All");
  const [notifiedProductIds,setNotifiedProductIds]= useState<number[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isClient,  setIsClient]  = useState(false);
  const [error,     setError]     = useState("");

  useEffect(() => { setIsClient(true); }, []);

  // ── Data fetching (logic unchanged) ──────────────────────────────────────
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
        if (allRes.data.length < PAGE_SIZE) setHasMore(false);
      } catch {
        setError("Failed to load products catalog.");
      } finally {
        setIsLoading(false);
      }
    }
    if (isClient && accessToken) fetchInitialData();
  }, [isClient, accessToken]);

  const handleLoadMore = async () => {
    if (isMoreLoading || !hasMore) return;
    setIsMoreLoading(true);
    const nextPage = pageNumber + 1;
    try {
      const response = await api.get(`/Products?pageNumber=${nextPage}&pageSize=${PAGE_SIZE}`);
      if (response.data.length === 0) {
        setHasMore(false);
        toast.info("You've reached the end of the catalog.");
      } else {
        setProducts((prev) => [...prev, ...response.data]);
        setPageNumber(nextPage);
        if (response.data.length < PAGE_SIZE) setHasMore(false);
      }
    } catch {
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
      id: String(product.id), productId: String(product.id),
      productName: product.name, unitPrice: activePrice,
      quantity: 1, productImageUrl: product.mainImageUrl,
    });
    try {
      await api.post("/carts/add", { productId: product.id, quantity: 1 });
      toast.success(`${product.name} added to cart`);
    } catch {
      toast.error("Failed to sync cart with server");
    }
  };

  const handleNotifyRestock = async (productId: number) => {
    try {
      await api.post(`/Products/${productId}/notify-restock`);
      setNotifiedProductIds((prev) => [...prev, productId]);
      toast.success("We'll notify you when it's back in stock!");
    } catch {
      toast.error("Failed to register restock notification");
    }
  };

  // ── Filter options ────────────────────────────────────────────────────────
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.categoryName)))];
  const brands     = ["All", ...Array.from(new Set(products.map((p) => p.brandName)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch   = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.categoryName === selectedCategory;
    const matchesBrand    = selectedBrand === "All" || p.brandName === selectedBrand;
    return matchesSearch && matchesCategory && matchesBrand;
  });

  if (!accessToken || !isClient) return null;

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="container-xl py-8 space-y-10" dir="ltr">
        <div className="skeleton h-32 rounded-2xl" />
        <div className="skeleton h-20 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonProductCard key={i} />)}
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="container-xl py-24 text-center" dir="ltr">
        <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Package className="h-8 w-8 text-red-400" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 mb-2">Something went wrong</h2>
        <p className="text-stone-500 text-sm">{error}</p>
      </div>
    );
  }

  // ─── Inline ProductCard for Products page (preserving all original logic) ──
  const InlineProductCard = ({
    product,
    isRecommended = false,
  }: {
    product: Product;
    isRecommended?: boolean;
  }) => {
    const isNotified = notifiedProductIds.includes(product.id);
    const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
    const discountPct = hasDiscount
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0;

    return (
      <article
        className={cn(
          "group relative flex flex-col",
          "bg-white rounded-2xl border border-stone-200",
          "shadow-[0_1px_4px_rgba(0,0,0,0.05)]",
          "hover:shadow-[0_8px_24px_rgba(0,0,0,0.09)] hover:-translate-y-0.5",
          "transition-all duration-250 ease-out overflow-hidden"
        )}
        aria-label={product.name}
      >
        {/* Image */}
        <div className="relative aspect-square bg-stone-50 overflow-hidden">
          {product.mainImageUrl ? (
            <img
              src={product.mainImageUrl}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-contain p-4 mix-blend-multiply group-hover:scale-105 transition-transform duration-400"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-stone-200" aria-hidden="true" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {hasDiscount && (
              <Badge variant="orange-solid" className="text-[10px] font-black">-{discountPct}%</Badge>
            )}
            {isRecommended && (
              <Badge variant="emerald-solid" className="text-[10px] font-black">✦ For You</Badge>
            )}
            {!product.inStock && (
              <Badge variant="stone" className="text-[10px]">Sold Out</Badge>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col flex-1 p-4 gap-2.5">
          {/* Brand / Category */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider truncate">{product.brandName}</span>
            <span className="text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full truncate max-w-[90px]">{product.categoryName}</span>
          </div>

          {/* Name */}
          <h3 className="text-sm font-semibold text-stone-900 line-clamp-2 leading-snug min-h-[2.5rem]">{product.name}</h3>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className={cn("h-3 w-3", product.averageRating > 0 ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200")} aria-hidden="true" />
            <span className="text-[11px] text-stone-400 font-medium">
              {product.averageRating > 0 ? product.averageRating.toFixed(1) : "New"}
            </span>
          </div>

          {/* Price + Action */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-stone-100">
            <div className="flex flex-col">
              <span className="text-base font-black text-stone-900">
                ${hasDiscount ? product.discountPrice : product.price}
              </span>
              {hasDiscount && (
                <span className="text-xs text-stone-400 line-through">${product.price}</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {product.inStock ? (
                <Button
                  variant="primary"
                  size="icon-sm"
                  onClick={() => handleAddToCart(product)}
                  aria-label={`Add ${product.name} to cart`}
                  className="rounded-xl"
                >
                  <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              ) : (
                <Button
                  variant={isNotified ? "outline-emerald" : "outline"}
                  size="xs"
                  onClick={() => !isNotified && handleNotifyRestock(product.id)}
                  disabled={isNotified}
                  aria-label={isNotified ? "Notification set" : `Notify me when ${product.name} restocks`}
                  className="rounded-xl"
                >
                  {isNotified ? (
                    <><BellCheck className="h-3 w-3" aria-hidden="true" /> Notified</>
                  ) : (
                    <><Bell className="h-3 w-3" aria-hidden="true" /> Notify</>
                  )}
                </Button>
              )}
              <Button asChild variant="outline" size="xs" className="rounded-xl font-semibold">
                <Link href={`/products/${product.id}`} aria-label={`View details for ${product.name}`}>Details</Link>
              </Button>
            </div>
          </div>
        </div>
      </article>
    );
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="container-xl py-8 space-y-10" dir="ltr">

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 1. FLASH SALES                                                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {flashSales.length > 0 && (
        <section aria-label="Flash sales">
          <div className="bg-stone-900 rounded-2xl p-5 md:p-6 space-y-5 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }}
              aria-hidden="true"
            />
            <div className="relative z-10 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
                <Zap className="h-4 w-4 text-white fill-white" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">Flash Sales</h2>
                <p className="text-xs text-stone-400">Limited-time offers — grab them before they're gone!</p>
              </div>
            </div>
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {flashSales.slice(0, 4).map((product) => (
                <InlineProductCard key={`flash-${product.id}`} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 2. PERSONALIZED                                                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {personalizedProducts.length > 0 && (
        <section aria-label="Personalized recommendations">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900 tracking-tight">Personalized For You</h2>
              <p className="text-xs text-stone-500">Supplements tailored to your training profile and goals.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {personalizedProducts.slice(0, 4).map((product) => (
              <InlineProductCard key={`personal-${product.id}`} product={product} isRecommended />
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 3. FULL CATALOG                                                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section aria-label="Full product catalog">
        {/* Filter bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="h-4 w-4 text-stone-600" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-black text-stone-900">Full Catalog</h2>
              <p className="text-[11px] text-stone-400">{filteredProducts.length} products</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2" role="search" aria-label="Filter products">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
              <Input
                type="search"
                placeholder="Search catalog..."
                aria-label="Search products"
                className="pl-9 w-48 h-9 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                className={cn(
                  "h-9 pl-3 pr-8 rounded-xl",
                  "bg-stone-50 border border-stone-200",
                  "text-xs text-stone-700 font-medium",
                  "appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400",
                  "transition-all duration-150"
                )}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by category"
              >
                <option value="All">All Categories</option>
                {categories.filter((c) => c !== "All").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-stone-400 pointer-events-none" aria-hidden="true" />
            </div>

            {/* Brand Filter */}
            <div className="relative">
              <select
                className={cn(
                  "h-9 pl-3 pr-8 rounded-xl",
                  "bg-stone-50 border border-stone-200",
                  "text-xs text-stone-700 font-medium",
                  "appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400",
                  "transition-all duration-150"
                )}
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                aria-label="Filter by brand"
              >
                <option value="All">All Brands</option>
                {brands.filter((b) => b !== "All").map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-stone-400 pointer-events-none" aria-hidden="true" />
            </div>

            {/* Active filter chips */}
            {(selectedCategory !== "All" || selectedBrand !== "All" || searchQuery) && (
              <Button
                variant="ghost"
                size="xs"
                className="text-stone-500 hover:text-stone-800 rounded-xl"
                onClick={() => { setSelectedCategory("All"); setSelectedBrand("All"); setSearchQuery(""); }}
                aria-label="Clear all filters"
              >
                <SlidersHorizontal className="h-3 w-3" aria-hidden="true" /> Clear
              </Button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-stone-200" role="status" aria-live="polite">
            <div className="h-16 w-16 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-8 w-8 text-stone-300" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-stone-700 mb-1">No products found</h3>
            <p className="text-sm text-stone-400">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {filteredProducts.map((product) => (
                <InlineProductCard key={`catalog-${product.id}`} product={product} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center pt-10">
                <Button
                  onClick={handleLoadMore}
                  loading={isMoreLoading}
                  variant="outline"
                  size="lg"
                  className="rounded-xl font-semibold px-8"
                  aria-label="Load more products"
                >
                  {!isMoreLoading && <><ChevronDown className="h-4 w-4" aria-hidden="true" /> Load More</>}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
