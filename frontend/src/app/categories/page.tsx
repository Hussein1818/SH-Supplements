"use client";

import Link from "next/link";
import {
  ArrowRight,
  Layers,
  Activity,
  ShieldAlert,
  Sparkles,
  Icon,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useEffect, useState } from "react";
import { api } from "@/src/components/auth/axiosInstance";
import { toast } from "sonner";

const BASE_URL = "https://sh-supplements.runasp.net";

interface Category {
  id: string;
  name: string;
  description?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await api.get(`${BASE_URL}/api/Categories`);
        setCategories(response.data);
      } catch (error: any) {
        toast.error("Failed to fetch categories", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div className="space-y-8" dir="ltr">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Product Catalog
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Explore our premium selection by targeted training goals.
        </p>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="text-gray-500 font-medium">Loading categories...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gray-50 rounded-xl">
                  <Layers className="w-6 h-6 text-gray-800" />
                </div>
                <h2 className="font-bold text-lg text-gray-900">
                  {category.name}
                </h2>
              </div>

              <p className="text-sm text-gray-500 mb-6 line-clamp-2">
                {category.description ||
                  "Premium supplements to support your fitness journey."}
              </p>

              <Button asChild variant="outline" className="w-full rounded-xl">
                <Link href={`/categories/${category.id}`}>
                  View Products <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
