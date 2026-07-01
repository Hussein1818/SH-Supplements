"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/src/components/auth/axiosInstance";
import { ProductCard } from "@/src/components/products/ProductCard";
import { Button } from "@/src/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function CategoryProductsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 8;

  useEffect(() => {
    async function fetchProducts() {
      if (!id) return;
      try {
        setIsLoading(true);
        const res = await api.get(`/Products`, {
          params: { categoryId: id, pageNumber, pageSize },
        });
        setProducts(res.data);
        setHasMore(res.data.length === pageSize);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [id, pageNumber]);

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8" dir="ltr">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          className="rounded-full h-10 w-10 p-0"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-black text-gray-900">
          Category Collection
        </h1>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#0044CC]" />
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <div className="flex justify-center items-center gap-6 pt-10 border-t">
            <Button
              variant="outline"
              disabled={pageNumber === 1}
              onClick={() => setPageNumber((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Prev
            </Button>
            <span className="font-black text-[#0044CC]">Page {pageNumber}</span>
            <Button
              variant="outline"
              disabled={!hasMore}
              onClick={() => setPageNumber((p) => p + 1)}
            >
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-24 bg-gray-50 rounded-3xl">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="font-black text-xl">No products found</h3>
        </div>
      )}
    </div>
  );
}
