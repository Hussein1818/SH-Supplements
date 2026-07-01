"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/src/components/auth/axiosInstance";
import {
  Loader2,
  Zap,
  Dumbbell,
  Flame,
  HeartPulse,
  Pill,
  BotMessageSquare,
} from "lucide-react";

const categoryIcons: any = {
  Vitamins: <Pill className="w-8 h-8 text-blue-500" />,
  Protein: <Zap className="w-8 h-8 text-orange-500" />,
  Fitness: <Dumbbell className="w-8 h-8 text-emerald-500" />,
  Burners: <Flame className="w-8 h-8 text-red-500" />,
  Health: <HeartPulse className="w-8 h-8 text-pink-500" />,
  Default: <BotMessageSquare className="w-8 h-8 text-indigo-500" />,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get("/Categories");
        setCategories(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
          Explore Categories
        </h1>
        <p className="text-gray-500 text-lg">
          Find the perfect supplements for your specific goal.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center h-64 items-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#0044CC]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <Link href={`/categories/${cat.id}`} key={cat.id}>
              <div className="group relative bg-white border border-gray-100 p-8 rounded-3xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="mb-6 p-4 bg-gray-50 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                  {categoryIcons[cat.name] || categoryIcons["Default"]}
                </div>

                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  {cat.name}
                </h2>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  {cat.description ||
                    `Discover our premium collection of ${cat.name} supplements designed for your performance.`}
                </p>

                <div className="flex items-center text-[#0044CC] font-bold gap-2 group-hover:gap-4 transition-all">
                  Browse Collection <span aria-hidden="true">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
