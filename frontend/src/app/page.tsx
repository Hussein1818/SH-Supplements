"use client";

import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

// --- Mock Data ---
const CATEGORIES = [
  {
    id: "protein",
    title: "Protein & Recovery",
    description: "Post-workout essentials",
    image:
      "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=500&q=80",
    size: "large",
  },
  {
    id: "pre-workout",
    title: "Pre-Workout Energy",
    description: "Explosive Power",
    image:
      "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&q=80",
    size: "small",
  },
  {
    id: "nootropics",
    title: "Nootropics & Focus",
    description: "Mental Clarity",
    isBlueBg: true,
    size: "small",
  },
];

const CLEARANCE_PRODUCTS = [
  {
    id: 1,
    name: "Whey Protein Isolate - Vanilla",
    brand: "Optimum Stack",
    price: 29.99,
    originalPrice: 49.99,
    discount: "-40%",
    expiry: "Exp: Oct 2026",
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&q=80",
  },
  {
    id: 2,
    name: "Focus Capsules (90ct)",
    brand: "NeuroDrive",
    price: 14.5,
    originalPrice: 29.0,
    discount: "-50%",
    expiry: "Exp: Sept 2026",
    image:
      "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&q=80",
  },
  {
    id: 3,
    name: "Liquid BCAA - Blue Razz",
    brand: "Recovery Core",
    price: 21.0,
    originalPrice: 30.0,
    discount: "-30%",
    expiry: "Exp: Nov 2026",
    image:
      "https://images.unsplash.com/photo-1626245940355-321fa5b03515?w=300&q=80",
  },
  {
    id: 4,
    name: "Creatine Monohydrate (500g)",
    brand: "Pure Form",
    price: 12.0,
    originalPrice: 39.0,
    discount: "-70%",
    expiry: "Exp: Aug 2026",
    image:
      "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=300&q=80",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F9F9F9] text-gray-900 font-sans antialiased pb-12">
      {/* 1. Hero Section */}
      <header className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <div className="relative bg-gradient-to-r from-gray-100 via-gray-50 to-orange-100 rounded-xl overflow-hidden min-h-[380px] flex items-center border border-gray-100 shadow-sm">
          <div
            className="absolute inset-0 z-0 opacity-40 bg-cover bg-center md:opacity-100 mix-blend-multiply"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&q=80')`,
            }}
          />

          <div className="relative z-10 max-w-xl p-8 md:p-12 space-y-4">
            <Badge className="bg-[#FF6600]/10 text-[#FF6600] hover:bg-[#FF6600]/10 font-semibold border border-[#FF6600]/20">
              New Arrival
            </Badge>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-300 tracking-tight leading-tight">
              Fuel Your Ambition.
              <br />
              <span className="text-[#FF6600]">Precision Engineered.</span>
            </h1>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              Discover the next generation of performance nutrition. Formulated
              with clinical precision to support your peak potential.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Button className="bg-[#FF6600] hover:bg-[#E05500] text-white px-6 font-medium rounded-md">
                Shop The Stack →
              </Button>
              <Button
                variant="outline"
                className="border-gray-300 hover:bg-gray-100 font-medium text-gray-700 bg-white/80"
              >
                View Science
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Shop by Category */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-12 space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">
              Shop by Category
            </h2>
            <p className="text-xs text-gray-500">
              Targeted solutions for specific goals.
            </p>
          </div>
          <Link
            href="/categories"
            className="text-xs font-semibold text-[#0044CC] hover:underline flex items-center gap-0.5"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Large Card: Protein */}
          <div className="md:col-span-2 relative bg-gray-900 rounded-xl overflow-hidden min-h-[260px] group border border-gray-100 shadow-sm flex items-end">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-70 group-hover:scale-105 transition-transform duration-500"
              style={{ backgroundImage: `url('${CATEGORIES[0].image}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="relative z-10 p-6 w-full flex justify-between items-end">
              <div className="text-white">
                <h3 className="text-lg font-bold">{CATEGORIES[0].title}</h3>
                <p className="text-xs text-gray-300">
                  {CATEGORIES[0].description}
                </p>
              </div>
              <Button
                size="icon"
                className="bg-[#FF6600] hover:bg-[#E05500] text-white rounded-md h-8 w-8"
              >
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right Column Stack */}
          <div className="grid grid-rows-2 gap-4">
            {/* Pre-Workout */}
            <div className="relative bg-gray-900 rounded-xl overflow-hidden group border border-gray-100 shadow-sm flex items-end">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-500"
                style={{ backgroundImage: `url('${CATEGORIES[1].image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="relative z-10 p-4">
                <h3 className="text-sm font-bold text-white">
                  {CATEGORIES[1].title}
                </h3>
                <p className="text-[11px] text-gray-300">
                  {CATEGORIES[1].description}
                </p>
              </div>
            </div>

            {/* Nootropics (Blue Solid UI Bg) */}
            <div className="bg-[#0044CC] rounded-xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden group border border-blue-700">
              <div className="absolute right-[-20px] bottom-[-20px] text-white/5 opacity-10 group-hover:scale-110 transition-transform duration-300">
                <svg
                  width="120"
                  height="120"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                </svg>
              </div>
              <div>
                <span className="text-xl">🧠</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {CATEGORIES[2].title}
                </h3>
                <p className="text-[11px] text-blue-100">
                  {CATEGORIES[2].description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Near-Expiry Clearance */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-12">
        <div className="bg-[#FAF6F0] border border-[#FF6600]/10 rounded-xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#FF6600] flex items-center gap-2">
                <Clock className="h-5 w-5" /> Near-Expiry Clearance
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                High-performance supplements at clinical precision prices.
                Expiring soon.
              </p>
            </div>
            {/* Countdown Box */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <span className="text-gray-400 font-normal">Ends in:</span>
              <span className="bg-white px-2 py-1 border border-orange-200 rounded text-red-500 shadow-sm"></span>
              :
              <span className="bg-white px-2 py-1 border border-orange-200 rounded text-red-500 shadow-sm"></span>
              :
              <span className="bg-white px-2 py-1 border border-orange-200 rounded text-red-500 shadow-sm"></span>
            </div>
          </div>

          {/* Clearance Grid Products */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CLEARANCE_PRODUCTS.map((product) => (
              <Card
                key={product.id}
                className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden flex flex-col justify-between group"
              >
                <CardContent className="p-3 relative flex-1 flex flex-col justify-between space-y-3">
                  {/* Badge & Image */}
                  <div>
                    <Badge className="absolute top-3 left-3 bg-red-600 hover:bg-red-600 text-white font-bold text-[10px] px-1.5 py-0.5 z-10 rounded">
                      {product.discount}
                    </Badge>
                    <div className="w-full h-32 bg-gray-50 rounded-md overflow-hidden relative mb-2">
                      {/* <Image 
                            src={product.image} 
                            alt={product.name} 
                            fill 
                            className="object-contain p-2 mix-blend-multiply group-hover:scale-105 transition-transform duration-300" 
                          /> */}
                    </div>
                    <span className="text-[10px] text-gray-400 block font-medium uppercase tracking-wider">
                      {product.brand}
                    </span>
                    <h4 className="text-xs font-bold text-gray-900 line-clamp-2 mt-0.5 min-h-[32px]">
                      {product.name}
                    </h4>
                  </div>

                  {/* Pricing & Footer Actions */}
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-extrabold text-[#0044CC]">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-gray-400 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded block w-max border border-red-100">
                      📅 {product.expiry}
                    </span>
                    <Button className="w-full bg-[#0044CC] hover:bg-[#0033AA] text-white text-xs py-1.5 h-8 rounded-md font-medium transition-all">
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
