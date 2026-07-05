"use client";

import Link from "next/link";
import {
  ArrowRight,
  Clock,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Zap,
  Leaf,
  FlaskConical,
  Package,
  Dumbbell,
  Pill,
  Heart,
  Droplet,
} from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { useEffect, useState } from "react";
import { api } from "@/src/components/auth/axiosInstance";
import { toast } from "sonner";
import { ProductCard } from "@/src/components/products/ProductCard";
import { cn } from "@/src/lib/utils";
import { useCartStore } from "@/src/components/store/cartStore";

const getCategoryIcon = (categoryName: string) => {
  const nameLower = (categoryName || "").toLowerCase();
  if (nameLower.includes("protein") || nameLower.includes("whey") || nameLower.includes("mass")) {
    return Dumbbell;
  }
  if (nameLower.includes("creatine") || nameLower.includes("strength") || nameLower.includes("workout")) {
    return FlaskConical;
  }
  if (nameLower.includes("vitamin") || nameLower.includes("health") || nameLower.includes("wellness") || nameLower.includes("omega")) {
    return Heart;
  }
  if (nameLower.includes("hydrat") || nameLower.includes("electrolyte")) {
    return Droplet;
  }
  if (nameLower.includes("pill") || nameLower.includes("capsule") || nameLower.includes("supplement")) {
    return Pill;
  }
  return Package;
};

// ─── Interfaces (unchanged) ────────────────────────────────────────────────
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

// ─── Skeleton Components ───────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
      <div className="skeleton aspect-square" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-1/2 rounded-lg" />
        <div className="skeleton h-4 w-full rounded-lg" />
        <div className="skeleton h-4 w-3/4 rounded-lg" />
        <div className="skeleton h-9 w-full rounded-xl mt-2" />
      </div>
    </div>
  );
}

function SkeletonCategory({ wide = false }: { wide?: boolean }) {
  return (
    <div
      className={cn(
        "skeleton rounded-3xl",
        wide ? "md:col-span-2 min-h-[280px]" : "min-h-[200px]"
      )}
    />
  );
}

// ─── Page Component ────────────────────────────────────────────────────────
export default function Home() {
  const [flashSales, setFlashSales] = useState<FlashSaleProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Data fetching (logic unchanged) ──────────────────────────────────────
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoading(true);

        api.get("/Products/flash-sales")
          .then((res) => setFlashSales(res.data?.slice(0, 4) || []))
          .catch(() => console.warn("No flash sales found."));

        api.get("/Categories")
          .then((res) => setCategories(res.data?.slice(0, 3) || []))
          .catch(() => console.warn("No categories found."));

        api.get("/Products", { params: { pageNumber: 1, pageSize: 8 } })
          .then((res) => setFeaturedProducts(res.data || []))
          .catch(() => console.warn("No products found."));
      } catch {
        toast.error("Failed to load some home page data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short" });

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
      toast.error("Failed to add to cart");
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50">
        {/* Hero skeleton */}
        <div className="container-xl pt-8 pb-6">
          <div className="skeleton rounded-3xl min-h-[460px] md:min-h-[520px]" />
        </div>
        {/* Trust bar skeleton */}
        <div className="container-xl pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-20 rounded-2xl" />
            ))}
          </div>
        </div>
        {/* Categories skeleton */}
        <div className="container-xl py-8">
          <div className="skeleton h-8 w-48 rounded-lg mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonCategory wide />
            <SkeletonCategory />
            <SkeletonCategory />
          </div>
        </div>
        {/* Products skeleton */}
        <div className="container-xl py-8">
          <div className="skeleton h-8 w-48 rounded-lg mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900" dir="ltr">

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 1. HERO                                                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="container-xl pt-6 pb-4" aria-label="Hero">
        <div className="relative rounded-3xl overflow-hidden min-h-[460px] md:min-h-[520px] flex items-end">

          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1400&q=80')`,
            }}
            aria-hidden="true"
          />

          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(120deg, rgba(6,78,59,0.92) 0%, rgba(6,78,59,0.70) 45%, rgba(28,25,23,0.20) 100%)",
            }}
            aria-hidden="true"
          />

          {/* Floating geometric accent */}
          <div
            className="absolute right-8 top-8 h-48 w-48 rounded-full border border-white/10 opacity-30 hidden md:block animate-float"
            aria-hidden="true"
          />
          <div
            className="absolute right-16 top-16 h-24 w-24 rounded-full border border-white/15 opacity-40 hidden md:block animate-float delay-300"
            aria-hidden="true"
          />

          {/* Content */}
          <div className="relative z-10 p-8 md:p-14 max-w-2xl animate-fade-up">
            <Badge variant="glass" className="mb-5 text-white border-white/30 text-xs font-semibold tracking-wide">
              <Leaf className="h-3 w-3 text-emerald-300" aria-hidden="true" />
              Science-Backed Nutrition
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] mb-4">
              Fuel Your Best
              <br />
              <span className="text-emerald-300">Performance.</span>
            </h1>

            <p className="text-stone-300 text-base md:text-lg leading-relaxed mb-8 max-w-md">
              Clinically formulated supplements for every goal. Precision nutrition trusted by athletes worldwide.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="primary" size="lg" className="rounded-xl font-bold shadow-lg">
                <Link href="/products">
                  Shop Now <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="rounded-xl text-white hover:bg-white/15 font-semibold border border-white/20"
              >
                <Link href="/categories">Browse Categories</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 2. TRUST STRIP                                                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="container-xl py-6" aria-label="Trust features">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Truck,
              title: "Fast Nationwide Delivery",
              desc: "Orders shipped within 24 hours",
              color: "emerald",
            },
            {
              icon: ShieldCheck,
              title: "100% Authentic Products",
              desc: "Every product is verified original",
              color: "emerald",
            },
            {
              icon: FlaskConical,
              title: "Clinically Tested",
              desc: "Third-party lab tested for purity",
              color: "emerald",
            },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="bg-white border border-stone-200 rounded-2xl p-5 flex items-center gap-4 hover-lift"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Icon className="h-5 w-5 text-emerald-600" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 text-sm">{title}</h3>
                <p className="text-xs text-stone-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 3. CATEGORIES                                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="container-xl py-12" aria-label="Shop by category">
          <div className="flex items-end justify-between mb-7">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">
                Collections
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
                Shop by Category
              </h2>
            </div>
            <Link
              href="/categories"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-stone-600 hover:text-emerald-600 transition-colors"
              aria-label="View all categories"
            >
              View all <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((category, index) => {
              const Icon = getCategoryIcon(category.name);
              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className={cn(
                    "relative rounded-3xl overflow-hidden group block cursor-pointer p-6",
                    "bg-white border border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-0.5",
                    "transition-all duration-300 flex flex-col justify-between min-h-[180px] md:min-h-[200px]"
                  )}
                  aria-label={`Browse ${category.name}`}
                >
                  {/* Icon badge */}
                  <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 group-hover:border-emerald-600 transition-all duration-300">
                    <Icon
                      className="h-6 w-6 text-emerald-600 group-hover:text-white transition-colors duration-300"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Content */}
                  <div className="mt-6 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-lg font-black text-stone-900 mb-1">
                        {category.name}
                      </h3>
                      <p className="text-xs text-stone-500 line-clamp-1">
                        {category.description}
                      </p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-stone-100 group-hover:bg-emerald-600 flex items-center justify-center transition-all duration-200 flex-shrink-0">
                      <ArrowRight
                        className="h-3.5 w-3.5 text-stone-600 group-hover:text-white transition-colors duration-200"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 4. FEATURED PRODUCTS                                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {featuredProducts.length > 0 && (
        <section className="container-xl py-12" aria-label="Featured products">
          <div className="flex items-end justify-between mb-7">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">
                Top Picks
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
                Featured Products
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-stone-600 hover:text-emerald-600 transition-colors"
              aria-label="Browse full catalog"
            >
              Browse all <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-8 flex justify-center sm:hidden">
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link href="/products">Browse all products <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
            </Button>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 5. FLASH SALES                                                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {flashSales.length > 0 && (
        <section className="container-xl py-12" aria-label="Flash sales and clearance">
          <div className="bg-stone-900 rounded-3xl p-7 md:p-10 relative overflow-hidden">
            {/* Subtle grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
              aria-hidden="true"
            />

            {/* Glow accent */}
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl"
              style={{ background: "#f97316" }}
              aria-hidden="true"
            />

            {/* Header */}
            <div className="relative z-10 flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-lg bg-orange-500 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-white fill-white" aria-hidden="true" />
                  </div>
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
                    Limited Time
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  Flash Sales & Clearance
                </h2>
                <p className="text-stone-400 text-sm mt-1">
                  Expiring soon — huge savings on top supplements.
                </p>
              </div>
              <Link
                href="/flash-sales"
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-semibold hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-200"
                aria-label="View all flash sale deals"
              >
                All Deals <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            {/* Flash Sale Cards */}
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {flashSales.map((product) => (
                <div
                  key={product.id}
                  className="bg-stone-800/60 backdrop-blur-sm border border-stone-700/50 rounded-2xl overflow-hidden group hover:border-orange-500/40 hover:bg-stone-800 transition-all duration-200"
                >
                  {/* Image */}
                  <div className="relative h-32 bg-stone-900/50 flex items-center justify-center p-4">
                    <Badge variant="orange-solid" className="absolute top-2 left-2 text-[10px] font-black">
                      -{product.savingsPercentage.toFixed(0)}%
                    </Badge>
                    <img
                      src={product.imageUrl || "/placeholder.png"}
                      alt={product.name}
                      loading="lazy"
                      className="h-full object-contain mix-blend-luminosity group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-2.5">
                    <h4 className="text-xs font-semibold text-white line-clamp-2 leading-snug min-h-[2rem]">
                      {product.name}
                    </h4>

                    {/* Prices */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-orange-400">
                        ${product.discountPrice.toFixed(2)}
                      </span>
                      <span className="text-xs text-stone-500 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    </div>

                    {/* Expiry */}
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-stone-400">
                      <Clock className="h-2.5 w-2.5 flex-shrink-0" aria-hidden="true" />
                      Exp: {formatDate(product.expiryDate)}
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stockQuantity <= 0}
                      aria-label={
                        product.stockQuantity > 0
                          ? `Add ${product.name} to cart`
                          : `${product.name} is sold out`
                      }
                      className={cn(
                        "w-full flex items-center justify-center gap-1.5",
                        "h-8 rounded-xl text-[11px] font-bold",
                        "transition-all duration-150",
                        product.stockQuantity > 0
                          ? "bg-orange-500 hover:bg-orange-400 text-white"
                          : "bg-stone-700 text-stone-500 cursor-not-allowed"
                      )}
                    >
                      {product.stockQuantity > 0 ? (
                        <><ShoppingCart className="h-3 w-3" aria-hidden="true" /> Add to Cart</>
                      ) : (
                        "Sold Out"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* 6. VALUE PROPOSITION STRIP                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="container-xl py-12" aria-label="Brand values">
        <div className="bg-emerald-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.2) 75%)",
              backgroundSize: "40px 40px",
            }}
            aria-hidden="true"
          />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
                Ready to reach your goals?
              </h2>
              <p className="text-emerald-100 text-base max-w-md">
                Join thousands of athletes who trust SH Supplements for clinically precise nutrition.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl flex-shrink-0 shadow-lg"
            >
              <Link href="/products">
                Start Shopping <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}