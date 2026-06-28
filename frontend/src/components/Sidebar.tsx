"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Grid,
  Calculator,
  ShoppingCart,
  User,
  TrendingUp,
  ShoppingBag,
  Dumbbell,
  Settings,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const NAV_ITEMS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Categories", href: "/categories", icon: Grid },
  { name: "BMI Tool", href: "/bmi", icon: Calculator },
  { name: "Cart", href: "/cart", icon: ShoppingCart },
  { name: "Progress", href: "/progress", icon: TrendingUp },
  { name: "Orders", href: "/orders", icon: ShoppingBag },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div
      className="w-64 min-h-screen bg-[#0044CC] text-white flex flex-col justify-between py-6 font-sans select-none"
      dir="ltr"
    >
      {/* Brand Header */}
      <div className="px-6 space-y-1">
        <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <Dumbbell className="h-6 w-6 rotate-[-45deg]" />
          <span>SH-Supplements</span>
        </div>
        <p className="text-xs text-blue-200/80 font-medium pl-8">
          Elite Performance
        </p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 mt-10 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-4 px-4 py-3 rounded-md text-sm font-medium transition-all relative overflow-hidden",
                isActive
                  ? "bg-white/10 text-white font-semibold"
                  : "text-blue-100 hover:bg-white/5 hover:text-white",
              )}
            >
              {/* Active Orange Border Line Accent */}
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#FF6600] rounded-r-md" />
              )}

              {/* Icon */}
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform group-hover:scale-105",
                  isActive ? "text-white" : "text-blue-200",
                )}
              />

              {/* Route Name */}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Static Info if needed */}
      <div className="px-6 pt-4 border-t border-white/10 text-[10px] text-blue-200/60">
        © 2026 SH-Supplements App
      </div>
    </div>
  );
}
