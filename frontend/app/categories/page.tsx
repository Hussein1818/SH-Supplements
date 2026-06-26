"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Layers,
  Activity,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ALL_CATEGORIES = [
  {
    slug: "protein-recovery",
    title: "Protein & Recovery",
    description:
      "Essential whey proteins, isolates, and post-workout amino acids to rebuild muscle.",
    count: "42 Products",
    icon: Activity,
    bgClass: "from-blue-600 to-[#0044CC]",
  },
  {
    slug: "pre-workout-energy",
    title: "Pre-Workout & Energy",
    description:
      "Explosive energy boosters, pumps, and endurance enhancers for intense sessions.",
    count: "28 Products",
    icon: Sparkles,
    bgClass: "from-orange-500 to-[#FF6600]",
  },
  {
    slug: "nootropics-focus",
    title: "Nootropics & Focus",
    description:
      "Clinical formulas for sharp mental clarity, cognitive endurance, and deep focus.",
    count: "15 Products",
    icon: Layers,
    bgClass: "from-indigo-600 to-indigo-800",
  },
  {
    slug: "vitamins-health",
    title: "Vitamins & Daily Health",
    description:
      "Premium multivitamins, fish oils, and joint support engineered for elite athletes.",
    count: "31 Products",
    icon: ShieldAlert,
    bgClass: "from-emerald-600 to-emerald-800",
  },
];

export default function CategoriesPage() {
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

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ALL_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.slug}
              className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col justify-between items-start space-y-6 hover:shadow-md transition-shadow group relative overflow-hidden"
            >
              <div className="space-y-4">
                {/* Icon Wrapper */}
                <div
                  className={`p-3 rounded-lg bg-gradient-to-br ${cat.bgClass} text-white w-max`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">
                      {cat.title}
                    </h2>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                      {cat.count}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>

              <Link href={`/catalog/${cat.slug}`} className="w-full">
                <Button className="w-full bg-gray-50 hover:bg-[#0044CC] text-gray-700 hover:text-white border border-gray-100 font-medium transition-all flex items-center justify-center gap-2 group-hover:border-[#0044CC]/20">
                  Browse Category{" "}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
