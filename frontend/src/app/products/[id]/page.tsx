"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/src/components/auth/axiosInstance";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  ShoppingCart,
  ArrowLeft,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Sparkles,
  Package,
  Globe,
  Flame,
} from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/src/components/store/cartStore";
import { useAuthStore } from "@/src/components/store/authStore";
import { toast } from "sonner";
import { ProductCard } from "@/src/components/products/ProductCard";
import { cn, formatPrice, normalizeImageUrl } from "@/src/lib/utils";

// ─── Interfaces (unchanged) ────────────────────────────────────────────────
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
  category: { id: string; name: string };
  brand: { id: string; name: string; countryOfOrigin: string };
  images: ProductImage[];
}

// ─── Skeleton ──────────────────────────────────────────────────────────────
function SkeletonDetail() {
  return (
    <div className="container-xl py-8 space-y-8" dir="ltr">
      <div className="skeleton h-4 w-32 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="skeleton rounded-3xl aspect-square" />
        <div className="space-y-5 py-4">
          <div className="skeleton h-4 w-1/2 rounded-lg" />
          <div className="skeleton h-10 w-3/4 rounded-lg" />
          <div className="skeleton h-8 w-1/3 rounded-lg" />
          <div className="skeleton h-24 w-full rounded-2xl" />
          <div className="skeleton h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function SingleProductPage() {
  const { id } = useParams();
  const [product,      setProduct]      = useState<Product | null>(null);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isAdding,     setIsAdding]     = useState(false);
  const [activeImage,  setActiveImage]  = useState<string>("");

  const addItem     = useCartStore((state) => state.addItem);
  const accessToken = useAuthStore((state) => state.accessToken);
  const router      = useRouter();

  // ── Cart handler (logic unchanged) ────────────────────────────────────────
  const handleAddToCart = async () => {
    if (!accessToken) {
      toast.error("Please sign in to add products to your cart.", {
        action: {
          label: "Sign in",
          onClick: () => router.push("/login"),
        },
      });
      return;
    }
    if (!product || isAdding) return;
    const activePrice = product.discountPrice ? product.discountPrice : product.price;
    const mainImg = product.images?.find((img) => img.isMainImage)?.imageUrl || "";
    setIsAdding(true);
    addItem({
      id: product.id, productId: product.id,
      productName: product.name, unitPrice: activePrice,
      quantity: 1, productImageUrl: mainImg,
    });
    try {
      await api.post(`/Carts/add`, { productId: product.id, quantity: 1 });
      await useCartStore.getState().fetchCart();
      toast.success("Added to Cart!");
    } catch {
      toast.error("Failed to sync with server");
    } finally {
      setIsAdding(false);
    }
  };

  // ── Data fetching (logic unchanged) ──────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    async function fetchProduct() {
      try {
        const response = await api.get(`/Products/${id}`);
        setProduct(response.data);
        const main = response.data.images?.find((img: ProductImage) => img.isMainImage)?.imageUrl
          || response.data.images?.[0]?.imageUrl;
        setActiveImage(main || "");
      } catch {
        console.error("Failed to load product details");
      } finally {
        setIsLoading(false);
      }
    }
    async function fetchAlternatives() {
      try {
        const response = await api.get(`/Products/${id}/alternatives`);
        setAlternatives(response.data || []);
      } catch {
        console.error("Failed to load alternatives");
      }
    }
    fetchProduct();
    fetchAlternatives();
  }, [id]);

  if (isLoading) return <SkeletonDetail />;

  if (!product) {
    return (
      <div className="container-xl py-24 text-center" dir="ltr">
        <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Package className="h-8 w-8 text-red-300" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-bold text-stone-900 mb-2">Product not found</h1>
        <p className="text-stone-500 text-sm mb-6">This product may have been removed or is unavailable.</p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/products"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Products</Link>
        </Button>
      </div>
    );
  }

  const displayImage = activeImage
    || product.images?.find((img) => img.isMainImage)?.imageUrl
    || product.images?.[0]?.imageUrl;

  const hasDiscount = product.discountPrice != null && product.discountPrice > 0;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;
  const inStock = product.stockQuantity > 0;

  const STATS = [
    { label: "Flavor",   value: product.flavor   || "N/A" },
    { label: "Servings", value: product.servings  || "N/A" },
    { label: "Brand",    value: product.brand?.name || "N/A" },
    { label: "Origin",   value: product.brand?.countryOfOrigin || "N/A" },
  ];

  return (
    <div className="min-h-screen bg-stone-50" dir="ltr">
      <div className="container-xl py-8 space-y-12">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-emerald-600 transition-colors font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to Products
          </Link>
        </nav>

        {/* ── Product Grid ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">

          {/* Left — Image Panel */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative bg-white border border-stone-200 rounded-3xl overflow-hidden aspect-square flex items-center justify-center shadow-sm">
              {hasDiscount && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge variant="orange-solid" className="font-black text-sm px-2.5 py-1 shadow">
                    -{discountPct}%
                  </Badge>
                </div>
              )}
              {displayImage ? (
                <img
                  src={normalizeImageUrl(displayImage)}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain p-8 mix-blend-multiply"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-stone-300">
                  <Package className="h-16 w-16" aria-hidden="true" />
                  <span className="text-sm">No image</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Product images">
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    role="tab"
                    aria-selected={activeImage === img.imageUrl}
                    aria-label="Select product image"
                    onClick={() => setActiveImage(img.imageUrl)}
                    className={cn(
                      "h-16 w-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all",
                      activeImage === img.imageUrl
                        ? "border-emerald-500 shadow-sm"
                        : "border-stone-200 hover:border-stone-300"
                    )}
                  >
                    <img src={normalizeImageUrl(img.imageUrl)} alt="" className="h-full w-full object-contain p-1 mix-blend-multiply" aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — Info Panel */}
          <div className="flex flex-col justify-start space-y-6 py-2">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="emerald" className="font-semibold">
                {product.brand?.name}
                {product.brand?.countryOfOrigin && (
                  <><Globe className="h-3 w-3 ml-1" aria-hidden="true" /> {product.brand.countryOfOrigin}</>
                )}
              </Badge>
              <Badge variant="stone" className="font-semibold">
                {product.category?.name}
              </Badge>
            </div>

            {/* Name + Price */}
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight leading-tight mb-4">
                {product.name}
              </h1>

              <div className="flex items-end gap-3">
                {hasDiscount ? (
                  <>
                    <span className="text-4xl font-black text-stone-900">
                      {formatPrice(product.discountPrice)}
                    </span>
                    <span className="text-xl text-stone-400 line-through font-medium mb-1">
                      {formatPrice(product.price)}
                    </span>
                    <Badge variant="orange-solid" className="font-bold mb-1">
                      Save {discountPct}%
                    </Badge>
                  </>
                ) : (
                  <span className="text-4xl font-black text-stone-900">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
            </div>

            {/* Stock status */}
            <div
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold w-fit",
                inStock
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              )}
              role="status"
              aria-label={inStock ? `In stock: ${product.stockQuantity} available` : "Out of stock"}
            >
              {inStock ? (
                <><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> In Stock ({product.stockQuantity} available)</>
              ) : (
                <><XCircle className="h-4 w-4" aria-hidden="true" /> Out of Stock</>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 py-4 border-y border-stone-200">
              {STATS.map(({ label, value }) => (
                <div key={label} className="space-y-0.5">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-semibold text-stone-800">{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-stone-600 leading-relaxed">{product.description}</p>
            )}

            {/* Add to Cart */}
            <Button
              size="xl"
              variant={inStock ? "primary" : "secondary"}
              className="w-full md:w-auto rounded-xl font-bold shadow-sm"
              onClick={handleAddToCart}
              loading={isAdding}
              disabled={!inStock}
              aria-label={inStock ? `Add ${product.name} to cart` : "Out of stock"}
            >
              {!isAdding && <ShoppingCart className="h-5 w-5" aria-hidden="true" />}
              {inStock ? "Add to Cart" : "Out of Stock"}
            </Button>

            {/* Ingredients & Warnings */}
            <div className="space-y-3">
              {product.ingredients && (
                <details className="group bg-stone-50 border border-stone-200 rounded-2xl overflow-hidden">
                  <summary className="flex items-center gap-3 p-4 cursor-pointer list-none select-none hover:bg-stone-100 transition-colors">
                    <Info className="h-4 w-4 text-stone-500 flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm font-semibold text-stone-800">Ingredients</span>
                    <Flame className="h-3.5 w-3.5 text-stone-300 ml-auto group-open:rotate-180 transition-transform" aria-hidden="true" />
                  </summary>
                  <div className="px-4 pb-4 pt-0">
                    <p className="text-sm text-stone-600 leading-relaxed">{product.ingredients}</p>
                  </div>
                </details>
              )}

              {product.warnings && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
                  <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <h3 className="text-sm font-bold text-red-900 mb-1">Warnings</h3>
                    <p className="text-sm text-red-700 leading-relaxed">{product.warnings}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Alternatives ─────────────────────────────────────────────── */}
        {alternatives.length > 0 && (
          <section aria-label="Recommended alternatives" className="pt-8 border-t border-stone-200">
            <div className="flex items-center gap-2.5 mb-7">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-black text-stone-900 tracking-tight">You Might Also Like</h2>
                <p className="text-xs text-stone-400">Similar alternatives for your goals</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {alternatives.map((alt) => (
                <ProductCard key={alt.id} product={alt} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
